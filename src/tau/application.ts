/* ================================================================================================================= */
/* ================================================================================================================= */

import { app } from "electron";

import { ENVIRONMENT_INFO, ElectronSupport } from "./common/startup";

import { IDisposable, IContainer, Container, IScope, Lifetime } from "lepton-di";

import { windowService } from "./services/windowService";

/* ================================================================================================================= */

export default class Application implements IDisposable
{
    private m_container: IContainer;
    private m_scope: IScope;

    public constructor()
    {
        this.m_container = new Container();

        windowService.configure(this.m_container);

        switch (ENVIRONMENT_INFO.electron)
        {
        case ElectronSupport.Main:
            this.mainConfigure();
            break;

        case ElectronSupport.Render:
            this.rendererConfigure();
            break;

        case ElectronSupport.None:
            this.browserConfigure();
            break;
        }

        this.configure(this.m_container);

        this.m_scope = this.m_container.beginScope();
    }

    public dispose()
    {
        if (this.m_scope)
            this.m_scope.dispose();

        if (this.m_container)
            this.m_container.dispose();

        this.m_scope = null;
        this.m_container = null;
    }

    public get scope(): IScope { return this.m_scope; }

    private mainConfigure()
    {
        // Not sure if these should be here or in the MainWindowService
        app.on('activate', () => this.onActivated());
        app.on('window-all-closed', () => this.onAllWindowsClosed());

        // This does belong here.
        app.on('ready', () => this.onReady());
    }

    private rendererConfigure()
    {
    }

    private browserConfigure()
    {
    }

    /**
     * Configures the application wide DI container.
     */
    public configure(container: IContainer)
    {
    }

    public quit(exitCode?: number): void
    {
        if (exitCode != null)
            process.exitCode = exitCode;

        app.quit();
    }

    protected onReady(): void
    {
        // Menu Init needs to happen after app.ready event, but in main process.

        this.createWindow();
    }

    protected onActivated(): void
    {
    }

    private createWindow(): void
    {
        //let indexFile = path.resolve(`${__dirname}/../index.html`);
        //let mainFile = path.resolve(`${__dirname}/../MainWindow`);

        //this.m_winService.open(indexFile, mainFile);
    }

    private onAllWindowsClosed(): void
    {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (process.platform !== "darwin")
            this.quit();
    }
}

/* ================================================================================================================= */
