/* ================================================================================================================= */
/* ================================================================================================================= */

import { Control, ControlOptions } from "./Control";
import { Label } from "./Label";

/* ================================================================================================================= */

export class Button extends Control
{
    constructor(label?: string, options?: ControlOptions)
    {
        super(Object.assign({}, { tagName: 'BUTTON' }, options));

        if (label != null)
        {
            let l = new Label(label);
            this.add(l);
        }

        this.listen('click');
    }

    public click(e: any): void
    {
        //console.log('Button clicked!');
        //window.close();
    }
}

/* ================================================================================================================= */
