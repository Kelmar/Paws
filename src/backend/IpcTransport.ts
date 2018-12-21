import { ipcMain, WebContents, webContents } from 'electron';
import { fromEvent, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { ITransportListener, ITransportConnection, ConnectionState } from "./Transport";
import { LogManager, ILogger } from '../common/logging';

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
    private m_log: ILogger = LogManager.getLogger('paws.backend.ipcConnection');
    
    private m_renderer: WebContents;
    private m_msgId: string;
    
    constructor(renderer: WebContents, readonly manager: ConnectionManager)
    {
        this.m_renderer = renderer;
        
        this.setId(this.manager.addConnection(this));

        this.m_msgId = "msg:" + this.id;
       
        this.setState(ConnectionState.Connected);

        this.rawSend('connected', this.id);

        this.m_log.info("New connection: ", this.id);
    }

    public recv(): Observable<string>
    {
        return fromEvent(ipcMain, this.m_msgId).pipe(
            filter(() => this.state == ConnectionState.Connected),
            map(x => x as string)
        );
    }

    public disconnected(): Observable<void>
    {
        return fromEvent(ipcMain, "disconnect:" + this.id).pipe(
            filter(() => this.state == ConnectionState.Connected),
            map(() => this.setState(ConnectionState.Disconnected))
        );
    }

    public send(data: any): void
    {
        if (this.state == ConnectionState.Connected)
            this.rawSend(this.m_msgId, data);
    }

    public get id(): number
    {
        return (this.m_renderer as any)[IPC_ID_SYMBOL];
    }

    public get state(): ConnectionState
    {
        return (this.m_renderer as any)[IPC_STATE_SYMBOL];
    }

    private setState(newValue: ConnectionState): void
    {
        (this.m_renderer as any)[IPC_STATE_SYMBOL] = newValue;
    }

    private setId(newValue: number): void
    {
        (this.m_renderer as any)[IPC_ID_SYMBOL] = newValue;
    }

    private rawSend(channel: string, data?: any): void
    {
        this.m_renderer.send(channel, data);
    }

    public disconnect(): Observable<void>
    {
        if (this.state == ConnectionState.Disconnected)
            return;

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
    private readonly m_log: ILogger = LogManager.getLogger('paws.backend.ipcListener');

    private m_manager: ConnectionManager;

    constructor()
    {
        this.m_manager = new ConnectionManager();
    }

    public dispose()
    {
        this.m_log.info('IPC listener shutting down...');

        this.m_manager.dispose();
        this.m_manager = null;
    }

    public listen(): Observable<ITransportConnection>
    {
        var rval = fromEvent(ipcMain, 'connect')
            .pipe(
                map(x => (x instanceof Array) ? x.shift() : x),
                map(x => x.sender as WebContents),
                map(sender => new IpcConnection(sender, this.m_manager))
            );

        this.m_log.info("IPC listener is now awaiting connections.");

        return rval;
    }
}
