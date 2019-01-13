/* ================================================================================================================= */
/* ================================================================================================================= */

import { endpoint, event, service, ServiceTarget } from "../../../services";

import { WindowID, WindowOpenOptions, IWindowService } from "./common";
import { Observable } from "rxjs";

/* ================================================================================================================= */

@service(IWindowService, ServiceTarget.Browser)
export class BrowserWindowService implements IWindowService
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

    @endpoint
    public send(value: string): Promise<void>
    {
        return Promise.resolve();
    }

    @event
    public get test$(): Observable<string>
    {
        return null;
    }
}

/* ================================================================================================================= */
