/* ================================================================================================================= */
/* ================================================================================================================= */

import * as path from "path";

import { IContainer, Container, Lifetime, inject, IScope } from "lepton-di";

import { transport } from "./tau/services/transport";
import { IServiceClient } from "./tau/services/common";
import { ServiceClient } from "./tau/services";
import { IWindowService } from "./tau/ui/services/windowService";

import { Window, Label, Button } from "./tau/ui";
import { RendererWindowService } from "./tau/ui/services/windowService/renderer";

/* ================================================================================================================= */

export class MainWindow extends Window
{
    @inject(IWindowService)
    private readonly windowService: IWindowService;

    constructor()
    {
        super();
        this.title = "Paws";

        let l = new Label("Welcome!", { tagName: "H1" });
        l.addClass("center");

        this.add(l);

        let b = new Button("Open");
        b.click$.subscribe(() =>
        {
            let indexFile = path.resolve(`${__dirname}/index.html`);
            let mainFile = path.resolve(`${__dirname}/MainWindow`);

            this.windowService.open(indexFile, mainFile);
        });

        this.add(b);

        let b2 = new Button("Test");
        b2.click$.subscribe(() =>
        {
            this.windowService.send("Foo");
        });

        this.add(b2);
    }

    public start()
    {
        this.windowService.test$.subscribe(x =>
        {
            console.log("windowService.test$:", x);
        });
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

