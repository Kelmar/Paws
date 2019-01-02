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
            let unsetLabel = codeGen.createLabel();
            let endLabel = codeGen.createLabel();

            codeGen.jump_false(this.value, unsetLabel);
            codeGen.element.addClasses(classes);
            codeGen.jump(endLabel);
            codeGen.emitLabel(unsetLabel);
            codeGen.element.removeClasses(classes);
            codeGen.emitLabel(endLabel);
        }
    }
}

/* ================================================================================================================= */
