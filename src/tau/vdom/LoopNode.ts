/* ================================================================================================================= */
/* ================================================================================================================= */

import { AstNode } from "./AstNode";
import { ElementNode } from "./ElementNode";
import { CodeGenerator } from "./CodeGen";

/* ================================================================================================================= */

export class LoopNode extends ElementNode
{
    constructor(tagName: string, readonly binding: string)
    {
        super(tagName);
    }

    protected innerCompile(codeGen: CodeGenerator): void
    {
        let topLabel = codeGen.createLabel();
        let endLabel = codeGen.createLabel();

        let iterator = codeGen.iterate(this.binding);

        codeGen.emitLabel(topLabel);
        codeGen.jump_true(`${iterator}.length == 0`, endLabel);
        codeGen.pushModel(`${iterator}.shift()`);

        this.compileChildren(codeGen);

        codeGen.popModel();
        codeGen.jump(topLabel);
        codeGen.emitLabel(endLabel);
    }
}

/* ================================================================================================================= */
