/* ================================================================================================================= */
/* ================================================================================================================= */

import '../../common/string';

/* ================================================================================================================= */

interface ICodeOutput
{
    write(text: string): void;
}

/* ================================================================================================================= */

/**
 * Opaque type for labels in our virtual machine.
 */
export interface ILabel
{
}

/* ================================================================================================================= */

export class ConsoleOutput implements ICodeOutput
{
    public write(text: string): void
    {
        console.log(text);
    }
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

export class CodeGenerator
{
    public readonly element: ElementManipulator;

    private m_labelId: number = 0;

    constructor(readonly output: ICodeOutput)
    {
        this.element = new ElementManipulator(output);
    }

    public writeHeader()
    {
        this.output.write(`function render($item) {`);
    }

    public writeFooter()
    {
        this.output.write('}');
    }

    public push(): void
    {
        this.output.write("this.push_model();");
    }

    public load(name: string)
    {
        this.output.write(`this.$item = this.$item.${name};`);
    }

    public array()
    {
        this.output.write("this.$item = Array.from(this.$item);");
    }

    public next()
    {
        this.output.write("this.$item = this.$item.shift();");
    }

    public pop()
    {
        this.output.write(`this.pop_model();`);
    }

    public createLabel(): ILabel
    {
        let rval = '__lab_' + this.m_labelId;
        ++this.m_labelId;
        return new Label(rval);
    }

    public emitLabel(label: ILabel)
    {
        let l = label as Label;
        this.output.write(`[lbl] ${l.value}:`);
    }

    public jump(label: ILabel)
    {
        let l = label as Label;
        this.output.write(`goto ${l.value};`);
    }

    public jump_true(condition: string, trueLabel: ILabel)
    {
        let l = trueLabel as Label;
        this.output.write(`if (this.$item.${condition}) goto ${l.value};`);
    }

    public jump_false(condition: string, falseLabel: ILabel)
    {
        let l = falseLabel as Label;
        this.output.write(`if (!(this.$item.${condition})) goto ${l.value};`);
    }
}

/* ================================================================================================================= */
