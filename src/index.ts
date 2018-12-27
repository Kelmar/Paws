/* ================================================================================================================= */
/* ================================================================================================================= */

import Application from './Application';
import Server from './backend/Server';

// Force initialization of IPC transport layer.
import { transport } from './backend/transport';
import { Container } from './lepton/container';
import { using } from './lepton';

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
