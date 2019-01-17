/* ================================================================================================================= */
/* ================================================================================================================= */

import { Type, identifier } from 'lepton-di';

import { ServiceTarget } from "./consts";

import { getServiceDescriptor, SERVICE_METADATA } from "./internal";

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
/**
 * Registers an observable property as an event source.
 */
export function event(target: any, name: string, descriptor: PropertyDescriptor): void
{
    let srvcDescriptor = getServiceDescriptor(target);

    srvcDescriptor.addEvent(name, descriptor);

    Reflect.defineMetadata(SERVICE_METADATA, srvcDescriptor, target);
}

/* ================================================================================================================= */

