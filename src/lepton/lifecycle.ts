/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable } from "./interfaces";

/* ================================================================================================================= */

export enum Lifetime
{
    Transient,
    Scoped,
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
