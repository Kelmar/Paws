/* ================================================================================================================= */
/* ================================================================================================================= */

import { Subscription } from "rxjs";

import { IDisposable, Type, inject, maybeDispose } from "lepton-di";

import { ILogger, LogManager } from "../../common/logging";

import { IpcMessage, IpcMessageType } from "./common";

import { getServiceDescriptor, EndpointDescriptor } from "./internal";

import { IListener, IClient } from "./transport";

/* ================================================================================================================= */

class CallBinding implements IDisposable
{
    constructor (private service: any, private readonly endpoint: EndpointDescriptor)
    {
    }

    public dispose()
    {
        this.service = null;
    }

    public call(args: any[]): Promise<any>
    {
        return this.endpoint.method.apply(this.service, args);
    }
}

/* ================================================================================================================= */

export class ServiceServer implements IDisposable
{
    private readonly m_log: ILogger = LogManager.getLogger('paws.backend.server');

    @inject(IListener)
    private readonly listener: IListener;

    private m_sub: Subscription;

    private readonly m_calls: Map<string, CallBinding> = new Map();
    private readonly m_services: any[] = [];

    constructor()
    {
    }

    public dispose(): void
    {
        for (let service of this.m_services)
            maybeDispose(service);

        if (this.m_sub)
            this.m_sub.unsubscribe();
    }

    public start(): void
    {
        this.m_log.info("Server is starting...");

        this.m_sub = this.listener
            .listen$
            .subscribe(client => this.connect(client));
    }

    private connect(client: IClient): void
    {
        this.m_log.debug("New connection from {id}", client);

        let recvSub: Subscription;

        recvSub = client.receive$.subscribe(
        {
            next: msg => this.onRecv(client, msg),
            complete: () =>
            {
                this.onDisconnect(client);

                this.m_sub.remove(recvSub);
                recvSub = null;
                client = null;
            }
        });

        this.m_sub.add(recvSub);
    }

    private onRecv(client: IClient, msg: IpcMessage): void
    {
        switch (msg.type)
        {
        case IpcMessageType.Call:
            this.handleCall(client, msg);
            break;

        case IpcMessageType.Listen:
            this.handleListen(client, msg);
            break;

        case IpcMessageType.Mute:
            this.handleMute(client, msg);
            break;
        }
    }

    private onDisconnect(client: IClient): void
    {
        this.m_log.debug("Client disconnected: {id}", client);
    }

    private handleCall(client: IClient, msg: IpcMessage): void
    {
        let cb = this.m_calls.get(msg.name);

        if (cb == null)
        {
            let e = new Error("Unknown method: " + msg.name);
            client.send({ id: msg.id, type: IpcMessageType.Error, name: msg.name, data: e });
            return;
        }

        cb.call(msg.data)
            .then(x => client.send({ id: msg.id, type: IpcMessageType.Return, name: msg.name, data: x }))
            .catch(e => client.send({ id: msg.id, type: IpcMessageType.Error, name: msg.name, data: e }));
    }

    private handleListen(client :IClient, msg: IpcMessage): void
    {
    }

    private handleMute(client: IClient, msg: IpcMessage): void
    {
    }

    public register<T>(type: Type<T>): T
    {
        let descriptor = getServiceDescriptor(type.prototype);

        if (descriptor == null)
            throw new Error(`${type.name} is not a service.  Did you forget a decorator?`);

        if (!descriptor.name)
            throw new Error(`${type.name} does not have a service name attached to it.  Did you forget a descriptor?`);

        let service = new type();
        this.m_services.push(service);

        for (let endpoint of descriptor.endpoints)
            this.m_calls.set(endpoint.name, new CallBinding(service, endpoint));

        this.m_log.info("Service registered: {name}", descriptor);

        return service;
    }
}

/* ================================================================================================================= */
