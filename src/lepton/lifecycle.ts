/* ================================================================================================================= */
/*
 * Description: Object lifecycle management and clean up.
 */
/* ================================================================================================================= */

import { IDisposable } from "./interfaces";

/* ================================================================================================================= */

/**
 * Describes how an object's lifetime should be manaaged.
 */
export enum Lifetime
{
    /**
     * A new object is created on each request to resolve().
     */
    Transient,

    /**
     * A new object is created bound to the lifetime of the current scope.
     */
    Scoped,

    /**
     * A single object instance is created once and only once per container.
     */
    Singleton
}

/* ================================================================================================================= */
/**
 * Guarantees object disposal.
 *
 * The callback is called with the given item.  Once complete, the item's dispose() method is called.
 *
 * If the supplied item value is null, the callback will still be called, but the dispose() method will not be called.
 *
 * @param item The item to dispose
 * @param fn The function to call on the item.
 *
 * @example using(myObj, item =>
 * {
 *     // item is the same reference as myObj.
 *     item.doThings();
 * }); // dispose() method on myObj, called here.
 */
export function using<T extends IDisposable>(item: T, fn: (item: T) => void): void
{
    try
    {
        fn(item);
    }
    finally
    {
        if (item != null)
            item.dispose();
    }
}

/* ================================================================================================================= */
