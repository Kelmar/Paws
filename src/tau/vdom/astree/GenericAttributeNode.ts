/* ================================================================================================================= */
/* ================================================================================================================= */

import { AttributeNode } from './AttributeNode';
import { CodeGenerator } from '../CodeGen';

/* ================================================================================================================= */

export class GenericAttributeNode extends AttributeNode
{
    constructor(readonly name: string, readonly value: string, readonly isStatic: boolean)
    {
        super();
    }

    public compile(codeGen: CodeGenerator): void
    {
        codeGen.element.setAttribute(this.name, this.value, this.isStatic);
    }
}

/* ================================================================================================================= */
