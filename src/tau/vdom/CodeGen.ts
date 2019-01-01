/* ================================================================================================================= */
/* ================================================================================================================= */

export class CodeGenerator
{
    private m_tagStack: string[] = [];
    private m_labelId: number = 0;

    constructor()
    {
    }

    private escapeString(str: string): string
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
        tagName = this.escapeString(tagName);
        this.m_tagStack.push(tagName);
        console.log(`push_node(document.createElement("${tagName}"));`);
    }

    public popTag(): void
    {
        let tag = this.m_tagStack.pop();
        console.log("pop_node(); // " + tag);
    }

    public appendText(text: string)
    {
        text = text.replace(/(\s\s+)/, ' '); // Replace consecutive spaces with a single space.
        text = this.escapeString(text);

        console.log(`append_text("${text}");`);
    }

    public pushModel(): void
    {
    }

    public createLabel(): string
    {
        let rval = 'lab_' + this.m_labelId;
        ++this.m_labelId;
        return rval;
    }

    public emitLabel(label: string)
    {
        console.log(`[lbl] ${label}:`);
    }

    public jump(label: string)
    {
        console.log(`goto ${label};`);
    }

    public test(condition: string, falseLabel: string)
    {
        console.log(`if (!(${condition})) goto ${falseLabel};`);
    }
}

/* ================================================================================================================= */
