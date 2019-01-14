/* ================================================================================================================= */
/* ================================================================================================================= */

import { IContainer, Container, Lifetime, IScope, inject } from "lepton-di";

import { transport } from "../tau/services/transport";
import { IServiceClient } from "../tau/services/common";
import { ServiceClient } from "../tau/services";

import { Window } from "../tau/ui";

import { IWindowService } from "../tau/ui/services/windowService";
import { RendererWindowService } from "../tau/ui/services/windowService/renderer";

import { ILogMonitor, LogEvent } from "../services/logMonitorService";
import { RendererLogMonitor } from "../services/logMonitorService/renderer";

import { LogView } from "./LogView";

/* ================================================================================================================= */

export class MainWindow extends Window
{
    @inject(ILogMonitor)
    public logMonitor: ILogMonitor;

    private logView = new LogView();

    constructor()
    {
        super();
        this.title = "Paws";

        this.add(this.logView);
    }

    public start()
    {
        this.logMonitor.event$.subscribe((e: LogEvent) =>
        {
            this.logView.addLine(e);
        });

        this.logMonitor.open("udp4://localhost");
    }
}

/* ================================================================================================================= */

export class Main
{
    public container: IContainer;

    public mainWindow: MainWindow;
    public scope: IScope;

    public configure(): void
    {
        this.container = new Container();

        transport.configure(this.container);

        this.container
            .register(IServiceClient)
            .toClass(ServiceClient)
            .with(Lifetime.Singleton);

        this.container
            .register(IWindowService)
            .toClass(RendererWindowService)
            .with(Lifetime.Singleton);

        this.container
            .register(ILogMonitor)
            .toClass(RendererLogMonitor)
            .with(Lifetime.Singleton);

        this.scope = this.container.beginScope();
    }

    public ready(): void
    {
        this.mainWindow = new MainWindow();
        this.scope.buildUp(this.mainWindow);
        this.mainWindow.start();
    }
}

/* ================================================================================================================= */

