/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from "rxjs";

import * as domUtils from "./domUtils";

import { Control } from "./control";
import { TitleBar } from "./titleBar";
import { Panel } from "./panel";

/* ================================================================================================================= */

export interface FrameOptions
{
    osTitleBar?: boolean;
}

const DEFAULT_FRAME_OPTIONS: FrameOptions = {
    osTitleBar: false
}

/* ================================================================================================================= */

export class WindowFrame extends Control
{
    private m_titleBar: TitleBar;
    private m_clientArea: Panel;

    constructor(options?: FrameOptions)
    {
        super({ element: domUtils.findOrCreateTag('BODY') });

        options = {...DEFAULT_FRAME_OPTIONS, ...options};

        let mainPanel = new Panel({ id: "window-frame" });
        super.add(mainPanel)

        if (!options.osTitleBar)
        {
            this.m_titleBar = new TitleBar();
            mainPanel.add(this.m_titleBar);
        }

        this.m_clientArea = new Panel({ id: 'main-container' });
        mainPanel.add(this.m_clientArea);
    }

    public get windowEvent$(): Observable<string>
    {
        return this.m_titleBar.windowEvent$;
    }

    public get isMaximized(): boolean
    {
        return this.m_titleBar.isMaximized;
    }

    public set isMaximized(value: boolean)
    {
        this.m_titleBar.isMaximized = value;
    }

    public get title(): string
    {
        return document.title;
    }

    public set title(value: string)
    {
        if (this.m_titleBar)
            this.m_titleBar.title = value;

        document.title = value;
    }

    public add(child: Control): void
    {
        this.m_clientArea.add(child);
    }

    public remove(child: Control): void
    {
        this.m_clientArea.remove(child);
    }
}

/* ================================================================================================================= */
