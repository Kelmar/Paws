/* ================================================================================================================= */
/* ================================================================================================================= */

import Application from './Application';
import Server from './backend/Server';

// Force initialization of IPC transport layer.
import { transport } from './backend/transport';
import { using, Container } from 'lepton-di';

/* ================================================================================================================= */

let container = new Container();

transport.configure(container);

/* ================================================================================================================= */

using (container.beginScope(), scope =>
{
    let server: Server = new Server();
    scope.buildUp(server);

    server.start();

    if (process.versions.electron != null)
        var app: Application = new Application();

    server.run();
});

/* ================================================================================================================= */
