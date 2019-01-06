/* ================================================================================================================= */
/* ================================================================================================================= */

import { AttributeNode } from './AttributeNode';
import { Visitor } from './Visitor';

/* ================================================================================================================= */

export class HtmlAttributeNode extends AttributeNode
{
    constructor(readonly value: string)
    {
        super();
    }

    public receive(visitor: Visitor): void
    {
        visitor.visitHtmlAttributeNode(this);
    }
}

/* ================================================================================================================= */