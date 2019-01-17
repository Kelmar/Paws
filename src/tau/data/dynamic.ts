/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, Subject } from "rxjs";

import { LogManager } from "../common/logging";

/* ================================================================================================================= */

const DYNAMIC_TAG: unique symbol = Symbol("tau:dynamic");

let g_log = LogManager.getLogger("tau.dynamic");

/* ================================================================================================================= */

export enum ModelEventType
{
    /**
     * A call to notify() was made.
     *
     * Used to update all properties/items on a model.
     */
    Ping,

    /**
     * A specific property was changed.
     */
    Changed,

    /**
     * A property or item was removed.
     */
    Deleted,

    /**
     * An item was added to the collection.
     */
    Added
}

/* ================================================================================================================= */

export class ModelEvent
{
    constructor (readonly type: ModelEventType, readonly property?: string)
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

    public get({}, p: string, {}): any
    {
        if ((p as any as Symbol) == DYNAMIC_TAG)
            return this;

        switch (p)
        {
        case "change$":
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

    public set({}, p: string, value: any, {}): boolean
    {
        if ((p as any as symbol) == DYNAMIC_TAG)
        {
            g_log.error("Attempt to set property {name} denied.", { name: p });
            return false;
        }

        switch (p)
        {
        case "change$":
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

    public deleteProperty({}, p: string): boolean
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

export interface Dynamic
{
    /**
     * The observerable that events can be subscribed to.
     */
    readonly change$: Observable<ModelEvent>;

    /**
     * Sends a ping notification event, useful for forcing updates on computed properties.
     */
    notify(): void;

    /**
     * Reads a property from the model.
     */
    [name: string]: any;
}

/* ================================================================================================================= */

export function makeDynamic<T extends object>(item: T): T & Dynamic
{
    if (item == null)
        return null;

    let dynamic = (item as any)[DYNAMIC_TAG];

    if (dynamic != null)
        return (item as any as (T & Dynamic));

    let p = new Proxy(item, new DynamicHandler<T>(item));

    return (p as any as (T & Dynamic));
}

/* ================================================================================================================= */
 