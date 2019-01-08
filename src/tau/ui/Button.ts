/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from "rxjs";

import { Control, ControlOptions } from "./control";
import { Label } from "./label";

import { EventType } from "./domEvents";

/* ================================================================================================================= */

const DEFAULT_BUTTON_OPTIONS: ControlOptions = {
    tagName: 'BUTTON'
};

/* ================================================================================================================= */

export class Button extends Control
{
    constructor(label?: string, options?: ControlOptions)
    {
        super({...DEFAULT_BUTTON_OPTIONS, ...options});

        if (label != null)
        {
            let l = new Label(label);
            this.add(l);
        }

        this.click$ = this.observe(EventType.Click);
    }

    public readonly click$: Observable<Event>;
}

/* ================================================================================================================= */
