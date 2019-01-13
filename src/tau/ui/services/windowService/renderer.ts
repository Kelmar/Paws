/* ================================================================================================================= */
/* ================================================================================================================= */

import { inject } from "lepton-di";

import { IServiceClient } from "../../../services";

import { WindowID, WindowOpenOptions, IWindowService } from "./common";

/* ================================================================================================================= */

export class RendererWindowService implements IWindowService
{
    constructor (@inject(IServiceClient) private readonly client: IServiceClient)
    {
        // TODO: Use a factory to get a client with an established base name.
    }

    public open(indexFile: string, mainFile: string, options?: WindowOpenOptions): Promise<WindowID>
    {
        const name = IWindowService.toString() + ".open";
        return this.client.call(name, indexFile, mainFile, options);
    }

    public close(window: WindowID): Promise<void>
    {
        const name = IWindowService.toString() + ".close";
        return this.client.call(name, window);
    }
}

/* ================================================================================================================= */
