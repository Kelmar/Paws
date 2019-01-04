/* ================================================================================================================= */
/* ================================================================================================================= */

import { AttributeNode } from './AttributeNode';
import { Visitor } from './Visitor';

/* ================================================================================================================= */

export class ClassAttributeNode extends AttributeNode
{
    constructor(readonly name: string, readonly value: string)
    {
        super();
    }

    public get classNames(): string[]
    {
        return this.name.split('-').slice(1);
    }

    public receive(visitor: Visitor): void
    {
        visitor.visitClassAttributeNode(this);
    }
}

/* ================================================================================================================= */
