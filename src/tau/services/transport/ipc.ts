/* ================================================================================================================= */
/* ================================================================================================================= */

import { ipcMain, WebContents, ipcRenderer, IpcRenderer, IpcMain } from "electron";

import { fromEvent, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";

import { IContainer, IDisposable, Lifetime } from "lepton-di";

import { ConnectionState, IListener, IClient } from ".";
import { LogManager, ILogger } from "../../common/logging";

/* ================================================================================================================= */

let g_uniqueId: number = 0;

/* ================================================================================================================= */

type SourceType = IpcMain | IpcRenderer;
type TargetType = WebContents | IpcRenderer;

/* ================================================================================================================= */

export class IpcClient implements IClient, IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger("paws.backend.ipcConnection");
    private readonly m_subject: Subject<any> = new Subject<any>();

    private readonly m_source: SourceType;
    private readonly m_target: TargetType;

    private m_sendBuffer: any[] = [];

    private m_id: number;
    private m_msgId: string;

    private m_state: ConnectionState = ConnectionState.Unbound;

    constructor(source?: SourceType, target?: TargetType, id?: number)
    {
        this.m_source = source || ipcRenderer;
        this.m_target = target || ipcRenderer;

        if (id != null)
        {
            this.m_state = ConnectionState.Connecting;

            this.onConnected(id);

            this.m_target.send("connected", this.m_id);

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
        this.m_msgId = "msg:" + this.m_id;

        // Notify subscribers we"re now connected.
        this.m_subject.next(ConnectionState.Connected);

        this.m_source.on(this.m_msgId, (_: any, x: any) => this.m_subject.next(x));
        this.m_source.once("disconnect:" + this.m_id, () => this.onDisconnect());

        for (let msg of this.m_sendBuffer)
            this.send(msg);

        this.m_sendBuffer = [];
    }

    private onDisconnect(): void
    {
        if (this.m_state == ConnectionState.Connected)
        {
            this.m_state = ConnectionState.Disconnected;
            this.m_source.removeAllListeners(this.m_msgId);
            this.m_subject.complete();
        }
    }

    public connect(): Promise<void>
    {
        if (this.m_state != ConnectionState.Unbound)
            return;

        this.m_state = ConnectionState.Connecting;

        return new Promise(resolve =>
        {
            this.m_source.once("connected", (_: any, id: number) => {
                resolve();
                this.onConnected(id);
            });

            this.m_target.send("connect", {});
        });
    }

    public get receive$(): Observable<any>
    {
        return this.m_subject;
    }

    public send(data: any): void
    {
        if (this.m_state == ConnectionState.Connected)
        {
            //this.m_log.verbose(`Sending ${this.m_msgId}: ${data}`);
            this.m_target.send(this.m_msgId, data);
        }
        else if (this.m_state == ConnectionState.Connecting)
        {
            this.m_sendBuffer.push(data);
        }
        else
        {
            const stateName = ConnectionState[this.m_state];
            throw new Error(`Message not sent, socket in ${stateName} state.`);
        }
    }

    public disconnect(): Observable<void>
    {
        if (this.m_state == ConnectionState.Disconnected)
            return;

        this.m_state = ConnectionState.Disconnected;
        this.m_source.removeAllListeners(this.m_msgId);

        this.m_subject.complete();
        this.m_target.send("disconnect", {});

        this.m_log.debug("Client {m_id} disconnected.", this);
    }
}

/* ================================================================================================================= */

export class IpcListener implements IListener, IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger("paws.backend.ipcListener");
    private m_source: Observable<IClient> = null;

    constructor()
    {
    }

    public dispose()
    {
        this.m_log.info("IPC listener shutting down...");

        ipcMain.removeAllListeners("connect");
    }

    public get listen$(): Observable<IClient>
    {
        if (this.m_source != null)
            return this.m_source;

        this.m_source = fromEvent(ipcMain, "connect")
            .pipe(
                map(x => (x instanceof Array) ? x.shift() : x),
                map(x => x.sender as WebContents),
                map(sender => this.newConnection(sender))
            );

        this.m_log.info("IPC listener is now awaiting connections.");

        return this.m_source;
    }

    private newConnection(sender: WebContents): IpcClient
    {
        let client = new IpcClient(ipcMain, sender, ++g_uniqueId);
        sender.send("connected", client.id);
        return client;
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
            .toClass(IpcListener)
            .with(Lifetime.Singleton);

        container.register(IClient)
            .toClass(IpcClient)
            .with(Lifetime.Transient);
    }
}

/* ================================================================================================================= */
