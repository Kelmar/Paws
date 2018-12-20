import { app, BrowserWindow } from "electron";

export default class Application
{
    public constructor()
    {
        app.on('ready', () => this.createWindow());
        app.on('activate', () => this.createWindow());
        app.on('window-all-closed', () => this.onAllWindowsClosed());
    }

    public quit(exitCode?: number): void
    {
        if (exitCode != null)
            process.exitCode = exitCode;

        app.quit();
    }

    private createWindow(): void
    {
        var win: BrowserWindow = new BrowserWindow({width: 800, height: 600, show: false});

        win.loadFile(`${__dirname}/index.html`);

        win.on('ready-to-show', () =>
        {
            win.show();
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
