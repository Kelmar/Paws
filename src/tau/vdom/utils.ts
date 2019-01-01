/* ================================================================================================================= */
/* ================================================================================================================= */

import { Predicate, MapPredicate } from "../../lepton";

/* ================================================================================================================= */

declare global
{
    interface NamedNodeMap
    {
        filter(predicate: Predicate<Attr>): IterableIterator<Attr>;
    }
}

/* ================================================================================================================= */

function *attributeMapFilter(predicate: Predicate<Attr>): IterableIterator<Attr>
{
    for (let attr of this as Array<Attr>)
    {
        if (predicate(attr))
            yield attr;
    }
}

/* ================================================================================================================= */

NamedNodeMap.prototype.filter = attributeMapFilter;

export {}

/* ================================================================================================================= */
