/* ================================================================================================================= */
/* ================================================================================================================= */

import { app } from "electron";

import { IDisposable, IContainer, Container, IScope, Lifetime } from "lepton-di";

import { ServiceServer } from "./services";
import { transport } from "./services/transport";

import { IWindowService } from "./ui/services/windowService";
import { MainWindowService } from "./ui/services/windowService/main";

/* ================================================================================================================= */

export interface IApplicationBehavior
{
    configure? (container: IContainer): void;

    configureServices?(server: ServiceServer): void;

    start? (): void;

    ready? (): void;
}

/* ================================================================================================================= */

export default class Application implements IDisposable
{
    private m_container: IContainer;
    private m_scope: IScope;

    private m_server: ServiceServer;

    public constructor(public readonly behavior: IApplicationBehavior)
    {
        this.m_container = new Container();

        if (behavior.configure)
            behavior.configure(this.m_container);

        transport.configure(this.m_container);

        // Not sure if these should be here or in the MainWindowService
        app.on('activate', () => this.onActivated());
        app.on('window-all-closed', () => this.onAllWindowsClosed());

        // This does belong here.
        app.on('ready', () => this.onReady());

        this.m_scope = this.m_container.beginScope();

        this.m_server = new ServiceServer();
        this.m_scope.buildUp(this.m_server);

        let windowService = this.m_server.register(MainWindowService);

        if (behavior.configureServices)
            behavior.configureServices(this.m_server);

        this.m_container
            .register(IWindowService)
            .toInstance(windowService)
            .with(Lifetime.Singleton);

        this.m_server.start();

        this.m_scope.buildUp(this.behavior);

        if (this.behavior.start)
            this.behavior.start();
    }

    public dispose()
    {
        if (this.m_server)
            this.m_server.dispose();

        if (this.m_scope)
            this.m_scope.dispose();

        if (this.m_container)
            this.m_container.dispose();

        this.m_server = null;
        this.m_scope = null;
        this.m_container = null;
    }

    public get scope(): IScope { return this.m_scope; }

    public quit(exitCode?: number): void
    {
        if (exitCode != null)
            process.exitCode = exitCode;

        app.quit();
    }

    protected onReady(): void
    {
        // Menu Init needs to happen after app.ready event, but in main process.

        if (this.behavior.ready)
            this.behavior.ready();
    }

    protected onActivated(): void
    {
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
