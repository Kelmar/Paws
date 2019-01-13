/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, never } from 'rxjs';

import { IContainer } from 'lepton-di';

import { ConnectionState, IListener, IClient } from ".";

/* ================================================================================================================= */

class NullListener implements IListener
{
    public dispose(): void
    {
    }

    public get listen$(): Observable<IClient>
    {
        return never();
    }
}

/* ================================================================================================================= */

class NullClient implements IClient
{
    public dispose(): void
    {
    }

    public get id(): number { return 0; }
    public get state(): ConnectionState { return ConnectionState.Disconnected; }

    public connect(host: string): Promise<void>
    {
        return Promise.resolve();
    }

    public send(data: any): void
    {
    }

    public get receive$(): Observable<any>
    {
        return never();
    }

    public disconnect(): void
    {
    }
}

/* ================================================================================================================= */

export function configureNullTransport(container: IContainer)
{
    container.register(IListener).toClass(NullListener);
    container.register(IClient).toClass(NullClient);
}

/* ================================================================================================================= */