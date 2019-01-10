/* ================================================================================================================= */
/* ================================================================================================================= */

import { IContainer } from 'lepton-di';

import Application from './tau/application';
import Server from './backend/server';

import { transport } from './backend/transport';

/* ================================================================================================================= */

class PawsApplication extends Application
{
    private m_server: Server;

    constructor()
    {
        super();
    }

    public configure(container: IContainer)
    {
        transport.configure(container);

        this.m_server = new Server();
        this.scope.buildUp(this.m_server);

        this.m_server.start();
    }
}

/* ================================================================================================================= */

let app = new PawsApplication();

/* ================================================================================================================= */
