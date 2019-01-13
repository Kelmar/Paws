/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from 'rxjs';

import { Type, identifier } from 'lepton-di';

import { ServiceTarget } from '.';

/* ================================================================================================================= */

export const SERVICE_METADATA: unique symbol = Symbol("tau:service:descriptor");

/* ================================================================================================================= */

export function getServiceDescriptor(target: any): ServiceDescriptor
{
    let descriptor = Reflect.getOwnMetadata(SERVICE_METADATA, target) as ServiceDescriptor;

    if (descriptor == null)
        descriptor = new ServiceDescriptor();

    return descriptor;
}

/* ================================================================================================================= */

export interface EventGetter<T>
{
    (): Observable<T>;
}

/* ================================================================================================================= */

export class EndpointDescriptor
{
    constructor (public readonly name: string, public readonly method: Function, public readonly parent: ServiceDescriptor)
    {
    }
}

/* ================================================================================================================= */

export class EventDescriptor
{
    constructor (public readonly name: string, public readonly getMethod: EventGetter<any>)
    {
    }
}

/* ================================================================================================================= */

export class ServiceDescriptor
{
    public name: identifier = null;
    public type: Type<any>;

    public targets: ServiceTarget;

    public endpoints: EndpointDescriptor[] = [];

    public events: EventDescriptor[] = [];

    public addEndpoint(name: string, fn: Function): void
    {
        this.endpoints.push(new EndpointDescriptor(name, fn, this));
    }

    public addEvent(name: string, property: PropertyDescriptor): void
    {
        this.events.push(new EventDescriptor(name, property.get));
    }
}

/* ================================================================================================================= */
