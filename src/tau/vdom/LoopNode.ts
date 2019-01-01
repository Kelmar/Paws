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

        console.log(`let it = ${this.binding}();`);

        codeGen.emitLabel(topLabel);
        console.log(`let res = it.next();`);
        codeGen.test('res.done', endLabel);

        this.compileChildren(codeGen);

        codeGen.jump(topLabel);
        codeGen.emitLabel(endLabel);
    }
}

/* ================================================================================================================= */
