/* ================================================================================================================= */

import { IBindingTarget, IDataBinding } from "./interfaces";
import { parseDataBinding } from "./DataBinding";
import { ILogger, LogManager } from "../common/logging";

import { AttributeBindingTarget, ClassBindingTarget, EventBindingTarget, HtmlBindingTarget, TextBindingTarget } from "./attributes";

/* ================================================================================================================= */

const NAMESPACE: string = "tau";
const ATTR_PREFIX: string = NAMESPACE + '-';

/* ================================================================================================================= */

interface BindingType
{
    new (item: Element, name: string, dataBinding: IDataBinding): IBindingTarget
}

/* ================================================================================================================= */

class AttributeBindingMap
{
    public pattern: RegExp;

    constructor(pattern: string | RegExp, readonly binding: BindingType)
    {
        if (pattern instanceof RegExp)
            this.pattern = pattern;
        else
            this.pattern = new RegExp('^' + pattern + '$', "i");
    }

    public build(item: Element, name: string, dataBinding: IDataBinding): IBindingTarget
    {
        return new (this.binding)(item, name, dataBinding);
    }
}

/* ================================================================================================================= */

export class BindingParser
{
    private m_log: ILogger = LogManager.getLogger('paws.tau.bindingParser');

    private m_attributeBindings: AttributeBindingMap[];

    constructor ()
    {
        this.m_attributeBindings = [];

        this.addAttributeBindingTarget("text", TextBindingTarget);
        this.addAttributeBindingTarget("html", HtmlBindingTarget);
        this.addAttributeBindingTarget(/^class(?:|\-[\-_\w]+)$/i, ClassBindingTarget);
        this.addAttributeBindingTarget(/^(on[\w]+)$/i, EventBindingTarget);
    }

    public addAttributeBindingTarget(pattern: string | RegExp, ctor: BindingType): void
    {
        this.m_attributeBindings.push(new AttributeBindingMap(pattern, ctor));
    }

    private bindAttribute(item: Element, name: string, value: string): IBindingTarget
    {
        if (!name.toLowerCase().startsWith(ATTR_PREFIX))
            return;

        name = name.substr(ATTR_PREFIX.length).trim();

        if (name == '')
        {
            this.m_log.warn(`Ignoring '${ATTR_PREFIX}' attribute with no suffix.`);
            return;
        }

        let dataBinding: IDataBinding = parseDataBinding(value);

        let mapping: AttributeBindingMap = this.m_attributeBindings.find(x => x.pattern.test(name));
        return mapping == null ? new AttributeBindingTarget(item, name, dataBinding) : mapping.build(item, name, dataBinding);
    }

    private parseElement(item: Element): IBindingTarget[]
    {
        let targets: IBindingTarget[] = [];

        for (var attr of item.attributes)
        {
            let target: IBindingTarget = this.bindAttribute(item, attr.name, attr.value);

            if (target != null)
            {
                this.m_log.debug(`Added binding ${attr.name} => ${attr.value}`);
                targets.push(target);
            }
        }

        return targets;
    }

    private parseComment(item: Comment): IBindingTarget[]
    {
        return [];
    }

    private parseText(item: Text): IBindingTarget[]
    {
        return [];
    }

    private parseItem(item: Node): IBindingTarget[]
    {
        let res: IBindingTarget[] = [];

        if (item instanceof Element)
            res = res.concat(this.parseElement(item));

        if (item instanceof Comment)
            res = res.concat(this.parseComment(item));

        if (item instanceof Text)
            res = res.concat(this.parseText(item));

        for (var child of item.childNodes)
            res = res.concat(this.parseItem(child));

        return res;
    }

    public Parse(item: Node): IBindingTarget[]
    {
        return this.parseItem(item);
    }
}

/* ================================================================================================================= */
