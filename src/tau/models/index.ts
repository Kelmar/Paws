/* ================================================================================================================= */
/* ================================================================================================================= */

import { LogManager } from "../../common/logging";
import { IDisposable } from "../../lepton";

/* ================================================================================================================= */

export interface NotifyCallback
{
    (target: any, p: PropertyKey | string, value?: any): void;
}

/* ================================================================================================================= */

let g_log = LogManager.getLogger("paws.tau.observable");

/* ================================================================================================================= */

class ObservableHandler<T extends object> implements ProxyHandler<T>
{
    private m_subscriptions: Set<NotifyCallback> = new Set();

    public get(target: T, p: PropertyKey, {}): any
    {
        switch (p)
        {
        case "subscribe":
            return (cb: NotifyCallback) => this.subscribe(target, cb);

        case "notify":
            return (p2: PropertyKey | string, value?: any) => this.notify(target, p2, value);

        default:
            return (target as any)[p];
        }
        
    }

    public set(target: T, p: PropertyKey, value: any, {}): boolean
    {
        switch (p)
        {
        case "subscribe":
        case "notify":
            g_log.error("Attempt to set property {name} denied.", { name: p });
            return false; // Don't allow these to be set.

        default:
            let a: any = target;
            let oldVal: any = a[p];

            if (oldVal !== value)
            {
                // TODO: Adjust child observables.  (And notify child callbacks)
                a[p] = value;
                this.notify(target, p, value);
            }

            return true;
        }
    }

    public deleteProperty(target: T, p: PropertyKey): boolean
    {
        let a: any = target;

        if (a[p] !== undefined)
        {
            // TODO: Adjust child observables.  (And notify child callbacks)
            a[p] = undefined;
            delete a[p];
            this.notify(target, p);
        }

        return true;
    }

    public subscribe(target: T, cb: NotifyCallback): IDisposable
    {
        this.m_subscriptions.add(cb);

        return {
            dispose: function()
            {
                this.m_subscriptions.remove(cb);
                cb = null;
            }
        }
    }

    public notify(target: T, p: PropertyKey | string, value?: any): void
    {
        this.m_subscriptions.forEach(cb =>
        {
            try
            {
                cb(target, p, value);
            }
            catch (e)
            {
                g_log.error("Error durring callback on property {name} change: {exception}", { name: p, exception: e });
            }
        });
    }
}

/* ================================================================================================================= */

/*
 * Personal note: does it make sense to allow a callback to be subscribed to a specific property?
 * Currently I'm leaning towards that it might, but will have to see depending on how the UI portion
 * of the Tau library unfolds.
 */

 /* ================================================================================================================= */

export interface Observable
{
    /**
     * Adds a callback to the subscriber list.
     *
     * @param cb The callback to add.
     */
    subscribe(cb: NotifyCallback): IDisposable;

    /**
     * Sends a notification event to the callbacks that the given property has been updated.
     *
     * This can be useful when a property is a computed value based on other values that have been set.
     *
     * @param p The property to send the notification for.
     * @param value The new value for the property.
     */
    notify(p: PropertyKey | string, value?: any): void;
}

/* ================================================================================================================= */

export function makeObservable<T extends object>(item: T): T & Observable
{
    let p = new Proxy(item, new ObservableHandler<T>());

    return (p as any as (T & Observable));
}

/* ================================================================================================================= */
 