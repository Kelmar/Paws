/* ================================================================================================================= */
/* ================================================================================================================= */

import { AttributeNode } from './AttributeNode';
import { CodeGenerator } from '../CodeGen';

/* ================================================================================================================= */

export class ClassAttributeNode extends AttributeNode
{
    constructor(readonly name: string, readonly value: string)
    {
        super();
    }

    private get classNames(): string[]
    {
        return this.name.split('-').slice(1);
    }

    public compile(codeGen: CodeGenerator): void
    {
    }
}

/* ================================================================================================================= */
