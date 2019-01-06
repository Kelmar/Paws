/* ================================================================================================================= */
/* ================================================================================================================= */

import { Control } from "./Control";
import { Label } from "./Label";
import { Panel } from "./Panel";
import { Button } from "./Button";
import { min } from "rxjs/operators";

/* ================================================================================================================= */

export class TitleBar extends Control
{
    private m_label: Label;

    constructor()
    {
        super();

        this.m_label = new Label();

        if (process.platform == 'win32')
        {
            this.addMenuBar();
            this.add(this.m_label);
            this.addControlButtons();
        }
        else
            this.add(this.m_label);
    }

    private addMenuBar(): void
    {
    }

    private addControlButtons(): void
    {
        let grp = new Panel();
        grp.addClass('btn-group');

        let minBtn = new Button(null, { tagName: 'SPAN' });
        let maxBtn = new Button(null, { tagName: 'SPAN' });
        let closeBtn = new Button(null, { tagName: 'SPAN' });

        minBtn.addClass('minimize');
        maxBtn.addClass('maximize');
        closeBtn.addClass('close');

        grp.add(minBtn);
        grp.add(maxBtn);
        grp.add(closeBtn);

        this.add(grp);
    }

    public get title(): string
    {
        return this.m_label.text;
    }

    public set title(value: string)
    {
        this.m_label.text = value;
    }

    protected update(): void
    {
        this.element.classList.add('titlebar');
    }
}

/* ================================================================================================================= */
