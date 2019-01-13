/* ================================================================================================================= */
/* ================================================================================================================= */

import { inject } from "lepton-di";

import { endpoint, service, IServiceClient, ServiceTarget } from "../../../services";

import { WindowID, WindowOpenOptions, IWindowService } from "./common";

/* ================================================================================================================= */

@service(IWindowService, ServiceTarget.Renderer)
export class RendererWindowService implements IWindowService
{
    constructor (@inject(IServiceClient) private readonly client: IServiceClient)
    {
    }

    @endpoint
    public open(indexFile: string, mainFile: string, options?: WindowOpenOptions): Promise<WindowID>
    {
        return this.client.call("open", indexFile, mainFile, options);
    }

    @endpoint
    public close(window: WindowID): Promise<void>
    {
        return this.client.call("close", window);
    }
}

/* ================================================================================================================= */
