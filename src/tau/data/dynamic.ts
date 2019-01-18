/* ================================================================================================================= */
/* ================================================================================================================= */

import { isArray } from "util";

import { Observable } from "rxjs";

import { IDisposable } from "lepton-di";

import { isCollection, isSet, isMap, isLinkedList } from "../common";

import { ModelEvent } from "./common";
import { DYNAMIC_TAG, DynamicObject, DynamicSet, DynamicMap, DynamicList } from "./internal";

/* ================================================================================================================= */

export interface Dynamic extends IDisposable
{
    /**
     * The observerable that events can be subscribed to.
     */
    readonly change$: Observable<ModelEvent>;

    /**
     * Sends a ping notification event, useful for forcing updates on computed properties.
     */
    notify(): void;
}

/* ================================================================================================================= */

export function makeDynamic<T extends object>(item: T): T & Dynamic
{
    if (item == null)
        return null;

    let dynamic = (item as any)[DYNAMIC_TAG];

    if (dynamic != null)
        return (dynamic as (T & Dynamic));

    if (!isCollection(item))
        dynamic = new Proxy(item, new DynamicObject<T>(item));
    else if (isSet(item))
        dynamic = new DynamicSet(item);
    else if (isMap(item))
        dynamic = new DynamicMap(item);
    else if (isLinkedList(item))
        dynamic = new DynamicList(item);
    else if (isArray(item))
    {
    }
    else
        throw new Error("Unsupported type: " + typeof item);

    (item as any)[DYNAMIC_TAG] = dynamic;
    return (dynamic as (T & Dynamic));
}

/* ================================================================================================================= */
 