/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from "rxjs";

import { inject } from "lepton-di";

import { IServiceClient } from "../../tau/services";

import { ILogMonitor, LogEvent } from "./common";

/* ================================================================================================================= */

export class RendererLogMonitor implements ILogMonitor
{
    constructor (@inject(IServiceClient) private readonly client: IServiceClient)
    {
        // TODO: Use a factory to get a client with an established base name.
    }

    public open(sourceName: string): Promise<void>
    {
        const name = ILogMonitor.toString() + ".open";
        return this.client.call(name, sourceName);
    }

    public get event$(): Observable<LogEvent>
    {
        const name = ILogMonitor.toString() + ".event$";
        return this.client.listen(name);
    }
}


/* ================================================================================================================= */
