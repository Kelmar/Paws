/* ================================================================================================================= */
/* ================================================================================================================= */

import { isObject } from "../common";

import { ModelEventType } from "./common";
import { DynamicBase, dynamicDispose } from "./internal";
import { Dynamic, makeDynamic } from "./dynamic";

/* ================================================================================================================= */

export class DynamicMap<TKey, TValue> extends DynamicBase implements Dynamic
{
    constructor(readonly target?: Map<TKey, TValue>)
    {
        super();

        target = target || new Map();
    }

    public get size(): number
    {
        return this.target.size;
    }

    public get [Symbol.toStringTag](): string
    {
        return this.target[Symbol.toStringTag];
    }

    public clear(): void
    {
        // Save a copy of the map so we can dispose of the objects after our event.
        let tmp: TValue[] = Array.from(this.target.values());

        this.target.clear();
        this.raise(ModelEventType.Cleared);

        for (let item of tmp)
            dynamicDispose(item);
    }

    public delete(key: TKey): boolean
    {
        let item: TValue = this.target.get(key);

        if (this.target.delete(key))
        {
            this.raise(ModelEventType.Deleted, key, item);
            dynamicDispose(item);

            return true;
        }

        return false;
    }

    public entries(): IterableIterator<[TKey, TValue]>
    {
        return this.target.entries();
    }

    public forEach(callback: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void, thisArg?: any): void
    {
        this.target.forEach(callback, thisArg);
    }

    public get(key: TKey): TValue
    {
        return this.target.get(key);
    }

    public has(key: TKey): boolean
    {
        return this.target.has(key);
    }

    public keys(): IterableIterator<TKey>
    {
        return this.target.keys();
    }

    public set(key: TKey, value: TValue): DynamicMap<TKey, TValue>
    {
        let oldValue = this.target.get(key);

        if (oldValue !== value)
        {
            this.target.set(key, isObject(value) ? makeDynamic(value) : value);

            if (oldValue)
            {
                this.raise(ModelEventType.Changed, key, value);
                dynamicDispose(oldValue);
            }
            else
            {
                this.raise(ModelEventType.Added, key, value);
            }
        }

        return this;
    }

    public values(): IterableIterator<TValue>
    {
        return this.target.values();
    }

    public [Symbol.iterator](): Iterator<[TKey, TValue]>
    {
        return this.target[Symbol.iterator]();
    }
}

/* ================================================================================================================= */
