/* ================================================================================================================= */
/* ================================================================================================================= */

import "reflect-metadata";

import { Type } from "lepton-di";
import { ServiceDescriptor } from "../ServiceManager";

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
/**
 * Registers a class as a service provider.
 *
 * @param name The name of the service the class provides.
 */
export function service<T>(name: string): any
{
    return function (target: Type<T>): void
    {
        let srvcDescriptor = getServiceDescriptor(target.prototype);
        srvcDescriptor.name = name;

        let clsName = target.name;

        // TODO: Register service with ServiceManager
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
