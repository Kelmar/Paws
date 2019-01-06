/* ================================================================================================================= */
/* ================================================================================================================= */

import { mapTo, mergeMap, tap, } from "rxjs/operators";
import { Observable, from, merge, iif, of, never } from "rxjs";

import { Control } from "./Control";
import { Label } from "./Label";
import { Panel } from "./Panel";
import { Button } from "./Button";

/* ================================================================================================================= */

export class TitleBar extends Control
{
    private m_windowEvent$: Observable<string>;

    private m_label: Label;
    private m_maximizeBtn: Button;
    private m_isMaximized: boolean;

    constructor()
    {
        super();

        this.addClass('titlebar');

        this.m_label = new Label();

        if (process.platform != 'darwin')
        {
            this.addMenuBar();
            this.add(this.m_label);
            this.addControlButtons();
        }
        else
        {
            this.add(this.m_label);
            this.m_windowEvent$ = never();
        }
    }

    public get isMaximized(): boolean
    {
        return this.m_isMaximized;
    }

    public set isMaximized(value: boolean)
    {
        if (value != this.m_isMaximized)
        {
            this.m_isMaximized = value;
            this.update();
        }
    }

    public get windowEvent$(): Observable<string>
    {
        return this.m_windowEvent$;
    }

    public get title(): string
    {
        return this.m_label.text;
    }

    public set title(value: string)
    {
        this.m_label.text = value;
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

        let maximize$ = of('maximize');
        let restore$ = of('restore');

        this.m_windowEvent$ = from(merge(
            closeBtn.click$.pipe(mapTo('close')),
            maxBtn.click$.pipe(mergeMap(_ => iif(() => this.isMaximized, restore$, maximize$))),
            minBtn.click$.pipe(mapTo('minimize'))
        ));

        minBtn.addClass('minimize');
        maxBtn.addClass('maximize');
        closeBtn.addClass('close');

        grp.add(minBtn);
        grp.add(maxBtn);
        grp.add(closeBtn);

        this.add(grp);

        this.m_maximizeBtn = maxBtn;
    }

    protected update(): void
    {
        if (this.m_maximizeBtn)
        {
            if (this.m_isMaximized)
            {
                this.m_maximizeBtn.removeClass('maximize');
                this.m_maximizeBtn.addClass('restore');
            }
            else
            {
                this.m_maximizeBtn.addClass('maximize');
                this.m_maximizeBtn.removeClass('restore');
            }
        }
    }
}

/* ================================================================================================================= */
