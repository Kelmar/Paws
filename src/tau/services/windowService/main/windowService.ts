/* ================================================================================================================= */
/* ================================================================================================================= */

import { BrowserWindow } from "electron";

import * as url from "url";

import { IDisposable } from "lepton-di";

import { WindowOptions } from "tau/ui";

import { WindowID, IWindowService, WindowOpenOptions, FrameType } from "../common/windowService";

/* ================================================================================================================= */

const DEFAULT_WINDOW_OPEN_OPTIONS: WindowOpenOptions = {
    frameType: FrameType.Default,
    showDevTools: process.env["DEV_TOOLS"] == '1',
}

/* ================================================================================================================= */

export class MainWindowService implements IWindowService, IDisposable
{
    private readonly m_windows: Map<WindowID, BrowserWindow> = new Map();

    public dispose()
    {
        for (let win of this.m_windows)
            win[1].close();

        this.m_windows.clear();
    }

    public open(indexFile: string, mainFile: string, options?: WindowOpenOptions): WindowID
    {
        options = {...DEFAULT_WINDOW_OPEN_OPTIONS, ...options};

        let bwOptions: Electron.BrowserWindowConstructorOptions = {
            width: 800,
            height: 600,
            show: false,
            webPreferences: { nodeIntegration: true }
        };

        let useCustomFrame = options.frameType == FrameType.Custom || options.frameType == FrameType.Default;

        if (process.platform == 'darwin' && useCustomFrame)
        {
            bwOptions.frame = true;
            bwOptions.titleBarStyle = 'hidden';
        }
        else
        {
            bwOptions.frame = !useCustomFrame;
        }

        let window = new BrowserWindow(bwOptions);
        this.m_windows.set(window.id, window);
       
        let remoteOptions: WindowOptions = {
            mainClass: 'Main',
            fileName: mainFile
        };

        let loc = url.format({
            protocol: 'file',
            pathname: indexFile,
            slashes: true,
            hash: encodeURIComponent(JSON.stringify(remoteOptions))
        });

        window.loadURL(loc);

        window.on('close', () =>
        {
            this.m_windows.delete(window.id);
            window = null;
        });

        window.on('ready-to-show', () =>
        {
            window.show();

            if (options.showDevTools)
                window.webContents.toggleDevTools();
        });

        return window.id;
    }

    public close(window: WindowID): void
    {
        let win = this.m_windows.get(window);

        if (win)
        {
            this.m_windows.delete(window);
            win.close();
        }
    }
}

/* ================================================================================================================= */
