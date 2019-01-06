/* ================================================================================================================= */
/* ================================================================================================================= */

import * as domUtils from "./DomUtils";

import { Control } from "./Control";
import { TitleBar } from "./TitleBar";

/* ================================================================================================================= */

export interface FrameOptions
{
    osTitleBar?: boolean;
}

const defaultOptions: FrameOptions = {
    osTitleBar: false
}

/* ================================================================================================================= */

export class WindowFrame extends Control
{
    private m_titleBar: TitleBar;

    constructor(options?: FrameOptions)
    {
        super({ element: domUtils.findOrCreateTag('BODY') });

        options = {...defaultOptions, ...options};

        if (!options.osTitleBar)
        {
            this.m_titleBar = new TitleBar();
            super.add(this.m_titleBar);
        }
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
}

/* ================================================================================================================= */
