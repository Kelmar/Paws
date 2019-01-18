/* ================================================================================================================= */
/* ================================================================================================================= */

import { isObject } from "../common";

import { Dynamic } from "./dynamic";

export * from "./dynamicBase"
export * from "./dynamicObject";
export * from "./dynamicSet";

/* ================================================================================================================= */

export const DYNAMIC_TAG: unique symbol = Symbol("tau:dynamic");

/* ================================================================================================================= */

export function dynamicDispose(item: any): void
{
    if (item == null || !isObject(item))
        return;

    let childHandler: Dynamic = (item as any)[DYNAMIC_TAG];

    if (childHandler != null)
        childHandler.dispose();

    let dispose = (item as any)["dispose"];

    if (typeof dispose == "function")
        dispose.apply(item);
}

/* ================================================================================================================= */
