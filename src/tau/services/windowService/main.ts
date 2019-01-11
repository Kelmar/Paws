/* ================================================================================================================= */
/* ================================================================================================================= */

import { BrowserWindow } from "electron";

import * as url from "url";

import { IDisposable } from "lepton-di";

import { WindowOptions } from "tau/ui";

import { WindowID, WindowOpenOptions, FrameType } from ".";
import { ServiceTarget, service, endpoint } from "..";

/* ================================================================================================================= */

const DEFAULT_WINDOW_OPEN_OPTIONS: WindowOpenOptions = {
    frameType: FrameType.Default,
    showDevTools: process.env["DEV_TOOLS"] == '1',
}

/* ================================================================================================================= */

@service("Window", ServiceTarget.Main)
export class MainWindowService implements IDisposable
{
    private readonly m_windows: Map<WindowID, BrowserWindow> = new Map();

    public constructor()
    {
    }

    public dispose()
    {
        for (let win of this.m_windows)
            win[1].close();

        this.m_windows.clear();
    }

    @endpoint
    public open(indexFile: string, mainFile: string, options?: WindowOpenOptions): Promise<WindowID>
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

        return Promise.resolve(window.id);
    }

    @endpoint
    public close(window: WindowID): Promise<void>
    {
        let win = this.m_windows.get(window);

        if (win)
        {
            this.m_windows.delete(window);
            win.close();
        }

        return Promise.resolve();
    }
}

/* ================================================================================================================= */
