import Application from './Application';
import Server from './backend/Server';

// Force initialization of IPC transport layer.
import { IPC } from './backend/IpcTransport';
import { Container } from './lepton/container';
import { using } from './lepton';

let container = new Container();

IPC.configure(container);

using (container.beginScope(), scope =>
{
    var server: Server = new Server();
    scope.buildUp(server);

    server.start();

    var app: Application = new Application();
});
