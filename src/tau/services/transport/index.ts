/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from "rxjs";

import { IDisposable, IContainer } from "lepton-di";

import { IPC } from "./ipc";
import { configureNullTransport } from "./null";

/* ================================================================================================================= */

export enum ConnectionState
{
    Unbound,
    Connecting,
    Connected,
    Disconnected
}

/* ================================================================================================================= */
// Interfaces
/* ================================================================================================================= */

export const IListener: unique symbol = Symbol("paws:backend:transport:listener");

export interface IListener extends IDisposable
{
    readonly listen$: Observable<IClient>;
}

/* ================================================================================================================= */

export const IClient: unique symbol = Symbol("paws:backend:transport:client");

export interface IClient extends IDisposable
{
    readonly id: any;
    
    readonly state: ConnectionState;

    connect(host: string): Promise<void>;

    send(data: any): void;

    readonly receive$: Observable<any>;

    disconnect(): void;
}

/* ================================================================================================================= */

export module transport
{
    export function configure(container: IContainer)
    {
        if (process.versions.electron != null)
            IPC.configure(container);
        else
            configureNullTransport(container);
    }
}

/* ================================================================================================================= */
