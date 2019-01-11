/* ================================================================================================================= */
/* ================================================================================================================= */

import { IpcMain, IpcRenderer, WebContents } from "electron";

import "reflect-metadata";

import { IDisposable, Type, maybeDispose } from "lepton-di";

import { ENVIRONMENT_INFO, ElectronSupport } from '../common/startup';
import { ILogger, LogManager } from "common/logging";

/* ================================================================================================================= */

type SourceType = IpcMain | IpcRenderer;
type TargetType = WebContents | IpcRenderer;

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
    All      = 0xFF
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
    public name: string = "";
    public targets: ServiceTarget;

    public instance: any;

    public endpoints: EndpointDescriptor[] = [];

    public addEndpoint(name: string, fn: Function): void
    {
        this.endpoints.push(new EndpointDescriptor(name, fn));
    }
}

/* ================================================================================================================= */

export interface IServiceRegistation
{
    register<T>(instance: T): boolean;
}

export interface IServiceProvider
{
    get<T>(name: string): T;
}

/* ================================================================================================================= */

export class ServiceManager implements IDisposable, IServiceRegistation, IServiceProvider
{
    private readonly log: ILogger = LogManager.getLogger('tau:services');
    private readonly serviceTarget: ServiceTarget;

    private readonly services: Map<string, ServiceDescriptor> = new Map();

    constructor ()
    {
        if (ENVIRONMENT_INFO.isNode)
        {
            switch (ENVIRONMENT_INFO.electron)
            {
            case ElectronSupport.Main:
                this.serviceTarget = ServiceTarget.Main;
                break;

            case ElectronSupport.Render:
                this.serviceTarget = ServiceTarget.Renderer;
                break;

            case ElectronSupport.None:
            default:
                this.serviceTarget = ServiceTarget.Server;
                break;
            }
        }
        else
            this.serviceTarget = ServiceTarget.Browser;

        this.log.info("Service manager loaded with for {serviceTarget}", this);
    }

    public dispose(): void
    {
        for (let name in this.services)
        {
            let descriptor = this.services.get(name);
            maybeDispose(descriptor.instance);
            descriptor.instance = null;
        }

        this.services.clear();
    }

    public register<T>(service: T): boolean
    {
        let target = Object.getPrototypeOf(service);
        let descriptor = getServiceDescriptor(target.prototype);

        if (descriptor == null || descriptor.name == "")
            throw new Error(`${target.name} is not a service, did you forget a decorator?`);

        const LOG_INFO = {
            className: target.name,
            serviceName: descriptor.name,
            serviceLevel: ServiceTarget[this.serviceTarget]
        }

        if ((this.serviceTarget & descriptor.targets) == 0)
        {
            this.log.debug("Skipping {className} for {serviceName}, doesn't support {serviceTarget}", LOG_INFO);
            return false;
        }

        if (this.services.has(descriptor.name))
        {
            this.log.warn("Service {serviceName} is already registered, skipping {className}", LOG_INFO);
            return false;
        }

        descriptor.instance = service;

        this.services.set(descriptor.name, descriptor);
        this.log.debug("Service {serviceName} registered to class {className}", LOG_INFO);

        return true;
    }

    public get<T>(name: string): T
    {
        let local = this.services.get(name);

        if (local != null)
            return local.instance as T;

        // TODO: Check remote transport for the instance.

        return null;
    }
}

/* ================================================================================================================= */
/**
 * Registers a class as a service provider.
 *
 * @param name The name of the service the class provides.
 */
export function service<T>(name: string, targets: ServiceTarget): any
{
    if (name == null || name == "")
        throw new Error("Service name is required.");

    if (targets == 0)
        throw new Error("A service target is required.");

    return function (target: Type<T>): void
    {
        let srvcDescriptor = getServiceDescriptor(target.prototype);
        srvcDescriptor.name = name;
        srvcDescriptor.targets = targets;
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
