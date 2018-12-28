
interface getter
{
    (): any
}

interface setter
{
    (value: any): void
}

class DynamicProperty
{
    private readonly m_get: getter;
    private readonly m_set: setter;

    private m_value: any;

    constructor(readonly item: any, readonly name: string, info: PropertyDescriptor)
    {
        if (info.value !== undefined)
            this.m_value = info.value;

        this.m_get = info.get;
        this.m_set = info.set;

        Object.defineProperty(this.item, name,
        {
            set: v => this.set(v),
            get: () => this.get()
        });
    }

    public get(): any
    {
        let rval = this.peek();

        // TODO: Update dependencies.

        return rval;
    }

    public set(value: any)
    {
        let oldValue = this.peek();

        if (value === oldValue)
            return;

        if (this.m_set != null)
            this.m_set.call(this.item, value);
        else
            this.m_value = value;

        // TODO: Notify observers
    }

    /**
     * Gets an observed property's value without subscribing to it.
     */
    public peek(): any
    {
        return this.m_get != null ? this.m_get.call(this.item) : this.m_value;
    }
}

const OBSERVABLE_SELF: unique symbol = Symbol('tau:models:observable');

class Observable<T>
{
    private readonly m_item: T;

    private readonly m_properties: DynamicProperty[];

    public constructor (item: T)
    {
        if (item == null)
            return;

        let self = Observable.getSelf(item);

        if (self !== null)
            return self; // Don't redefine the observable object.

        this.m_item = item;
        this.m_properties = [];

        Object.defineProperty(item, OBSERVABLE_SELF, {
            configurable: false,
            writable: false,
            value: this,
            enumerable: false
        });

        this.makeObservable();
    }

    private static getSelf<T>(item: T): Observable<T>
    {
        return (item as any)[OBSERVABLE_SELF];
    }

    private makeObservable()
    {
        let properties = Object.keys(this.m_item)
            .map(name => ({ name: name, info: Object.getOwnPropertyDescriptor(this.m_item, name)}))
            .filter(x => x.info != null && x.info.configurable);

        for (let prop of properties)
            this.m_properties.push(new DynamicProperty(this.m_item, prop.name, prop.info));
    }
}
