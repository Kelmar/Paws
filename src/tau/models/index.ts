export interface NotifyCallback<T extends object>
{
    (target: T, p: PropertyKey | String, value?: any): void;
}

class ObservableHandler<T extends object> implements ProxyHandler<T>
{
    private m_subscriptions: Set<NotifyCallback<T>> = new Set();

    public get(target: T, p: PropertyKey, {}): any
    {
        switch (p)
        {
        case "unsubscribe":
            return (cb: NotifyCallback<T>) => this.unsubscribe(target, cb);

        case "subscribe":
            return (cb: NotifyCallback<T>) => this.subscribe(target, cb);

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
        case "unsubscribe":
        case "subscribe":
        case "notify":
            // TODO: Log this so a developer knows what happened.
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

    public subscribe(target: T, cb: NotifyCallback<T>): void
    {
        this.m_subscriptions.add(cb);
    }

    public unsubscribe(target: T, cb: NotifyCallback<T>): void
    {
        this.m_subscriptions.delete(cb);
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
                // TODO: Log this for a developer.
            }
        });
    }
}

/*
 * Personal note: does it make sense to allow a callback to be subscribed to a specific property?
 * Currently I'm leaning towards that it might, but will have to see depending on how the UI portion
 * of the Tau library unfolds.
 */

export interface Observable<T extends object>
{
    /**
     * Adds a callback to the subscriber list.
     *
     * @param cb The callback to add.
     */
    subscribe(cb: NotifyCallback<T>): void;

    /**
     * Removes a callback from the subscriber list.
     *
     * @param cb The callback to remove.
     */
    unsubscribe(cb: NotifyCallback<T>): void;

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

export function makeObservable<T extends object>(item: T): T & Observable<T>
{
    let p = new Proxy(item, new ObservableHandler<T>());

    return (p as any as (T & Observable<T>));
}
