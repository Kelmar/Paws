import * as fs from 'fs';
import { promisify } from 'util';

import { BindingParser, IBindingTarget } from './BindingParser';
import { ILogger, LogManager } from '../common/logging';

const readFile = promisify(fs.readFile);

export interface ITemplate
{
    apply(model: any): void;
}

export class Template implements ITemplate
{
    private m_log: ILogger = LogManager.getLogger('paws.tau.template');

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

        this.m_log.debug('template: ' + template);

        if (template != null)
        {
            this.m_log.debug('Runing DOMParser on template....')

            try
            {
                let parser = new DOMParser();
                this.m_node = parser.parseFromString(this.options.template, "text/xml").documentElement;
            }
            catch (e)
            {
                this.m_log.error(e);
                this.m_node = this.templateError(e);
            }

            this.m_log.info("Loaded:", this.m_node);
        }
        else
        {
            throw new Error("No selector or template specified in options.");
        }
    }

    private templateError(e: Error): HTMLElement
    {
        let pre = document.createElement("pre");
        pre.innerText = e.toString();

        let header = document.createElement("h4");
        header.innerText = "Template Error";

        let rval = document.createElement("div");
        rval.appendChild(header);
        rval.appendChild(pre);

        rval.className = "template-error";

        return rval;
    }

    private parseBindings(): void
    {
        let parser = new BindingParser();
        this.m_bindings = parser.Parse(this.m_node);

        this.m_log.debug(`Found ${this.m_bindings.length} total data binding(s)`);
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
