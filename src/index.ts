import Application from './Application';
import Server from './backend/Server';

// Force initialization of IPC transport layer.
import { IPC } from './backend/IpcTransport';

IPC.init();

var server: Server = new Server();
var app: Application = new Application();
