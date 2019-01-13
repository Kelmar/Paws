/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, Subscription, Subject } from "rxjs";

import { inject } from "lepton-di";

import { IServiceClient, IpcMessage, IpcMessageType } from "./common";
import { IClient } from "./transport";

/* ================================================================================================================= */

class CallDetails<T>
{
    constructor (public readonly accept: (v: T) => void, public readonly reject: () => void)
    {
    }
}

/* ================================================================================================================= */

export class ServiceClient implements IServiceClient
{
    private readonly m_requests: Map<number, CallDetails<any>> = new Map();
    private readonly m_eventSubjects: Map<string, Subject<any>> = new Map();

    private m_sub: Subscription;
    private m_lastId: number = 0;

    constructor(@inject(IClient) private readonly client: IClient)
    {
        this.m_sub = this.client.receive$.subscribe(msg => this.parseMessage(msg));

        client.connect("");
    }

    public dispose()
    {
        this.client.disconnect();

        for (let [key, value] of this.m_eventSubjects)
        {
            this.send(IpcMessageType.Mute, key);
            value.complete();
        }

        for (let [_, value] of this.m_requests)
            value.reject();

        this.m_requests.clear();

        this.m_sub.unsubscribe();
        this.m_sub = null;

        this.client.dispose();
    }

    private parseMessage(message: string): void
    {
        debugger;
        let msg: IpcMessage = JSON.parse(message);

        switch (msg.type)
        {
        case IpcMessageType.Error:
            this.handleError(msg);
            break;

        case IpcMessageType.Return:
            this.handleReturn(msg);
            break;

        case IpcMessageType.Raise:
            this.handleRaise(msg);
            break;
        }
    }

    private handleError(msg: IpcMessage): void
    {
        let promise = this.m_requests.get(msg.id);

        if (promise == null)
            return;

        this.m_requests.delete(msg.id);

        promise.reject();
    }

    private handleReturn(msg: IpcMessage): void
    {
        let promise = this.m_requests.get(msg.id);

        if (promise == null)
            return;

        this.m_requests.delete(msg.id);

        promise.accept(msg.data);
    }

    private handleRaise(msg: IpcMessage): void
    {
        let sub = this.m_eventSubjects.get(msg.name);

        if (sub == null)
            return;

        sub.next(msg.data);
    }

    private send<T>(type: IpcMessageType, name: string, args?: any): Promise<T>
    {
        let id = this.m_lastId++;

        return new Promise<T>((resolve, reject) =>
        {
            this.m_requests.set(id, new CallDetails(resolve, reject));

            this.client.send({
                id: id,
                type: type,
                name: name,
                data: args
            });
        });
    }

    public call<T>(name: string, ...args: any[]): Promise<T>
    {
        return this.send<T>(IpcMessageType.Call, name, args);
    }

    public listen<T>(name: string): Observable<T>
    {
        let sub = this.m_eventSubjects.get(name);

        if (sub != null)
            return sub;

        sub = new Subject<T>();
        this.m_eventSubjects.set(name, sub);

        this.send(IpcMessageType.Listen, name)
            .catch(e => {
                this.m_eventSubjects.delete(name);
                sub.error(e);
                sub.complete();
            });

        return sub;
    }
}

/* ================================================================================================================= */
