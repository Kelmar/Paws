import IDisposable from "../common/lifecycle";
import { Observable } from 'rxjs';

export enum ConnectionState
{
    Connected,
    Disconnected
}

export interface ITransportListener extends IDisposable
{
    listen(): Observable<ITransportConnection>;
}

export interface ITransportConnection extends IDisposable
{
    readonly id: any;
    
    readonly state: ConnectionState;

    send(data: any): void;

    disconnect(): void;

    recv(): Observable<string>;
}
