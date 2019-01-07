/* ================================================================================================================= */
/* ================================================================================================================= */

export class Renderer
{
    private __m_modelStack: any[] = [];
    private __m_tagStack: HTMLElement[] = [];

    public $item: any;
    public $element: HTMLElement;

    constructor (readonly parent: HTMLElement, readonly renderFn: Function)
    {
    }

    public execute(model: any): void
    {
        this.$item = model;
        
        this.renderFn.apply(this);

        if (this.$element != null)
        {
            this.parent.innerHTML = '';
            this.parent.appendChild(this.$element);
        }
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

import { using } from 'lepton-di';
import { Parser, CompilePass, StringOutput } from './vdom';

export function renderTest()
{
    let el = document.getElementById('test3');
    let p = new Parser();
    let root = p.parse(el);
    let render;

    using (new StringOutput(), out =>
    {
        let comp = new CompilePass(out);
        root.receive(comp);

        //console.log(out.toString());
        render = new Function('//# sourceUrl=index.html\r\n' + out.toString());
    });

    let parent = el.parentElement;
    parent.removeChild(el);

    let model = { 
        on: true, 
        name: 'It',
        class: 'bold',
        items: [
            { id: 1, name: "Bugs Bunny" },
            { id: 2, name: "Daffy Duck" },
            { id: 3, name: "Elmer Fudd" },
        ]
    };

    let r = new Renderer(parent, render);
    r.execute(model);
}
