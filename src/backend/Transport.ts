import IDisposable from "../common/lifecycle";

export interface ITransportListener extends IDisposable
{
    listen(): void;
}

export interface ITransportConnection extends IDisposable
{
}
