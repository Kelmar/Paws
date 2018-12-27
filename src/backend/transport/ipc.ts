/* ================================================================================================================= */
/* ================================================================================================================= */

import { ipcMain, WebContents, webContents, ipcRenderer, IpcRenderer, IpcMain } from 'electron';
import { fromEvent, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConnectionState, IListener, IClient } from ".";
import { LogManager, ILogger } from '../../common/logging';

import { IContainer, IDisposable, Lifetime } from '../../lepton';

/* ================================================================================================================= */

let g_uniqueId: number = 0;

/* ================================================================================================================= */

class ConnectionBase
{
    constructor(public source: IpcMain | IpcRenderer, public target: WebContents | IpcRenderer)
    {
    }

    public on(channel: string, listener: Function): void
    {
        this.source.on(channel, listener);
    }

    public once(channel: string, listener: Function): void
    {
        this.source.once(channel, listener);
    }

    public removeAllListeners(channel?: string): void
    {
        this.source.removeAllListeners(channel);
    }

    public removeListener(channel: string, listener: Function): void
    {
        this.source.removeListener(channel, listener);
    }

    public send(channel: string, data: any): void
    {
        this.target.send(channel, data);
    }
}

/* ================================================================================================================= */

export class IpcConnection implements IClient, IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger('paws.backend.ipcConnection');
    private readonly m_subject: Subject<any> = new Subject<any>();
    private readonly m_base: ConnectionBase;

    private m_id: number;
    private m_msgId: string;

    private m_state: ConnectionState = ConnectionState.Unbound;

    constructor(base?: ConnectionBase, id?: number)
    {
        this.m_base = base || new ConnectionBase(ipcRenderer, ipcRenderer);

        if (id != null)
        {
            this.m_state = ConnectionState.Connecting;

            this.onConnected(id);

            this.m_base.send('connected', this.m_id);

            this.m_log.info("New connection: ", this.m_id);
        }
    }

    public dispose()
    {
        this.disconnect();
    }

    public get id(): number
    {
        return this.m_id;
    }

    public get state(): ConnectionState
    {
        return this.m_state;
    }

    private onConnected(id: number): void
    {
        this.m_state = ConnectionState.Connected;

        this.m_id = id;
        this.m_msgId = 'msg:' + this.m_id;

        // Notify subscribers we're now connected.
        this.m_subject.next(ConnectionState.Connected);

        this.m_base.on(this.m_msgId, (_: any, x :any) => this.m_subject.next(x));
        this.m_base.once('disconnect:' + this.m_id, () => this.onDisconnect());
    }

    private onDisconnect(): void
    {
        if (this.m_state == ConnectionState.Connected)
        {
            this.m_state = ConnectionState.Disconnected;
            this.m_base.removeAllListeners(this.m_msgId);
            this.m_subject.complete();
        }
    }

    public connect(): void
    {
        if (this.m_state != ConnectionState.Unbound)
            return;

        this.m_state = ConnectionState.Connecting;

        this.m_base.once('connected', (_: any, id: number) => this.onConnected(id));
        this.m_base.send('connect', {});
    }

    public recv(): Observable<any>
    {
        return this.m_subject;
    }

    public send(data: any): void
    {
        if (this.m_state == ConnectionState.Connected)
        {
            //this.m_log.verbose(`Sending ${this.m_msgId}: ${data}`);
            this.m_base.send(this.m_msgId, data);
        }
    }

    public disconnect(): Observable<void>
    {
        if (this.m_state == ConnectionState.Disconnected)
            return;

        this.m_state = ConnectionState.Disconnected;
        this.m_base.removeAllListeners(this.m_msgId);

        this.m_subject.complete();
        this.m_base.send('disconnect', {});

        this.m_log.debug(`Client ${this.m_id} disconnected.`);
    }
}

/* ================================================================================================================= */

export class IpcListener implements IListener, IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger('paws.backend.ipcListener');

    constructor()
    {
    }

    public dispose()
    {
        this.m_log.info('IPC listener shutting down...');

        ipcMain.removeAllListeners('connect');
    }

    public listen(): Observable<IClient>
    {
        var rval = fromEvent(ipcMain, 'connect')
            .pipe(
                map(x => (x instanceof Array) ? x.shift() : x),
                map(x => x.sender as WebContents),
                map(sender => this.newConnection(sender))
            );

        this.m_log.info("IPC listener is now awaiting connections.");

        return rval;
    }

    private newConnection(sender: WebContents): IpcConnection
    {
        var base = new ConnectionBase(ipcMain, sender);
        var rval = new IpcConnection(base, ++g_uniqueId);

        return rval;
    }
}

/* ================================================================================================================= */
// IPC Initialization
/* ================================================================================================================= */

export module IPC
{
    export function configure(container: IContainer)
    {
        container.register(IListener)
            .to(IpcListener)
            .with(Lifetime.Singleton);

        container.register(IClient)
            .to(IpcConnection)
            .with(Lifetime.Scoped);
    }
}

/* ================================================================================================================= */
