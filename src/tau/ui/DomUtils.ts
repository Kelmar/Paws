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
/**
 * Utility to detach a child from it's parent.
 */
function detachElement(): void
{
    if (this.parentElement)
        this.parentElement.removeChild(this);
}

declare global
{
    interface HTMLElement
    {
        detach(): void;
    }
}

HTMLElement.prototype.detach = detachElement;

/* ================================================================================================================= */

export {}

/* ================================================================================================================= */
