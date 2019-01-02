/* ================================================================================================================= */
/* ================================================================================================================= */

import { AstNode } from "./AstNode";
import { ElementNode } from "./ElementNode";
import { CodeGenerator } from "../CodeGen";

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

        codeGen.push();                     // Save current item
        codeGen.load(this.binding);         // Load named iterator
        codeGen.array();                    // Convert current item to an array.
        codeGen.emitLabel(topLabel);        // Start of loop

        // Go to end if empty
        codeGen.jump_true("length == 0", endLabel);

        codeGen.push();                     // Save iterator
        codeGen.next();                     // Load top of array (and shift)

        this.compileChildren(codeGen);

        codeGen.pop();                      // Restore iterator
        codeGen.jump(topLabel);

        codeGen.emitLabel(endLabel);
        codeGen.pop();                      // Restore item
    }
}

/* ================================================================================================================= */
