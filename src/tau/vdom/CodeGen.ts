/* ================================================================================================================= */
/* ================================================================================================================= */

interface ICodeOutput
{
    write(text: string): void;
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

export class CodeGenerator
{
    private m_labelId: number = 0;

    constructor(readonly output: ICodeOutput)
    {
    }

    public writeHeader()
    {
        this.output.write(`function render($item) {
    let $__tag_stack = [];
    let $__item_stack = [];
with ($item) {`);
    }

    public writeFooter()
    {
        this.output.write('}}');
    }

    private escapeStringHTML(str: string): string
    {
        return str
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace("'", '&apos;')
            .replace('"', '&quot;')
        ;
    }

    private escapeStringJS(str: string): string
    {
        return str
            .replace('\\', '\\\\')
            .replace("'", "\\'")
            .replace('"', '\\"')
            .replace('`', '\\`')
        ;
    }

    public pushTag(tagName: string): void
    {
        tagName = this.escapeStringJS(tagName);

        this.output.write(`$element = $__tag_stack.push(document.createElement("${tagName}"));`);
    }

    public popTag(): void
    {
        this.output.write("$element = $__tag_stack.pop();");
    }

    public appendText(text: string)
    {
        text = text.replace(/(\s\s+)/, ' '); // Replace consecutive spaces with a single space.
        text = this.escapeStringJS(text);
        text = this.escapeStringHTML(text);

        this.output.write(`$element.innerHTML += '${text}';`);
    }

    public pushModel(name: string): void
    {
        this.output.write(`$item = $__item_stack.push(${name});
        with (${name}) {`);
    }

    public popModel()
    {
        this.output.write(`}
$item = $__item_stack.pop();`);
    }

    public createLabel(): string
    {
        let rval = '__lab_' + this.m_labelId;
        ++this.m_labelId;
        return rval;
    }

    public emitLabel(label: string)
    {
        this.output.write(`[lbl] ${label}:`);
    }

    public jump(label: string)
    {
        this.output.write(`goto ${label};`);
    }

    public test(condition: string, falseLabel: string)
    {
        this.output.write(`if (!(${condition})) goto ${falseLabel}`);
    }
}

/* ================================================================================================================= */
