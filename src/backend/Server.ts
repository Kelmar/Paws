/* ================================================================================================================= */

import { Subscription } from 'rxjs';

import { IClient, IListener } from './transport';
import { ILogger, LogManager } from '../common/logging';

import { IDisposable, inject } from '../lepton';

/* ================================================================================================================= */

export default class Server implements IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger('paws.backend.server');

    @inject(IListener)
    private readonly listener: IListener

    private m_connSubscribe: Subscription;

    constructor()
    {
    }

    public dispose()
    {
        if (this.m_connSubscribe)
            this.m_connSubscribe.unsubscribe();
    }

    public start(): void
    {
        this.m_log.info("Server is starting...");

        this.m_connSubscribe = this.listener
            .listen()
            .subscribe(client => this.connect(client));
    }

    private connect(client: IClient): void
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

    private onRecv(client: IClient, message: string): void
    {
        this.m_log.debug(`Client ${client.id} sent: ${message}`);
        client.send(message); // Echo server
    }

    private onDisconnect(client: IClient): void
    {
        this.m_log.debug(`Client disconnected: ${client.id}`);
    }
}

/* ================================================================================================================= */
