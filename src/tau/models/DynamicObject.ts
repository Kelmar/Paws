/* ================================================================================================================= */
/* ================================================================================================================= */

import { LogManager } from "../../common/logging";
import { Observable, Observer, Subject } from "rxjs";

/* ================================================================================================================= */

export interface NotifyCallback
{
    (target: any, p: PropertyKey, value?: any): void;
}

/* ================================================================================================================= */

const DYNAMIC_TAG: unique symbol = Symbol('paws:tau:dynamic');

let g_log = LogManager.getLogger("paws.tau.dynamic");

/* ================================================================================================================= */

export enum ModelEventType
{
    Ping,
    Changed,
    Deleted
}

/* ================================================================================================================= */

export class ModelEvent
{
    constructor (readonly type: ModelEventType, readonly property?: PropertyKey)
    {
    }
}

/* ================================================================================================================= */

class DynamicHandler<T extends object> implements ProxyHandler<T>
{
    private readonly m_subject: Subject<ModelEvent>;

    constructor(readonly target: T)
    {
        this.m_subject = new Subject();

        for (let name in this.target)
            this.target[name] = this.childAdded(this.target[name]);
    }

    public dispose()
    {
        for (var name in this.target)
            this.childDeleted(this.target[name]);

        this.m_subject.complete();
    }

    public get({}, p: PropertyKey, {}): any
    {
        switch (p)
        {
        case DYNAMIC_TAG:
            return this;

        case "observable":
            return this.m_subject;

        case "notify":
            return () => this.notify();

        default:
            return (this.target as any)[p];
        }
    }

    private childDeleted(value: any)
    {
        if (value instanceof Object)
        {
            let childHandler: DynamicHandler<any> = value[DYNAMIC_TAG];

            if (childHandler != null)
                childHandler.dispose();
        }
    }

    private childAdded(value: any): any
    {
        if (value instanceof Object || value instanceof Array)
            return makeDynamic(value);

        return value;
    }

    public set({}, p: PropertyKey, value: any, {}): boolean
    {
        switch (p)
        {
        case DYNAMIC_TAG:
        case "observable":
        case "notify":
            g_log.error("Attempt to set property {name} denied.", { name: p });
            return false; // Don't allow these to be set.

        default:
            let a: any = this.target;
            let oldVal: any = a[p];

            if (oldVal !== value)
            {
                a[p] = this.childAdded(value);

                this.childDeleted(oldVal);
                this.m_subject.next(new ModelEvent(ModelEventType.Changed, p));
            }

            return true;
        }
    }

    public deleteProperty({}, p: PropertyKey): boolean
    {
        let a: any = this.target;
        let oldVal: any = a[p];

        if (oldVal !== undefined)
        {
            a[p] = undefined;
            delete a[p];

            this.childDeleted(oldVal);
            this.m_subject.next(new ModelEvent(ModelEventType.Deleted, p));
        }

        return true;
    }

    public notify(): void
    {
        this.m_subject.next(new ModelEvent(ModelEventType.Ping));
    }
}

/* ================================================================================================================= */

/*
 * Personal note: does it make sense to allow a callback to be subscribed to a specific property?
 * Currently I'm leaning towards that it might, but will have to see depending on how the UI portion
 * of the Tau library unfolds.
 */
    
 /* ================================================================================================================= */

export interface Dynamic
{
    /**
     * The observerable that events can be subscribed to.
     */
    readonly observable: Observable<ModelEvent>;

    /**
     * Sends a ping notification event, useful for forcing updates on computed properties.
     */
    notify(): void;
}

/* ================================================================================================================= */

export function makeDynamic<T extends object>(item: T): T & Dynamic
{
    let p = new Proxy(item, new DynamicHandler<T>(item));

    return (p as any as (T & Dynamic));
}

/* ================================================================================================================= */
 