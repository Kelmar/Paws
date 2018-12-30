/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, never } from 'rxjs';

import { ConnectionState, IListener, IClient } from ".";

import { IContainer } from '../../lepton';

/* ================================================================================================================= */

class NullListener implements IListener
{
    public dispose(): void
    {
    }

    public listen(): Observable<IClient>
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

    public connect(host: string): void
    {
    }

    public send(data: any): void
    {
    }

    public recv(): Observable<any>
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
    container.register(IListener).to(NullListener);
    container.register(IClient).to(NullClient);
}

/* ================================================================================================================= */