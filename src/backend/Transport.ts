/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from 'rxjs';

import { IDisposable } from "../lepton";
import { LogManager } from '../common/logging';

/* ================================================================================================================= */
// Interfaces
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

export class TransportFactories
{
    readonly name: string;

    listener: () => ITransportListener;
    client  : () => ITransportConnection;
}

/* ================================================================================================================= */
// Factories
/* ================================================================================================================= */

export module Transport
{
    /* ========================================================================================================= */

    let m_factories: TransportFactories[] = [];
    let m_log = LogManager.getLogger('paws.backend.transport');

    /* ========================================================================================================= */

    export function registerTransportFactories(factories: TransportFactories)
    {
        m_factories.push(factories);
        m_log.info(`${factories.name} transport registered.`);
    }

    /* ========================================================================================================= */

    export function listenerFactory(): ITransportListener
    {
        for (let factory of m_factories)
        {
            if (factory.listener != null)
            {
                m_log.debug(`Creating new ${factory.name} listener.`);
                return factory.listener();
            }
        }
    }

    /* ========================================================================================================= */

    export function clientFactory(): ITransportConnection
    {
        for (let factory of m_factories)
        {
            if (factory.client != null)
            {
                m_log.debug(`Creating new ${factory.name} client.`);
                return factory.client();
            }
        }
    }
}
/* ================================================================================================================= */
