/* ================================================================================================================= */
/* ================================================================================================================= */

import { ipcMain, ipcRenderer, IpcMain, IpcRenderer, WebContents,  } from 'electron';

import { FunctionDefinition, GenericFunction, ServiceBuilder } from './base';

/* ================================================================================================================= */

type SourceType = IpcMain | IpcRenderer;
type TargetType = WebContents | IpcRenderer;

/* ================================================================================================================= */

export class IpcServiceBuilder<T> extends ServiceBuilder<T>
{
    private m_target: TargetType = null;

    constructor (public readonly name: string, target: TargetType)
    {
        super();
        this.m_target = target;
    }

    protected buildFunction(fn: FunctionDefinition<T>): GenericFunction
    {
        let channelName = 'tau:rpc:' + this.name + "." + fn.name;

        return (...args: any[]) => this.m_target.send(channelName, ...args);
    }
}

/* ================================================================================================================= */

