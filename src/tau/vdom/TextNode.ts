import { AstNode } from "./AstNode";
import { CodeGenerator } from "./CodeGen";

/* ================================================================================================================= */
/* ================================================================================================================= */

export class TextNode extends AstNode
{
    constructor (readonly text: string)
    {
        super();
    }

    public compile(codeGen: CodeGenerator): void
    {
        codeGen.appendText(this.text);
    }
}

/* ================================================================================================================= */
