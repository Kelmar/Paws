/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { IContainer, Type, identifier, Lifetime } from 'lepton-di';

import { ENVIRONMENT_INFO, ElectronSupport } from '../common/startup';
import { LogManager } from "../../common/logging";

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
    constructor (public readonly name: string, public readonly method: Function)
    {
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
        this.endpoints.push(new EndpointDescriptor(name, fn));
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

                idents.delete(key);
            }
            else
                log.debug("Service {serviceName} not requested, skipping.", { serviceName: key });
        }

        if (idents.size > 0)
        {
            log.warn("Could not locate one or more services: {services}", { services: Array.from(idents).join(", ") });
        }
    }
}

/* ================================================================================================================= */
