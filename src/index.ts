/* ================================================================================================================= */
/* ================================================================================================================= */

import { Container } from 'lepton-di';

import Application from './tau/application';
import Server from './backend/server';

import { transport } from './backend/transport';
import { menuService } from './tau/services/menuService';

/* ================================================================================================================= */

let container = new Container();

transport.configure(container);
menuService.configure(container);

let scope = container.beginScope();

let server: Server = new Server();
scope.buildUp(server);

server.start();

let app: Application = null;

if (process.versions.electron != null)
    app = new Application();

/* ================================================================================================================= */
