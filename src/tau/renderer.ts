/* ================================================================================================================= */
/* ================================================================================================================= */



/* ================================================================================================================= */

export class Renderer
{
    private __m_modelStack: any[] = [];
    private __m_tagStack: HTMLElement[] = [];

    public $item: any;
    public $element: HTMLElement;

    protected push_model(value: any): void
    {
        this.__m_modelStack.push(this.$item);
        this.$item = value;
    }

    protected pop_model(): any
    {
        return this.__m_modelStack.pop();
    }

    protected push_tag(tagName: string): HTMLElement
    {
        let rval = document.createElement(tagName);
        this.__m_tagStack.push(rval);
        this.$element = rval;
        return rval;
    }

    protected pop_tag(): HTMLElement
    {
        let e = this.__m_tagStack.pop();

        if (e && this.$element != null)
            e.appendChild(this.$element);

        this.$element = e;
        return this.$element;
    }

    protected add_classes(...classes: string[])
    {
        this.$element.classList.add(...classes);
    }

    protected rem_classes(...classes: string[])
    {
        this.$element.classList.remove(...classes);
    }

    protected set_attr(name: string, value: string)
    {
        this.$element.setAttribute(name, value);
    }

    protected add_html(html: string)
    {
        this.$element.innerHTML += html;
    }
}

/* ================================================================================================================= */