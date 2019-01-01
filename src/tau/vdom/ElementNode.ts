/* ================================================================================================================= */

import { AstNode } from "./AstNode";
import { CodeGenerator } from "./CodeGen";

/* ================================================================================================================= */

export class ElementNode extends AstNode
{
    public readonly tagName: string;

    public constructor(readonly container: Element)
    {
        super();

        this.tagName = container.tagName;
    }

    protected innerCompile(codeGen: CodeGenerator): void
    {
        this.compileChildren(codeGen);
    }

    public compile(codeGen: CodeGenerator): void
    {
        codeGen.pushTag(this.tagName);

        this.innerCompile(codeGen);

        codeGen.popTag();
    }
}

/* ================================================================================================================= */
