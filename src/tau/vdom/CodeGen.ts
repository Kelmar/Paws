/* ================================================================================================================= */
/* ================================================================================================================= */

import '../../common/string';

import { ICodeOutput } from "./CodeOutput";
import { IDisposable } from 'lepton';

/* ================================================================================================================= */

/**
 * Opaque type for labels in our virtual machine.
 */
export interface ILabel
{
}

/* ================================================================================================================= */

export class ElementManipulator
{
    constructor (readonly output: ICodeOutput)
    {
    }

    public push(tagName: string): void
    {
        tagName = tagName.escapeJS();

        this.output.write(`this.push_tag("${tagName}");`);
    }

    public pop(): void
    {
        this.output.write("this.pop_tag();");
    }

    public addClasses(classes: string[]): void
    {
        let classList = classes.map(x => x.escapeJS()).join('", "');
        this.output.write(`this.add_classes("${classList}");`);
    }

    public removeClasses(classes: string[]): void
    {
        let classList = classes.map(x => x.escapeJS()).join('", "');
        this.output.write(`this.rem_classes("${classList}")`);
    }

    public setAttribute(name: string, value: string, isStatic: boolean)
    {
        if (isStatic)
            value = "'" + value.escapeJS() + "'";
        else
            value = "this.$item." + value;

        this.output.write(`this.set_attr('${name}', ${value});`);
    }

    public appendText(text: string, isStatic :boolean, escape: boolean)
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
}

/* ================================================================================================================= */

class Label implements ILabel
{
    constructor(readonly value: string) {}
}

/* ================================================================================================================= */

export class CodeGenerator implements IDisposable
{
    public readonly element: ElementManipulator;

    private m_labelId: number = 0;

    constructor(readonly output: ICodeOutput)
    {
        this.element = new ElementManipulator(output);
        this.writeHeader();
    }

    public dispose(): void
    {
        this.writeFooter();
    }

    public writeHeader(): void
    {
        this.output.write(`function render() {`);
    }

    public writeFooter(): void
    {
        this.output.write('}');
    }

    public push(): void
    {
        this.output.write("this.push_model();");
    }

    public load(name: string): void
    {
        this.output.write(`this.$item = this.$item.${name};`);
    }

    public array(): void
    {
        this.output.write("this.$item = Array.from(this.$item);");
    }

    public next(): void
    {
        this.output.write("this.$item = this.$item.shift();");
    }

    public pop(): void
    {
        this.output.write(`this.pop_model();`);
    }

    public createLabel(): ILabel
    {
        let rval = '__lab_' + this.m_labelId;
        ++this.m_labelId;
        return new Label(rval);
    }

    public emitIf(test: string)
    {
        this.output.write(`if (this.$item.${test}) {`);
    }

    public emitElse(test?: string)
    {
        if (test != null)
            this.output.write(`} else if (this.$item.${test}) {`);
        else
            this.output.write('} else {');
    }

    public emitEnd()
    {
        this.output.write('}');
    }

    public emitLabel(label: ILabel): void
    {
        let l = label as Label;
        this.output.write(`${l.value}:`);
    }

    public emitLoop(test: string)
    {
        this.output.write(`while (this.$item.${test}) {`);
    }

    public jump(label: ILabel): void
    {
        let l = label as Label;
        this.output.write(`continue ${l.value};`);
    }

    public jump_true(condition: string, trueLabel: ILabel): void
    {
        let l = trueLabel as Label;
        this.output.write(`if (this.$item.${condition}) continue ${l.value};`);
    }

    public jump_false(condition: string, falseLabel: ILabel): void
    {
        let l = falseLabel as Label;
        this.output.write(`if (!(this.$item.${condition})) continue ${l.value};`);
    }
}

/* ================================================================================================================= */
