import { IDisposable, IResolver, inject } from "lepton-di";
import { ipcMain } from "electron";

/* ================================================================================================================= */
/* ================================================================================================================= */

/* ================================================================================================================= */

export class EndpointDescriptor
{
    constructor (public readonly name: string, public readonly method: Function)
    {
    }
}

/* ================================================================================================================= */

export class ServiceDescriptor
{
    public name: string;
    public endpoints: EndpointDescriptor[] = [];

    public addEndpoint(name: string, fn: Function): void
    {
        this.endpoints.push(new EndpointDescriptor(name, fn));
    }
}

/* ================================================================================================================= */

class ServiceManager implements IDisposable
{
    constructor ()
    {
    }

    public dispose(): void
    {
    }

    public register(descriptor: ServiceDescriptor)
    {
    }

    public getService<T>(name: string): T
    {
        return null;
    }
}

/* ================================================================================================================= */
