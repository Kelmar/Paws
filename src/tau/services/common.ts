/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from "rxjs";

import { IDisposable } from "lepton-di";

/* ================================================================================================================= */

export enum IpcMessageType
{
    Call = 100,     // Call a function. (Client to server request)
    Raise = 101,    // Raise a event.   (Server to client request)
    Listen = 102,   // Request to listen (Client sub to server event)
    Mute = 103,     // Request to unlisten (Client unsub to server event)

    Return = 200,   // Call return.     (Client to server response)

    Error = 400
}

/* ================================================================================================================= */

export interface IpcMessage
{
    id: number;
    type: IpcMessageType;
    name: string;
    data?: any;
}

/* ================================================================================================================= */

export const IServiceClient: unique symbol = Symbol("tau:ipc:client");

export interface IServiceClient extends IDisposable
{
    call<T>(name: string, ...args: any[]): Promise<T>;
    listen<T>(name: string): Observable<T>;
}

/* ================================================================================================================= */
