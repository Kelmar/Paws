/* ================================================================================================================= */
/*
 * DESCRIPTION:
 *   Library of utilities for working with functions and functional programming.
 */
/* ================================================================================================================= */

declare global
{
    interface Map<K, V>
    {
        reduce<TResult>(callback: MapReducer<K, V, TResult>, initial?: TResult): TResult;
    }
}

/* ================================================================================================================= */

export interface Reducer<TValue, TResult>
{
    (acc: TResult, value: TValue): TResult;
}

/* ================================================================================================================= */

/**
 * A function describing a matching condition for the given item.
 * 
 * @example
 * // A predicate that matches an item when it's name is 'Joe'
 * let isJoe: Predicate<Item> = (i: Item) => i.name === 'Joe';
 * 
 * console.log(isJoe({ name: 'Joe' }); // Expected output: true
 * console.log(isJos({ name: 'Bob' }); // Expected output: false
 */
export interface Predicate<T>
{
    (item: T): boolean
}

/* ================================================================================================================= */

/**
 * Garantees a predicate if given an item or a predicate.
 *
 * @param item The item or predicate to match.
 */
export function toPredicate<T>(item: T | Predicate<T>): Predicate<T>
{
    return (typeof item === 'function') ? item as Predicate<T> : (x: T) => x == item;
}

/* ================================================================================================================= */

/**
 * A function that describes a matching condition for the given key/value pair.
 */
export interface MapPredicate<K, V>
{
    (key: K, value: V): boolean;
}

/* ================================================================================================================= */
/**
 * Executes a callback and returns the results as a resolved or rejected Promise.
 *
 * @param cb The callback to execute.
 */
export function promiseWrap<T>(cb: () => T): Promise<T>
{
    try
    {
        return Promise.resolve(cb());
    }
    catch (e)
    {
        return Promise.reject(e);
    }
}

/* ================================================================================================================= */

export interface MapReducer<K, V, TResult>
{
    (acc: TResult, key: K, value: V): TResult;
}

/* ================================================================================================================= */

function mapReduce<TKey, TValue, TResult>(callback: MapReducer<TKey, TValue, TResult>, initial?: TResult): TResult
{
    let acc: TResult = initial;

    this.forEach((key: TKey, value: TValue) => { acc = callback(acc, key, value); });

    return acc;
}

Map.prototype.reduce = mapReduce;

/* ================================================================================================================= */

export function isObject(value: any): value is object
{
    return (typeof value == "object");
}

/* ================================================================================================================= */
