/* ================================================================================================================= */
/* ================================================================================================================= */

import { AttributeNode } from './AttributeNode';
import { CodeGenerator } from '../CodeGen';
import { Visitor } from './Visitor';

/* ================================================================================================================= */

export class TextAttributeNode extends AttributeNode
{
    constructor(readonly value: string)
    {
        super();
    }

    public receive(visitor: Visitor): void
    {
        visitor.visitTextAttributeNode(this);
    }
}

/* ================================================================================================================= */
