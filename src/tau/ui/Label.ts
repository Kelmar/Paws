/* ================================================================================================================= */
/* ================================================================================================================= */

import { Control } from "./Control";

/* ================================================================================================================= */

export class Label extends Control
{
    constructor(text?: string)
    {
        super();
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

    protected build(): HTMLElement
    {
        return document.createElement('LABEL');
    }
}

/* ================================================================================================================= */
