/* ================================================================================================================= */
/* ================================================================================================================= */

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
        codeGen.push();                     // Save current item
        codeGen.load(this.binding);         // Load named iterator
        codeGen.array();                    // Convert current item to an array.

        codeGen.emitLoop("length != 0");

        codeGen.push();                     // Save iterator
        codeGen.next();                     // Load top of array (and shift)

        this.compileChildren(codeGen);

        codeGen.pop();                      // Restore iterator
        codeGen.emitEnd();

        codeGen.pop();                      // Restore item
    }
}

/* ================================================================================================================= */
