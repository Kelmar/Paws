/* ================================================================================================================= */
/* ================================================================================================================= */

import { WindowID, WindowOpenOptions } from ".";
import { ServiceTarget, service, endpoint } from "..";

/* ================================================================================================================= */

@service("Window", ServiceTarget.Browser)
export class BrowserWindowService
{
    @endpoint
    public open(indexFile: string, mainFile: string, options?: WindowOpenOptions): Promise<WindowID>
    {
        return Promise.resolve(0);
    }

    @endpoint
    public close(window: WindowID): Promise<void>
    {
        return Promise.resolve();
    }
}

/* ================================================================================================================= */

