/* ================================================================================================================= */
/* ================================================================================================================= */

import '../../common/string';

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

export class ElementManipulator
{
    constructor (readonly output: ICodeOutput)
    {
    }

    public writeHeader()
    {
        this.output.write('let $__tag_stack = [];');
    }

    public push(tagName: string): void
    {
        tagName = tagName.escapeJS();

        this.output.write(`$element = $__tag_stack.push(document.createElement("${tagName}"));`);
    }

    public pop(): void
    {
        this.output.write(`$__e = $__tag_stack.pop();
if ($__e) $__e.appendChild($element);
$element = $__e;`);
    }

    public addClasses(classes: string[]): void
    {
        let classList = classes.map(x => x.escapeJS()).join('", "');
        this.output.write(`$element.classList.add("${classList}")`);
    }

    public removeClasses(classes: string[]): void
    {
        let classList = classes.map(x => x.escapeJS()).join('", "');
        this.output.write(`$element.classList.remove("${classList}")`);
    }

    public setAttribute(name: string, value: string, isStatic: boolean)
    {
        name = name.escapeJS();

        if (isStatic)
            value = "'" + value.escapeJS() + "'";

        this.output.write(`$element.setAttribute('${name}', ${value});`);
    }

    public appendStaticText(text: string)
    {
        text = text.replace(/(\s\s+)/, ' ') // Replace consecutive spaces with a single space.
            .escapeJS()
            .escapeHTML();

        this.output.write(`$element.innerHTML += '${text}';`);
    }
}

/* ================================================================================================================= */

export class CodeGenerator
{
    public readonly element: ElementManipulator;

    private m_labelId: number = 0;
    private m_iteratorId: number = 0;

    constructor(readonly output: ICodeOutput)
    {
        this.element = new ElementManipulator(output);
    }

    public writeHeader()
    {
        this.output.write(`function render($item) {
    let $__item_stack = [];
with ($item) {`);
    }

    public writeFooter()
    {
        this.output.write('}}');
    }

    public pushModel(name: string): void
    {
        this.output.write(`$item = $__item_stack.push(${name});
with ($item) {`);
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

    public iterate(name: string): string
    {
        let iterator: string = '__it' + this.m_iteratorId;
        ++this.m_iteratorId;

        this.output.write(`let ${iterator} = Array.from(${name});`);

        return iterator;
    }

    public emitLabel(label: string)
    {
        this.output.write(`[lbl] ${label}:`);
    }

    public jump(label: string)
    {
        this.output.write(`goto ${label};`);
    }

    public jump_true(condition: string, trueLabel: string)
    {
        this.output.write(`if (${condition}) goto ${trueLabel};`);
    }

    public jump_false(condition: string, falseLabel: string)
    {
        this.output.write(`if (!(${condition})) goto ${falseLabel};`);
    }
}

/* ================================================================================================================= */
