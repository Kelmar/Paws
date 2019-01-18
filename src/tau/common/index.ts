/* ================================================================================================================= */
/*
 * DESCRIPTION:
 *   Miscilanious common runtime library items.
 */
/* ================================================================================================================= */

import { isArray } from "util";

import { LinkedList } from "./linkedList";

/* ================================================================================================================= */

export * from "./functional";
export * from "./linkedList";
export * from "./string";

export * from "./logging";
export * from "./startup";

/* ================================================================================================================= */

export type Collection<T> = Array<T> | LinkedList<T> | Set<T> | Map<any, T>;

export function isLinkedList(obj: any): obj is LinkedList<any>
{
    return (obj instanceof LinkedList);
}

export function isSet(obj: any): obj is Set<any>
{
    return (obj instanceof Set);
}

export function isMap(obj: any): obj is Map<any, any>
{
    return (obj instanceof Map);
}

export function isCollection(obj: any): obj is Collection<any>
{
    return isArray(obj) || isLinkedList(obj) || isSet(obj) || isMap(obj);
}

/* ================================================================================================================= */
