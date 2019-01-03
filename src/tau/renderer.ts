/* ================================================================================================================= */
/* ================================================================================================================= */



/* ================================================================================================================= */

export class Renderer
{
    private __m_modelStack: any[] = [];
    private __m_tagStack: HTMLElement[] = [];

    public $item: any;
    public $element: HTMLElement;

    constructor (readonly parent: HTMLElement)
    {
    }

    public execute(model: any, fn: Function): void
    {
        this.$item = model;
        
        fn.apply(this);

        if (this.$element != null)
            this.parent.appendChild(this.$element);
    }

    protected push_model(): void
    {
        this.__m_modelStack.push(this.$item);
    }

    protected pop_model(): void
    {
        this.$item = this.__m_modelStack.pop();
    }

    protected push_tag(tagName: string): void
    {
        if (this.$element != null)
            this.__m_tagStack.push(this.$element);

        this.$element = document.createElement(tagName);
    }

    protected pop_tag(): void
    {
        let e = this.__m_tagStack.pop();

        if (e && this.$element != null)
        {
            e.appendChild(this.$element);
            this.$element = e;
        }
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