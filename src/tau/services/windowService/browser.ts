/* ================================================================================================================= */
/* ================================================================================================================= */

import { WindowID, WindowOpenOptions, IWindowService } from ".";

/* ================================================================================================================= */

export class BrowserWindowService implements IWindowService
{
    public open(indexFile: string, mainFile: string, options?: WindowOpenOptions): Promise<WindowID>
    {
        return Promise.resolve(0);
    }

    public close(window: WindowID): Promise<void>
    {
        return Promise.resolve();
    }
}

/* ================================================================================================================= */

