/* ================================================================================================================= */
/* ================================================================================================================= */

import { AttributeNode } from './AttributeNode';
import { CodeGenerator } from '../CodeGen';
import { Visitor } from './Visitor';

/* ================================================================================================================= */

export class GenericAttributeNode extends AttributeNode
{
    constructor(readonly name: string, readonly value: string, readonly isStatic: boolean)
    {
        super();
    }

    public receive(visitor: Visitor): void
    {
        visitor.visitGenericAttributeNode(this);
    }
}

/* ================================================================================================================= */
