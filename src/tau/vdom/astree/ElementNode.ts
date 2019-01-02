/* ================================================================================================================= */
/* ================================================================================================================= */

import { AstNode } from "./AstNode";
import { CodeGenerator } from "../CodeGen";

/* ================================================================================================================= */

export class ElementNode extends AstNode
{
    public constructor(readonly tagName: string)
    {
        super();
    }

    protected innerCompile(codeGen: CodeGenerator): void
    {
        this.compileChildren(codeGen);
    }

    public compile(codeGen: CodeGenerator): void
    {
        codeGen.element.push(this.tagName);

        this.innerCompile(codeGen);

        codeGen.element.pop();
    }
}

/* ================================================================================================================= */
