/* ================================================================================================================= */

import { IBindingTarget, IDataBinding } from "../interfaces";
import { BindingTargetBase } from "../BindingTarget";
import { ILogger, LogManager } from "../../common/logging";

/* ================================================================================================================= */

export class EventBindingTarget extends BindingTargetBase implements IBindingTarget
{
    private readonly m_log: ILogger = LogManager.getLogger('paws.tau.attributes.event-binding');

    constructor(readonly item: Element, readonly name: string, dataBinding: IDataBinding)
    {
        super(dataBinding);

        (item as any)[name] = (e: Event) => this.handleEvent(e, name, dataBinding);
    }

    protected handleEvent(eventArgs: Event, name: string, dataBinding: IDataBinding):void
    {
        this.m_log.debug('Got event {name}', { name: name });
        this.m_log.debug('Event details: {eventArgs}', { eventArgs: eventArgs })
    }

    protected applyValue(model: any, found: boolean, resolved: any): void
    {
    }

    public apply(model: any)
    {
    }
}

/* ================================================================================================================= */
