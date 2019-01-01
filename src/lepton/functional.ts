/* ================================================================================================================= */
/*
 * DESCRIPTION:
 *   Library of utilities for working with functions and functional programming.
 */
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
