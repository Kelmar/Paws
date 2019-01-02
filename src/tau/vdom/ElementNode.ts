/* ================================================================================================================= */

import { AstNode } from "./AstNode";
import { CodeGenerator } from "./CodeGen";

/* ================================================================================================================= */

class Attribute
{
    constructor(readonly name: string, readonly value: string, readonly isStatic: boolean)
    {
    }
}

/* ================================================================================================================= */

export class ElementNode extends AstNode
{
    public readonly tagName: string;

    private readonly m_attributes: Attribute[] = [];

    public constructor(readonly container: Element)
    {
        super();

        this.tagName = container.tagName;
    }

    protected innerCompile(codeGen: CodeGenerator): void
    {
        this.compileChildren(codeGen);
    }

    public addAttribute(name: string, value: string, isStatic : boolean)
    {
        this.m_attributes.push(new Attribute(name, value, isStatic));
    }

    public compile(codeGen: CodeGenerator): void
    {
        codeGen.pushTag(this.tagName);

        for (let attr of this.m_attributes)
            codeGen.addAttribute(attr.name, attr.value, attr.isStatic);

        this.innerCompile(codeGen);

        codeGen.popTag();
    }
}

/* ================================================================================================================= */
