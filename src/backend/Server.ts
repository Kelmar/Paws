import { ipcMain, desktopCapturer } from 'electron';
import { Subscription } from 'rxjs';

import { ITransportListener, ITransportConnection } from './Transport';
import { IpcListener } from './IpcTransport';
import { ILogger, LogManager } from '../common/logging';

import IDisposable from '../common/lifecycle';

export default class Server implements IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger('paws.backend.server');

    private readonly m_listener: ITransportListener
    private readonly m_connSubscribe: Subscription;

    constructor()
    {
        this.m_log.info("Server is starting...");

        if (ipcMain != null)
            this.m_listener = new IpcListener();
        else
            throw new Error("WebSocket version not implemented yet!");

        this.m_connSubscribe = this.m_listener
            .listen()
            .subscribe(client => this.connect(client));
    }

    public dispose()
    {
        if (this.m_connSubscribe)
            this.m_connSubscribe.unsubscribe();

        if (this.m_listener != null)
            this.m_listener.dispose();
    }

    private connect(client: ITransportConnection): void
    {
        this.m_log.debug(`New connection from ${client.id}`);

        let recvSub: Subscription;
        let discSub: Subscription;

        recvSub = client.recv().subscribe(msg => this.onRecv(client, msg));
        discSub = client.disconnected().subscribe(() =>
        {
            this.onDisconnect(client);

            client = null;

            this.m_connSubscribe.remove(recvSub);
            this.m_connSubscribe.remove(discSub);

            recvSub = null;
            discSub = null;
        });

        this.m_connSubscribe.add(recvSub);
        this.m_connSubscribe.add(discSub);
    }

    private onRecv(client: ITransportConnection, message: string): void
    {
    }

    private onDisconnect(client: ITransportConnection): void
    {
        this.m_log.debug(`Client disconnected: ${client.id}`);
    }
}
