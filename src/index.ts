/* ================================================================================================================= */
/* ================================================================================================================= */

import * as path from "path";

import { inject, IResolver } from "lepton-di";

import Application, { IApplicationBehavior } from "./tau/application";

import { IWindowService } from "./tau/ui/services/windowService";

/* ================================================================================================================= */

class Paws implements IApplicationBehavior 
{
    @inject(IResolver)
    public readonly resolver: IResolver;

    @inject(IWindowService)
    public readonly windowService: IWindowService;

    constructor()
    {
    }

    public ready(): void
    {
        this.createWindow();
    }

    private createWindow(): void
    {
        let indexFile = path.resolve(`${__dirname}/ui/index.html`);
        let mainFile = path.resolve(`${__dirname}/ui/MainWindow`);

        this.windowService.open(indexFile, mainFile);
    }
}

/* ================================================================================================================= */

let app = new Application(new Paws());

/* ================================================================================================================= */
