import { promisify } from 'util';
import * as fs from 'fs';
import { BindingParser, IBindingTarget } from './BindingParser';

const readFile = promisify(fs.readFile);

export interface ITemplate
{
    apply(model: any): void;
}

export class Template implements ITemplate
{
    private m_node: HTMLElement;
    private m_bindings: IBindingTarget[];

    public readonly options: TemplateOptions;

    constructor (options: TemplateOptions)
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

    private parseBindings(): void
    {
        let parser = new BindingParser();
        this.m_bindings = parser.Parse(this.m_node);

        console.debug(`Found ${this.m_bindings.length} total data binding(s)`);
    }

    public apply(value: any): void
    {
        for (let target of this.m_bindings)
            target.apply(value);
    }
}

export class TemplateOptions
{
    public template?: string;
    public templateFile?: string;
    public selector?: string;
}
