/* ================================================================================================================= */
/* ================================================================================================================= */

import { mapTo, mergeMap } from "rxjs/operators";
import { Observable, from, merge, iif, of, never } from "rxjs";

import { Control } from "./control";
import { Label } from "./label";
import { Panel } from "./panel";
import { Button } from "./button";

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

        this.addClass("titlebar");

        this.m_label = new Label();

        if (process.platform != "darwin")
        {
            if (process.platform == "win32")
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
        grp.addClass("btn-group");

        let minBtn = new Button(null, { tagName: "SPAN" });
        let maxBtn = new Button(null, { tagName: "SPAN" });
        let closeBtn = new Button(null, { tagName: "SPAN" });

        minBtn.addClass("minimize");
        maxBtn.addClass("maximize");
        closeBtn.addClass("close");

        let maximize$ = of("maximize");
        let restore$ = of("restore");

        this.m_windowEvent$ = from(merge(
            closeBtn.click$.pipe(mapTo("close")),
            maxBtn.click$.pipe(mergeMap(_ => iif(() => this.isMaximized, restore$, maximize$))),
            minBtn.click$.pipe(mapTo("minimize"))
        ));

        // TODO: Lookup up i18n
        minBtn.tooltip = "Minimize";
        maxBtn.tooltip = "Maximize";
        closeBtn.tooltip = "Close";

        grp.add(minBtn, maxBtn, closeBtn);

        this.add(grp);

        this.m_maximizeBtn = maxBtn;
    }

    protected update(): void
    {
        if (this.m_maximizeBtn)
        {
            if (this.m_isMaximized)
            {
                this.m_maximizeBtn.removeClass("maximize");
                this.m_maximizeBtn.addClass("restore");
            }
            else
            {
                this.m_maximizeBtn.addClass("maximize");
                this.m_maximizeBtn.removeClass("restore");
            }
        }
    }
}

/* ================================================================================================================= */
