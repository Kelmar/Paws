/* ================================================================================================================= */

import { IDataBinding, parseDataBinding } from "./DataBinding";

/* ================================================================================================================= */

const NAMESPACE: string = "tau";
const ATTR_PREFIX: string = NAMESPACE + '-';

/* ================================================================================================================= */

export interface IBindingTarget
{
    apply(model: any): void;
}

/* ================================================================================================================= */

export abstract class BindingTargetBase
{
    protected constructor(readonly dataBinding: IDataBinding)
    {
    }

    protected resolve(model: any): [boolean, any]
    {
        return this.dataBinding.resolve(model);
    }
}

/* ================================================================================================================= */

class AttributeBindingTarget extends BindingTargetBase implements IBindingTarget
{
    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);
    }

    public apply(model: any): void
    {
        let [found, res] = this.resolve(model);

        if (!found || (!res && res !== 0))
        {
            // Remove attribute on any falsy result, except zero
            this.item.removeAttribute(this.name);
        }
        else if (typeof res == "boolean")
            this.item.setAttribute(this.name, this.name); // E.g.: checked="checked"
        else
            this.item.setAttribute(this.name, res.toString());
    }
}

/* ================================================================================================================= */

class TextBindingTarget extends BindingTargetBase implements IBindingTarget
{
    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);
    }

    public apply(model: any): void
    {
        let [found, res] = this.resolve(model);

        if (!found || res === undefined || res === null)
            this.item.innerHTML = '';
        else
        {
            this.item.innerHTML = res.toString()
                .replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#039')
            ;
        }
    }
}

/* ================================================================================================================= */

class HtmlBindingTarget extends BindingTargetBase implements IBindingTarget
{
    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);
    }

    public apply(model: any): void
    {
        let [found, res] = this.resolve(model);

        if (!found || res === undefined || res === null)
            this.item.innerHTML = '';
        else
            this.item.innerHTML = res.toString();
    }
}

/* ================================================================================================================= */

class ClassBindingTarget extends BindingTargetBase implements IBindingTarget
{
    private readonly m_className: string;
    private readonly m_handler: (found: boolean, value: any) => void;

    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);

        // Allows for writing: <div tau-class-red="inError">Invalid</div>
        // Or: <div tau-class="computedCss">A lepton with an electric charge and 1/2 spin.</div>
        let parts = name.split('-', 2);

        if (parts.length > 1)
        {
            this.m_className = parts[1];
            this.m_handler = (f, v) => this.applySingle(f, v);
        }
        else
        {
            this.m_className = null;
            this.m_handler = (f, v) => this.applyAll(f, v);
        }
    }

    private applySingle(found: boolean, res: any): void
    {
        if (!found || !res)
            this.item.classList.remove(this.m_className);
        else
            this.item.classList.add(this.m_className);
    }

    private applyAll(found: boolean, res: any)
    {
        if (!found || !res)
            this.item.removeAttribute('class');
        else
            this.item.setAttribute('class', res);
    }

    public apply(model: any): void
    {
        let [found, res] = this.resolve(model);
        this.m_handler(found, res);
    }
}

/* ================================================================================================================= */

interface BindingFactory
{
    (item: Element, name: string, dataBinding: IDataBinding): IBindingTarget
}

/* ================================================================================================================= */

class AttributeBindingMap
{
    public pattern: RegExp;

    constructor(pattern: string | RegExp, readonly factory: BindingFactory)
    {
        if (pattern instanceof RegExp)
            this.pattern = pattern;
        else
            this.pattern = new RegExp('^' + pattern + '$', "i");
    }
}

/* ================================================================================================================= */

export class BindingParser
{
    private m_log: any

    private m_attributeBindings: AttributeBindingMap[];

    constructor ()
    {
        this.m_log = console;
        this.m_attributeBindings = [];

        this.addAttributeBindingTarget("text", TextBindingTarget);
        this.addAttributeBindingTarget("html", HtmlBindingTarget);
        this.addAttributeBindingTarget(/^class(?:|\-[\-_\w]+)$/i, ClassBindingTarget);
    }

    public addAttributeBindingTarget<T extends IBindingTarget>(pattern: string | RegExp, ctor: new (item: Element, name: string, dataBinding: IDataBinding) => T): void
    {
        let factory = (e: Element, n: string, d: IDataBinding) => new ctor(e, n, d);
        this.m_attributeBindings.push(new AttributeBindingMap(pattern, factory));
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
        return mapping == null ? new AttributeBindingTarget(item, name, dataBinding) : mapping.factory(item, name, dataBinding);
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