import { promisify } from 'util';
import * as fs from 'fs';

const readFile = promisify(fs.readFile);

export class ComponentOptions
{
    public template?: string;
    public templateFile?: string;
    public selector?: string;
}

export class Component
{
    private m_node: HTMLElement;

    public readonly options: ComponentOptions;

    constructor (options: ComponentOptions)
    {
        this.options = options;

        this.loadTemplate();
        this.parseBindings();
    }

    private async loadTemplate(): Promise<void>
    {
        if (this.options.selector != null)
        {
            this.m_node = document.documentElement.querySelector(this.options.selector);
            return;
        }

        let template = this.options.templateFile != null ?
            (await readFile(this.options.templateFile)).toString() :
            this.options.template;

        console.log('template: ' + template);
        
        if (template != null)
        {
            console.log('Runing DOMParser on template....')
            try
            {
                let parser = new DOMParser();
                this.m_node = parser.parseFromString(this.options.template, "text/xml").documentElement;
            }
            catch (e)
            {
                console.log("Error: ", e);
            }
            console.log("Loaded:");
            console.log(this.m_node);
        }
        else
        {
            throw new Error("No selector or template specified in options.");
        }
    }

    private parseItem(item: Element)
    {
        for (var attr of item.attributes)
        {
            console.log('Attribute: ' + attr.name);
        }

        for (var child of item.children)
            this.parseItem(child);
    }

    private parseBindings()
    {
        this.parseItem(this.m_node);
    }

    public test(value: string): void
    {
        this.m_node.innerText = value;
    }
}

var c = new Component({
    template: "<div tau-class='foo'></div>"
});

