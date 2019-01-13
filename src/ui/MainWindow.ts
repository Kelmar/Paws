/* ================================================================================================================= */
/* ================================================================================================================= */

import { IContainer, Container, Lifetime, IScope } from "lepton-di";

import { transport } from "../tau/services/transport";
import { IServiceClient } from "../tau/services/common";
import { ServiceClient } from "../tau/services";

import { Window, Label } from "../tau/ui";

import { IWindowService } from "../tau/ui/services/windowService";
import { RendererWindowService } from "../tau/ui/services/windowService/renderer";

/* ================================================================================================================= */

export class MainWindow extends Window
{
    constructor()
    {
        super();
        this.title = "Paws";

        let l = new Label("Welcome!", { tagName: "H1" });
        l.addClass("center");

        this.add(l);
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
    }
}

/* ================================================================================================================= */

