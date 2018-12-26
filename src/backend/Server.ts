/* ================================================================================================================= */

import { Subscription } from 'rxjs';

import { Transport, ITransportListener, ITransportConnection } from './Transport';
import { ILogger, LogManager } from '../common/logging';

import { IDisposable } from '../lepton';

/* ================================================================================================================= */

export default class Server implements IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger('paws.backend.server');

    private readonly m_listener: ITransportListener
    private readonly m_connSubscribe: Subscription;

    constructor()
    {
        this.m_log.info("Server is starting...");

        this.m_listener = Transport.listenerFactory();

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

        recvSub = client.recv().subscribe(
            { 
                next: msg => this.onRecv(client, msg),
                complete: () => 
                {
                    this.onDisconnect(client);

                    this.m_connSubscribe.remove(recvSub);
                    recvSub = null;
                    client = null;
                }
            });

        this.m_connSubscribe.add(recvSub);
    }

    private onRecv(client: ITransportConnection, message: string): void
    {
        this.m_log.debug(`Client ${client.id} sent: ${message}`);
        client.send(message); // Echo server
    }

    private onDisconnect(client: ITransportConnection): void
    {
        this.m_log.debug(`Client disconnected: ${client.id}`);
    }
}

/* ================================================================================================================= */
