/* ================================================================================================================= */
/* ================================================================================================================= */

import { isObject, LinkedList, Predicate, toPredicate, Reducer } from "../common";

import { ModelEventType } from "./common";
import { DynamicBase, dynamicDispose } from "./internal";
import { Dynamic, makeDynamic } from "./dynamic";

/* ================================================================================================================= */

export class DynamicList<T> extends DynamicBase implements Dynamic
{
    constructor(readonly target: LinkedList<T>)
    {
        super();

        target = target || new LinkedList();
    }

    public get length(): number
    {
        return this.target.length;
    }

    public clear(): void
    {
        let tmp = Array.from(this.target);

        this.target.clear();
        this.raise(ModelEventType.Cleared);

        for (let item of tmp)
            dynamicDispose(item);
    }

    public shift(): T
    {
        let item = this.target.shift();

        if (item)
        {
            this.raise(ModelEventType.Deleted, '', item);
            // Not sure we should dispose sense we return the item itself.
        }

        return item;
    }

    public unshift(item: T): void
    {
        item = isObject(item) ? makeDynamic(item) : item;

        this.target.unshift(item);
        this.raise(ModelEventType.Added, '', item);
    }

    public push(item: T): void
    {
        item = isObject(item) ? makeDynamic(item) : item;

        this.target.push(item);
        this.raise(ModelEventType.Added, '', item);
    }

    public pop(): T
    {
        let item = this.target.pop();

        if (item)
        {
            this.raise(ModelEventType.Deleted, '', item);
            // Not sure we should dispose sense we return the item itself.
        }

        return item;
    }

    public some(predicate?: Predicate<T>): boolean
    {
        return this.target.some(predicate);
    }

    public every(predicate: Predicate<T>): boolean
    {
        return this.target.every(predicate);
    }

    public delete(item: T | Predicate<T>): void
    {
        let predicate: Predicate<T> = toPredicate(item);

        let tmp = Array.from(this.target.filter(predicate));

        this.target.delete(item);

        for (let i of tmp)
            this.raise(ModelEventType.Deleted, '', i);
    }

    public filter(predicate: Predicate<T>): IterableIterator<T>
    {
        return this.target.filter(predicate);
    }

    public forEach(callback: (X: T) => void): void
    {
        this.target.forEach(callback);
    }

    public forEachBackwards(callback: (X: T) => void): void
    {
        this.target.forEachBackwards(callback);
    }

    public map<U>(callback: (x: T) => U): IterableIterator<U>
    {
        return this.target.map(callback);
    }

    public reduce<TResult>(callback: Reducer<T, TResult>, initial?: TResult): TResult
    {
        return this.target.reduce(callback, initial);
    }

    public reduceRight<TResult>(callback: Reducer<T, TResult>, initial?: TResult): TResult
    {
        return this.target.reduceRight(callback, initial);
    }

    public backwards(): IterableIterator<T>
    {
        return this.target.backwards();
    }

    [Symbol.iterator](): Iterator<T>
    {
        return this.target[Symbol.iterator]();
    }
}

/* ================================================================================================================= */
