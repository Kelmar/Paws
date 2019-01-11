/* ================================================================================================================= */
/* ================================================================================================================= */

import { Window, Label } from "./tau/ui";

import { IContainer, Container } from "lepton-di";

import { services } from "./tau/services";
import { IWindowService } from "./tau/services/windowService";

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
    

    public configure(): void
    {
        this.container = new Container();
        services.initialize(this.container, IWindowService);
    }

    public ready(): void
    {
        this.mainWindow = new MainWindow();
    }
}

/* ================================================================================================================= */

