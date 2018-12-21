import { ipcMain, WebContents } from 'electron';
import { ITransportListener, ITransportConnection, ConnectionState } from "./Transport";

import { fromEvent, Subscription } from 'rxjs';

import IDisposable from '../common/lifecycle';

const IPC_STATE_SYMBOL = Symbol('__IPC_STATE');
const IPC_ID_SYMBOL = Symbol('__IPC_ID');

interface ConnectionMap
{
    [id: number]: IpcConnection
}

class ConnectionManager implements IDisposable
{
    private m_map: ConnectionMap = {};
    private m_nextId: number = 0;

    public dispose(): void
    {
        for (let index in this.m_map)
        {
            let client: IpcConnection = this.m_map[index];
            client.dispose();
        }

        this.m_map = null;
    }

    private getNextId(): number
    {
        // If this weren't for a local host connection, we'd use a better number generation.
        return this.m_nextId++;
    }

    public addConnection(connection: IpcConnection): number
    {
        let id: number = this.getNextId();
        this.m_map[id] = connection;
        return id;
    }

    public removeConnection(connection: IpcConnection)
    {
        this.m_map[connection.id] = null;
        delete this.m_map[connection.id];
    }

    public findConnection(id: number): IpcConnection
    {
        return this.m_map[id];
    }
}

export class IpcConnection implements ITransportConnection, IDisposable
{
    private m_log: Console;
    private m_renderer: WebContents;
    private m_recvSubscription: Subscription;
    private m_discSubscription: Subscription;
    private m_msgId: string;
    
    constructor(renderer: WebContents, readonly manager: ConnectionManager)
    {
        this.m_log = console;
        this.m_renderer = renderer;
        
        this.setId(this.manager.addConnection(this));

        this.m_msgId = "msg:" + this.id;
        
        let observable = fromEvent(ipcMain, this.m_msgId);
        this.m_recvSubscription = observable.subscribe((x: any) => this.recv(x));

        observable = fromEvent(ipcMain, 'disconnect:' + this.id);
        this.m_discSubscription = observable.subscribe((x: any) => this.disconnect());

        this.setState(ConnectionState.Connected);

        this.rawSend('connected', this.id);
    }

    public recv(data: any): void
    {
        if (this.state == ConnectionState.Disconnected)
        {
            this.m_log.warn(`Ignoring errant message from ${this.id} after disconnect.`);
            return;
        }

        if (data instanceof Array)
            data = data[1];

        this.m_log.debug('Message: ', data);

        // TODO: Dispatch the received message.
    }

    public send(data: any): void
    {
        if (this.state == ConnectionState.Connected)
            this.rawSend(this.m_msgId, data);
    }

    public get id(): number
    {
        var x: any = this.m_renderer;
        return x[IPC_ID_SYMBOL];
    }

    public get state(): ConnectionState
    {
        var x: any = this.m_renderer;
        return x[IPC_STATE_SYMBOL];
    }

    private setState(newValue: ConnectionState): void
    {
        var x: any = this.m_renderer;
        x[IPC_STATE_SYMBOL] = newValue;
    }

    private setId(newValue: number): void
    {
        var x: any = this.m_renderer;
        x[IPC_ID_SYMBOL] = newValue;
    }

    private rawSend(channel: string, data?: any): void
    {
        this.m_renderer.send(channel, data);
    }

    public disconnect()
    {
        if (this.state == ConnectionState.Disconnected)
            return;

        this.m_discSubscription.unsubscribe();
        this.m_discSubscription = null;

        this.m_recvSubscription.unsubscribe();
        this.m_recvSubscription = null;

        this.rawSend('disconnect');
        
        this.manager.removeConnection(this);
        this.setState(ConnectionState.Disconnected);

        this.m_log.debug(`Client ${this.id} disconnected.`);
    }

    public dispose()
    {
        this.disconnect();        
        this.m_renderer = null;
    }
}

export class IpcListener implements ITransportListener, IDisposable
{
    private readonly m_log: Console;

    private m_manager: ConnectionManager;
    private m_subscription: Subscription;

    constructor()
    {
        this.m_log = console;
        this.m_manager = new ConnectionManager();
    }

    public dispose()
    {
        this.m_log.info('IPC listener shutting down...');
        this.m_subscription.unsubscribe();

        this.m_manager.dispose();
        this.m_manager = null;
    }

    private onConnect(event: any): void
    {
        if (event instanceof Array)
            event = event.shift();

        if (event.sender == null)
        {
            this.m_log.warn('Got IPC event without a sender?');
            return;
        }

        if (event.sender[IPC_STATE_SYMBOL] != ConnectionState.Connected)
        {
            let client = new IpcConnection(event.sender, this.m_manager);
            this.m_log.info("New connection: ", client.id);

            // TODO: Notify caller of new client.
        }
        else
        {
            this.m_log.warn(`Window ID ${event.sender[IPC_ID_SYMBOL]} attempted a duplicate connect!`);
        }
    }

    public listen(): void
    {
        let observable = fromEvent(ipcMain, 'connect');
        this.m_subscription = observable.subscribe((x: any) => this.onConnect(x));

        this.m_log.info("IPC listener is now awaiting connections.");
    }
}
