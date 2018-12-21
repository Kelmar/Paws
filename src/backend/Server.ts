import { ipcMain } from 'electron';
import { ITransportListener } from './Transport';
import { IpcListener } from './IpcTransport';

import IDisposable from '../common/lifecycle';

export default class Server implements IDisposable
{
    private readonly m_listener: ITransportListener

    constructor()
    {
        console.info("Server is starting...");

        if (ipcMain != null)
            this.m_listener = new IpcListener();
        else
            throw new Error("WebSocket version not implemented yet!");

        this.m_listener.listen();
    }

    public dispose()
    {
        if (this.m_listener != null)
            this.m_listener.dispose();
    }
}
