/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from 'rxjs';

import { IDisposable } from "../lepton";

/* ================================================================================================================= */
// Interfaces
/* ================================================================================================================= */

export const IListener: unique symbol = Symbol("paws:backend:transport:listener");
export const IClient: unique symbol = Symbol("paws:backend:transport:client");

/* ================================================================================================================= */

export enum ConnectionState
{
    Unbound,
    Connecting,
    Connected,
    Disconnected
}

/* ================================================================================================================= */

export interface ITransportListener extends IDisposable
{
    listen(): Observable<ITransportConnection>;
}

/* ================================================================================================================= */

export interface ITransportConnection extends IDisposable
{
    readonly id: any;
    
    readonly state: ConnectionState;

    connect(host: string): void;

    send(data: any): void;

    recv(): Observable<any>;

    disconnect(): void;
}

/* ================================================================================================================= */
