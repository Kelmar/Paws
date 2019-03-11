/* ================================================================================================================= */
/* ================================================================================================================= */

import { isObject, LinkedList, Predicate, toPredicate, Reducer } from "../common";

import { ModelEventType } from "./common";
import { DynamicBase, dynamicDispose } from "./internal";
import { Dynamic, makeDynamic } from "./dynamic";

/* ================================================================================================================= */

export class DynamicArray<T> extends DynamicBase implements Dynamic
{
    constructor(readonly target: Array<T>)
    {
        super();

        target = target || [];
    }

    public concat(...args: any[]): T[]
    {
        return this.target.concat(...args);
    }

    public copyWithin(target: number, start?: number, end?: number): DynamicArray<T>
    {
        start = start || 0;

        if (target < 0)
            target = this.target.length + target;

        if (start < 0)
            start = this.target.length + start;

        if (end === undefined || end === null)
            end = this.target.length;

        if (end < 0)
            end = this.target.length + end;

        target = Math.min(target, this.target.length);
        start = Math.min(start, this.target.length);
        end = Math.min(end, this.target.length);

        for (let i = start; i < end && target < this.target.length; ++i, ++target)
        {
            if (this.target[target] !== this.target[i])
            {
                dynamicDispose(this.target[target]);

                this.target[target] = this.target[i];

                this.raise(ModelEventType.Changed, target, this.target[i]);
            }
        }

        return this;
    }

    public entries(): IterableIterator<[number, T]>
    {
        return this.target.entries();
    }

    public every(predicate: Predicate<T>, thisArg?: any): boolean
    {
        return this.target.every(predicate, thisArg);
    }

    public fill(value: T, start?: number, end?: number): DynamicArray<T>
    {
        start = start || 0;
        end = end || this.target.length;

        value = isObject(value) ? makeDynamic(value) : value;

        for (let i = start; i < end; ++i)
        {
            if (this.target[i] !== value)
            {
                var wasEmpty: boolean = this.target[i] === null || this.target[i] === undefined;

                if (!wasEmpty)
                    dynamicDispose(this.target[i]);

                this.target[i] = value;

                this.raise(wasEmpty ? ModelEventType.Added : ModelEventType.Changed, i, value);
            }
        }

        return this;
    }

    public filter(predicate: Predicate<T>, thisArg?: any): T[]
    {
        return this.target.filter(predicate, thisArg);
    }

    public find(predicate: Predicate<T>, thisArg?: any): T
    {
        return this.target.find(predicate, thisArg);
    }

    public findIndex(predicate: Predicate<T>, thisArg?: any): number
    {
        return this.target.findIndex(predicate, thisArg);
    }

    public forEach(callback: (item: T) => void, thisArg?: any): void
    {
        this.target.forEach(callback, thisArg);
    }

    public includes(value: T, fromIndex?: number): boolean
    {
        return this.target.includes(value, fromIndex);
    }

    public indexOf(value: T, fromIndex?: number): number
    {
        return this.target.indexOf(value, fromIndex);
    }

    public join(seperator?: string): string
    {
        return this.target.join(seperator);
    }

    public keys(): IterableIterator<number>
    {
        return this.target.keys();
    }

    public lastIndexOf(value: T, fromIndex?: number): number
    {
        return this.target.lastIndexOf(value, fromIndex);
    }

    public *map<U>(mapper: (value: T) => U): IterableIterator<U>
    {
        for (let item of this.target)
            yield mapper(item);
    }

    public pop(): T
    {
        return null;
    }
}

/* ================================================================================================================= */
