import { ipcMain } from 'electron';
import { ITransportListener, ITransportConnection } from "./Transport";

import { fromEvent, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import IDisposable from '../common/lifecycle';

const IPC_STATUS_SYMBOL = Symbol('__IPC_STATUS');
const IPC_ID_SYMBOL = Symbol('__IPC_ID');

export class IpcConnection implements ITransportConnection, IDisposable
{
    constructor(readonly sender: any)
    {
    }

    public dispose()
    {
        this.sender[IPC_STATUS_SYMBOL] = 'disconnected';
    }
}

export class IpcListener implements ITransportListener, IDisposable
{
    private readonly m_log: Console;
    private m_subscription: Subscription;
    private m_idNumber: number;
    
    constructor ()
    {
        this.m_log = console;
        this.m_idNumber = 0;
    }

    public dispose()
    {
        this.m_log.info('IpcListener shutting down...');
        
        this.m_subscription.unsubscribe();
    }

    private onConnect(x: any): void
    {
        let event = x.shift();
        let sender = event.sender;

        if (sender[IPC_STATUS_SYMBOL] != 'connected')
        {
            var id = this.m_idNumber++;

            sender[IPC_STATUS_SYMBOL] = 'connected';
            sender[IPC_ID_SYMBOL] = id;

            this.m_log.info("New connection: ", id);
        }
        else
        {
            this.m_log.warn(`Window ID ${sender[IPC_ID_SYMBOL]} attempted a duplicate connect!`);
        }
    }

    public listen(): void
    {
        let observable = fromEvent(ipcMain, 'connect');
        this.m_subscription = observable.subscribe(x => this.onConnect(x));

        this.m_log.info("IpcListener is now awaiting connections.");
    }
}
