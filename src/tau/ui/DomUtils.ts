/* ================================================================================================================= */
/* ================================================================================================================= */

import { IDisposable } from "lepton-di";

/* ================================================================================================================= */

declare global
{
    interface EventTarget
    {
        listen(type: string, cb: (e: any) => void, useCapture?: boolean): IDisposable
    }
}

/* ================================================================================================================= */

function disposableListen(type: string, cb: (e: any) => void, useCapture?: boolean): IDisposable
{
    var self = this;
    this.addEventListener(type, cb, useCapture);

    return {
        dispose: () => {
            if (self)
            {
                self.removeEventListener(type, cb, useCapture);
                self = null;
            }
        }
    }
}

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

EventTarget.prototype.listen = disposableListen;

export {}

/* ================================================================================================================= */
