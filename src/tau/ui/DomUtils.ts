/* ================================================================================================================= */
/* ================================================================================================================= */

/* ================================================================================================================= */

export function findOrCreateTag(tagName: string): HTMLElement
{
    let items = document.getElementsByTagName(tagName);
    let rval: HTMLElement;

    if (items.length == 0)
    {
        rval = document.createElement(tagName);
        document.appendChild(rval);
    }
    else
        rval = items[0] as HTMLElement;

    return rval;
}

/* ================================================================================================================= */
