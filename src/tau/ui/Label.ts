/* ================================================================================================================= */
/* ================================================================================================================= */

import { Control, ControlOptions } from "./Control";

/* ================================================================================================================= */

let DEFAULT_CONTROL_OPTIONS: ControlOptions =
{
    tagName: 'LABEL'
}

/* ================================================================================================================= */

export class Label extends Control
{
    constructor(text?: string, options?: ControlOptions)
    {
        options = {...DEFAULT_CONTROL_OPTIONS, ...options};

        super(options);
        this.text = text;
    }

    public get text(): string
    {
        return this.element.innerText;
    }

    public set text(value: string)
    {
        this.element.innerText = value;
    }
}

/* ================================================================================================================= */
