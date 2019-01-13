/* ================================================================================================================= */
/* ================================================================================================================= */

import { Type, identifier } from 'lepton-di';

import { LogManager } from "../common/logging";

import { SERVICE_TARGET, ServiceTarget } from "./consts";

import { getServiceDescriptor, ServiceDescriptor, SERVICE_METADATA } from "./internal";

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

export function event(target: any, name: string, descriptor: PropertyDescriptor): void
{
    let srvcDescriptor = getServiceDescriptor(target);

    srvcDescriptor.addEvent(name, descriptor);

    Reflect.defineMetadata(SERVICE_METADATA, srvcDescriptor, target);
}

/* ================================================================================================================= */

