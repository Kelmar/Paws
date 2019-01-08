/* ================================================================================================================= */
/* ================================================================================================================= */

import '../../common/string';

import { ICodeOutput } from "./CodeOutput";

import * as ast from './astree';

/* ================================================================================================================= */

export class CompilePass extends ast.Visitor
{
    constructor(readonly output: ICodeOutput)
    {
        super();
    }

    private walkChildren(node: ast.AstNode): void
    {
        node.forEach(c => c.receive(this));
    }

    private appendText(text: string, isStatic: boolean, escape: boolean): void
    {
        if (isStatic)
        {
            text = text.escapeJS();

            if (escape)
            {
                text = text.replace(/(\s\s+)/, ' ') // Replace consecutive spaces with a single space.
                    .escapeHTML();
            }

            this.output.write(`this.add_html('${text}');`);
        }
        else
            this.output.write(`this.add_html(this.$item.${text}` + (escape ? '.escapeHTML());' : ');'));
    }

    private pushTag(tagName: string): void
    {
        tagName = tagName.escapeJS();

        this.output.write(`this.push_tag("${tagName}");`);
    }

    private popTag(): void
    {
        this.output.write("this.pop_tag();");
    }

    private pushModel(): void
    {
        this.output.write("this.push_model();");
    }

    private popModel(): void
    {
        this.output.write("this.pop_model();");
    }

    private compileBranch(branch: ast.Branch, first: boolean): void
    {
        if (first)
            this.output.write(`if (this.$item.${branch.condition}) {`);
        else
        {
            if (branch.condition)
                this.output.write(`} else if (this.$item.${branch.condition}) {`);
            else
                this.output.write('} else {');
        }

        for (let child of branch.children)
            child.receive(this);
    }

    public visitBranchNode(node: ast.BranchNode): void 
    {
        let first = true;

        for (let branch of node.branches)
        {
            this.compileBranch(branch, first);

            if (first)
                first = false;
        }

        this.output.write('}');
    }
    
    public visitLoopNode(node: ast.LoopNode): void 
    {
        this.pushModel();
        this.output.write(`this.$item = Array.from(this.$item.${node.binding});`);
        this.output.write(`while (this.$item.length > 0) {`);
        this.pushModel();
        this.output.write('this.$item = this.$item.shift();');

        this.walkChildren(node);
        
        this.popModel();
        this.output.write('}');

        this.popModel();
    }

    public visitClassAttributeNode(node: ast.ClassAttributeNode): void 
    {
        let classes = node.classNames;

        if (classes.length == 0)
            this.output.write(`this.set_attr("class", this.$item.${node.value});`);
        else
        {
            let clsParams = "['" + classes.join("', '") + "']";

            this.output.write(`if (this.$item.${node.value})`);
            this.output.write(`this.add_classes(${clsParams})`);
            this.output.write('else');
            this.output.write(`this.rem_classes(${clsParams})`);
        }
    }

    public visitTextAttributeNode(node: ast.TextAttributeNode): void 
    {
        this.appendText(node.value, false, true);
    }

    public visitHtmlAttributeNode(node: ast.HtmlAttributeNode): void 
    {
        this.appendText(node.value, false, false);
    }

    public visitGenericAttributeNode(node: ast.GenericAttributeNode): void 
    {
        let value = node.value;

        if (node.isStatic)
            value = "'" + value.escapeJS() + "'";
        else
            value = "this.$item." + value;

        this.output.write(`this.set_attr('${node.name}', ${value});`);
    }

    public visitElementNode(node: ast.ElementNode): void 
    {
        this.pushTag(node.tagName);

        this.walkChildren(node);

        this.popTag();
    }

    public visitTextNode(node: ast.TextNode): void
    {
        this.appendText(node.text, true, true);
    }
}

/* ================================================================================================================= */
