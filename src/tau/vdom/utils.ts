/* ================================================================================================================= */
/* ================================================================================================================= */

import { Predicate, MapPredicate } from "../../lepton";

/* ================================================================================================================= */

declare global
{
    interface NamedNodeMap
    {
        filter(predicate: MapPredicate<string, Attr>): IterableIterator<Attr>;
    }
}

/* ================================================================================================================= */

function *attributeMapFilter(predicate: MapPredicate<string, Attr>): IterableIterator<Attr>
{
    for (let key of this as Array<string>)
    {
        let value: Attr = this[key];

        if (predicate(key, value))
            yield value;
    }
}

/* ================================================================================================================= */

NamedNodeMap.prototype.filter = attributeMapFilter;

export {}

/* ================================================================================================================= */
