/* ================================================================================================================= */
/* ================================================================================================================= */

import { Subscription, Observable } from "rxjs";

import { IDisposable, Type, inject, maybeDispose } from "lepton-di";

import { ILogger, LogManager } from "../common/logging";

import { IpcMessage, IpcMessageType } from "./common";

import { getServiceDescriptor, EndpointDescriptor, EventDescriptor } from "./internal";

import { IListener, IClient } from "./transport";

/* ================================================================================================================= */

class CallBinding implements IDisposable
{
    constructor (private service: any, private readonly endpoint: EndpointDescriptor)
    {
    }

    public dispose(): void
    {
        this.service = null;
    }

    public call(args: any[]): Promise<any>
    {
        return this.endpoint.method.apply(this.service, args);
    }
}

/* ================================================================================================================= */

class EventBinding implements IDisposable
{
    private m_subscribers: Set<IClient> = new Set();
    private m_subscription: Subscription;

    constructor (private service: any, private readonly name: string, private readonly ob$: Observable<any>)
    {
        this.m_subscription = ob$.subscribe({
            next: x => this.onNext(x),
            complete: () => this.onComplete(),
            error: e => this.onError(e)
        });
    }

    public dispose(): void
    {
        this.m_subscription.unsubscribe();

        this.onComplete();

        this.m_subscribers.clear();

        this.service = null;
    }

    public subscribe(client: IClient)
    {
        this.m_subscribers.add(client);
    }

    public unsubscribe(client: IClient)
    {
        this.m_subscribers.delete(client);
    }

    private sendAll(type: IpcMessageType, data?: any): void
    {
        for (let client of this.m_subscribers)
        {
            // TODO: Fix message ID
            client.send({ id: -1, name: this.name, type: type, data: data });
        }
    }

    private onNext(data: any): void
    {
        this.sendAll(IpcMessageType.Next, data);
    }

    private onComplete(): void
    {
        this.sendAll(IpcMessageType.Complete);
    }

    private onError(e: any): void
    {
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
    private readonly m_events: Map<string, EventBinding> = new Map();

    private readonly m_services: any[] = [];

    constructor()
    {
    }

    public dispose(): void
    {
        for (let [_, eb] of this.m_events)
            eb.dispose();

        for (let [_, cb] of this.m_calls)
            cb.dispose();

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
        let eb = this.m_events.get(msg.name);

        if (eb == null)
        {
            let e = new Error("Cannot subscribe, unknown event: " + msg.name);
            this.m_log.error(e);

            client.send({ id: msg.id, type: IpcMessageType.Error, name: msg.name, data: e });
            return;
        }

        console.log(`Client ${client.id} subscribed to ${msg.name}`);
        eb.subscribe(client);
    }

    private handleMute(client: IClient, msg: IpcMessage): void
    {
        let eb = this.m_events.get(msg.name);

        if (eb == null)
        {
            let e = new Error("Cannot unsubscribe, unknown event: " + msg.name);
            this.m_log.warn(e);

            client.send({ id: msg.id, type: IpcMessageType.Error, name: msg.name, data: e });
            return;
        }

        console.log(`Client ${client.id} unsubscribed to ${msg.name}`);
        eb.unsubscribe(client);
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
        {
            let callName = descriptor.name.toString() + "." + endpoint.name;
            this.m_calls.set(callName, new CallBinding(service, endpoint));
        }

        for (let event of descriptor.events)
        {
            let eventName = descriptor.name.toString() + "." + event.name;
            this.m_events.set(eventName, new EventBinding(service, eventName, event.getMethod.apply(service)));
        }

        this.m_log.info("Service registered: {name}", descriptor);

        return service;
    }
}

/* ================================================================================================================= */
