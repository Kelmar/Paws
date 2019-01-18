/* ================================================================================================================= */
/* ================================================================================================================= */

import { isObject } from "../common";

import { ModelEventType } from "./common";
import { DynamicBase, dynamicDispose } from "./internal";
import { Dynamic, makeDynamic } from "./dynamic";

/* ================================================================================================================= */

export class DynamicSet<TKey> extends DynamicBase implements Dynamic
{    
    constructor(readonly target?: Set<TKey>)
    {
        super();

        target = target || new Set<TKey>();
    }

    public add(item: TKey): DynamicSet<TKey>
    {
        let cnt = this.target.size;

        let toInsert = isObject(item) ? makeDynamic(item) : item;

        this.target.add(toInsert);

        if (cnt != this.target.size)
            this.raise(ModelEventType.Added, '', item);

        return this;
    }

    public clear(): void
    {
        // Save a copy of the set so we can dispose of the objects after our event.
        let tmp: TKey[] = Array.from(this.target);

        this.target.clear();
        this.raise(ModelEventType.Cleared);

        for (let item of tmp)
            dynamicDispose(item);
    }

    public delete(item: TKey): boolean
    {
        if (this.target.delete(item))
        {
            this.raise(ModelEventType.Deleted, '', item);
            dynamicDispose(item);
            return true;
        }

        return false;
    }

    public forEach(callback: (item: TKey) => void): void
    {
        this.target.forEach(callback);
    }

    public has(item: TKey): boolean
    {
        return this.target.has(item);
    }

    public values(): IterableIterator<TKey>
    {
        return this.target.values();
    }

    public [Symbol.iterator](): Iterator<TKey>
    {
        return this.target[Symbol.iterator]();
    }
}

/* ================================================================================================================= */
