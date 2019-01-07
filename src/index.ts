/* ================================================================================================================= */
/* ================================================================================================================= */

import { Container } from 'lepton-di';

import Application from './Application';
import Server from './backend/Server';

import { transport } from './backend/transport';
import { menuService } from './tau/services/MenuService';

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
