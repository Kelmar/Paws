/* ================================================================================================================= */
/* ================================================================================================================= */

import { AttributeNode } from './AttributeNode';
import { CodeGenerator } from '../CodeGen';

/* ================================================================================================================= */

export class HtmlAttributeNode extends AttributeNode
{
    constructor(readonly value: string)
    {
        super();
    }

    public compile(codeGen: CodeGenerator): void
    {
        codeGen.element.appendText(this.value, false, false);
    }
}

/* ================================================================================================================= */
