import { VirtualNode } from "./VirtualNode";

/* ================================================================================================================= */
/* ================================================================================================================= */

export class VirtualText extends VirtualNode
{
    constructor (readonly text: Text)
    {
        super();
    }

    public clone(): VirtualNode
    {
        return new VirtualText(this.text.cloneNode(false) as Text);
    }
}

/* ================================================================================================================= */
