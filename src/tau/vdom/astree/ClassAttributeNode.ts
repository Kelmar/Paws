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
        let classes = this.classNames;

        if (classes.length == 0)
            codeGen.element.setAttribute(this.value, 'class', false);
        else
        {
            codeGen.emitIf(this.value);
            codeGen.element.addClasses(classes);
            codeGen.emitElse();
            codeGen.element.removeClasses(classes);
            codeGen.emitEnd();
        }
    }
}

/* ================================================================================================================= */
