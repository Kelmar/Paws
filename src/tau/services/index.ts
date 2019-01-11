/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { IContainer, Type, identifier, Lifetime, IScope } from 'lepton-di';

import { ENVIRONMENT_INFO, ElectronSupport } from '../common/startup';
import { LogManager } from "../../common/logging";
import { ipcMain, WebContents, ipcRenderer } from "electron";

/* ================================================================================================================= */
/**
 * Defines where a service runs locallay.
 * 
 * This is used by the ServiceManager to figure out if it needs to send a service request to a remote endpoint or
 * to use a local endpoint.
 */
export enum ServiceTarget
{
    /** Service can run server side. */
    Server   = 0x01,

    /** Service can run on a browser */
    Browser  = 0x02,

    /** Service can run on any Electron main process. */
    Main     = 0x04,

    /** Service can run on an Electron renderer process. */
    Renderer = 0x08,

    /** Service can run on any target. */
    Any      = 0xFF
}

/* ================================================================================================================= */

const SERVICE_METADATA: unique symbol = Symbol("tau:service:descriptor");
const RPC_PREFIX: string = 'tau:rpc:';

/* ================================================================================================================= */

function getServiceDescriptor(target: any): ServiceDescriptor
{
    let descriptor = Reflect.getOwnMetadata(SERVICE_METADATA, target) as ServiceDescriptor;

    if (descriptor == null)
        descriptor = new ServiceDescriptor();

    return descriptor;
}

/* ================================================================================================================= */

class EndpointDescriptor
{
    constructor (public readonly name: string, public readonly method: Function, public readonly parent: ServiceDescriptor)
    {
    }

    public get channel(): string
    {
        return this.parent.channel + "." + this.name;
    }
}

/* ================================================================================================================= */

class ServiceDescriptor
{
    public name: identifier = null;
    public type: Type<any>;

    public targets: ServiceTarget;

    public endpoints: EndpointDescriptor[] = [];

    public addEndpoint(name: string, fn: Function): void
    {
        this.endpoints.push(new EndpointDescriptor(name, fn, this));
    }

    public get channel(): string
    {
        return RPC_PREFIX + this.name.toString();
    }
}

/* ================================================================================================================= */
/**
 * Indicates the current level of service support for this script.
 */
export const SERVICE_TARGET: ServiceTarget = (() =>
{
    if (!ENVIRONMENT_INFO.isNode)
        return ServiceTarget.Browser;

    switch (ENVIRONMENT_INFO.electron)
    {
    case ElectronSupport.Main:
        return ServiceTarget.Main;

    case ElectronSupport.Render:
        return ServiceTarget.Renderer;

    case ElectronSupport.None:
    default:
        return ServiceTarget.Server;
    }
})();

/* ================================================================================================================= */

let g_services: Map<identifier, ServiceDescriptor> = new Map();

const log = LogManager.getLogger('tau:services');

/* ================================================================================================================= */
/**
 * Registers a class as a service provider.
 *
 * @param name The name of the service the class provides.
 */
export function service<T>(name: identifier, targets: ServiceTarget): any
{
    if (name == null)
        throw new Error("Service name is required.");

    if (targets == 0)
        throw new Error("A service target is required.");

    return function (type: Type<T>): void
    {
        let srvcDescriptor = getServiceDescriptor(type.prototype);
        srvcDescriptor.name = name;
        srvcDescriptor.type = type;
        srvcDescriptor.targets = targets;

        if ((SERVICE_TARGET & targets) != 0)
        {
            if (g_services.has(name))
            {
                log.warn("Service {serviceName} has already been registered.", { serviceName: name });
                return;
            }

            g_services.set(name, srvcDescriptor);
        }
    }
}

/* ================================================================================================================= */
/**
 * Defines a method as an endpoint for a service provider.
 */
export function endpoint(target: any, name: string, descriptor: PropertyDescriptor): void
{
    let srvcDescriptor = getServiceDescriptor(target);

    srvcDescriptor.addEndpoint(name, descriptor.value);

    Reflect.defineMetadata(SERVICE_METADATA, srvcDescriptor, target);
}

/* ================================================================================================================= */



/* ================================================================================================================= */

class ServicesManager
{
    constructor (container: IContainer, private readonly scope: IScope)
    {
    }

    public initialize(service: ServiceDescriptor)
    {
        
    }
    
    private initMain(service: ServiceDescriptor)
    {
        for (let endpoint of service.endpoints)
            ipcMain.on(endpoint.channel, (event: Event, arg: any) => this.handleMain(endpoint, event, arg));
    }

    private initRenderer(service: ServiceDescriptor)
    {
        for (let endpoint of service.endpoints)
            ipcRenderer.on(endpoint.channel, (event: Event, arg: any) => this.handleRenderer(endpoint, event, arg));
    }

    private handleMain(endpoint: EndpointDescriptor, event: Event, args: any): void
    {
        let responseChannel = endpoint.name + ":return";
        let sender = (event as any).sender as WebContents;

        let service = this.scope.resolve(endpoint.parent.name);
        let prom: Promise<any> = endpoint.method.apply(service, ...(args.args));

        prom.then(x => {
            sender.send(responseChannel, x);

            sender = null;
            event = null;
            prom = null;
        });
    }

    private handleRenderer(endpoint: EndpointDescriptor, event: Event, args: any): void
    {
        
    }
}

/* ================================================================================================================= */

export module services
{
    export function initialize(container: IContainer, ...args: identifier[])
    {
        let idents = new Set<identifier>(args);

        for (let [key, value] of g_services)
        {
            if (idents.has(key))
            {
                log.debug("Service {serviceName} registered to {className}", { serviceName: key, className: value.type.name });

                container
                    .register(key)
                    .toClass(value.type)
                    .with(Lifetime.Singleton);

                for (let endpoint of value.endpoints)
                {
                    ipcMain.on('tau:rpc:' + endpoint.name, () =>
                    {

                    });
                }

                idents.delete(key);
            }
            else
                log.debug("Service {serviceName} not requested, skipping.", { serviceName: key });
        }

        if (idents.size > 0)
        {
            let symbols = Array.from(idents).map(s => s.toString()).join(", ");

            log.warn("Could not locate one or more services: {services}", { services: symbols });
        }
    }
}

/* ================================================================================================================= */
