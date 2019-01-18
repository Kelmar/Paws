/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable, Subject } from "rxjs";

import { ModelEvent, ModelEventType } from "./common";
import { Dynamic } from "./dynamic";

/* ================================================================================================================= */

export abstract class DynamicBase implements Dynamic
{
    private readonly m_subject: Subject<ModelEvent> = new Subject();

    public dispose(): void
    {
        this.m_subject.complete();
    }

    public get change$(): Observable<ModelEvent>
    {
        return this.m_subject;
    }

    public notify(): void
    {
        this.m_subject.next(new ModelEvent(ModelEventType.Ping));
    }

    protected raise(type: ModelEventType, property?: any, value?: any): void
    {
        this.m_subject.next({ type: type, property: property, value: value });
    }
}

/* ================================================================================================================= */
