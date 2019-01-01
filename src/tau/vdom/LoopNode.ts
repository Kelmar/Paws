/* ================================================================================================================= */
/* ================================================================================================================= */

import { AstNode } from "./AstNode";
import { ElementNode } from "./ElementNode";
import { CodeGenerator } from "./CodeGen";

/* ================================================================================================================= */

export class LoopNode extends ElementNode
{
    constructor(container: Element, readonly binding: string)
    {
        super(container);
    }

    protected innerCompile(codeGen: CodeGenerator): void
    {
        let topLabel = codeGen.createLabel();
        let endLabel = codeGen.createLabel();

        // FIX
        console.log(`let it = Array.from(${this.binding});`);

        codeGen.emitLabel(topLabel);
        codeGen.jump_true('it.length == 0', endLabel);
        codeGen.pushModel('it.shift()');

        this.compileChildren(codeGen);

        codeGen.popModel();
        codeGen.jump(topLabel);
        codeGen.emitLabel(endLabel);
    }
}

/* ================================================================================================================= */
