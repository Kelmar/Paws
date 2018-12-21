import IDisposable from "../common/lifecycle";

export enum ConnectionState
{
    Connected,
    Disconnected
}

export interface ITransportListener extends IDisposable
{
    listen(): void;
}

export interface ITransportConnection extends IDisposable
{
    readonly id: any;
    
    readonly state: ConnectionState;

    send(data: any): void;
}
