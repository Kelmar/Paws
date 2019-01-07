/* ================================================================================================================= */
/* ================================================================================================================= */

import { Window, Label } from './tau/ui';

/* ================================================================================================================= */

export class MainWindow extends Window
{
    constructor()
    {
        super();
        this.title = 'Paws';
        let l = new Label('Testing');
        this.add(l);
    }
}

/* ================================================================================================================= */

export class Main
{
    public mainWindow: MainWindow;

    public configure(): void
    {
    }

    public ready(): void
    {
        this.mainWindow = new MainWindow();
    }
}

/* ================================================================================================================= */

