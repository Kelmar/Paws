/* ================================================================================================================= */
/* ================================================================================================================= */

import { app } from "electron";
import * as path from 'path';

import { IDisposable } from "lepton-di";

import { MainWindowService } from "./services/windowService/main/windowService";

/* ================================================================================================================= */

export default class Application implements IDisposable
{
    private m_winService: MainWindowService = new MainWindowService();

    public constructor()
    {
        app.on('ready', () => this.onReady());
        app.on('activate', () => this.createWindow());
        app.on('window-all-closed', () => this.onAllWindowsClosed());
    }

    public dispose()
    {
        if (this.m_winService)
            this.m_winService.dispose();

        this.m_winService = null;
    }

    public quit(exitCode?: number): void
    {
        if (exitCode != null)
            process.exitCode = exitCode;

        app.quit();
    }

    private onReady(): void
    {
        // Menu Init needs to happen after app.ready event, but in main process.

        this.createWindow();
    }

    private createWindow(): void
    {
        let indexFile = path.resolve(`${__dirname}/../index.html`);
        let mainFile = path.resolve(`${__dirname}/../MainWindow`);

        this.m_winService.open(indexFile, mainFile);
    }

    private onAllWindowsClosed(): void
    {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (process.platform !== 'darwin')
            this.quit();
    }
}

/* ================================================================================================================= */
