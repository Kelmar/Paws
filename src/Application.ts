import { app, BrowserWindow, ipcMain } from "electron";
import { IDisposable } from "lepton-di";

export default class Application implements IDisposable
{
    private window: BrowserWindow;
    
    public constructor()
    {
        app.on('ready', () => this.onReady());
        app.on('activate', () => this.createWindow());
        app.on('window-all-closed', () => this.onAllWindowsClosed());
    }

    public dispose()
    {
        if (this.window != null)
            this.window.close();

        this.window = null;
    }

    public quit(exitCode?: number): void
    {
        if (exitCode != null)
            process.exitCode = exitCode;

        app.quit();
    }

    private onReady(): void
    {
        this.createWindow();
    }

    private createWindow(): void
    {
        if (this.window != null)
            return;
            
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
        });

        this.window.loadFile(`${__dirname}/index.html`);

        this.window.on('close', () =>
        {
            
            this.window = null;
        });

        this.window.on('ready-to-show', () =>
        {
            this.window.show();
        })
    }

    private onAllWindowsClosed(): void
    {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (process.platform !== 'darwin')
            this.quit();
    }
}
