/* ================================================================================================================= */
/* ================================================================================================================= */

import * as path from "path";

import { inject } from "lepton-di";

import { ServiceServer } from "./tau/services";

import Application, { IApplicationBehavior } from "./tau/application";

import { IWindowService } from "./tau/ui/services/windowService";

import { MainLogMonitor } from "./services/logMonitorService/main";

/* ================================================================================================================= */

class Paws implements IApplicationBehavior 
{
    @inject(IWindowService)
    public readonly windowService: IWindowService;

    constructor()
    {
    }

    public configureServices(server: ServiceServer)
    {
        server.register(MainLogMonitor);
    }

    public start(): void
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
