/* ================================================================================================================= */
/* ================================================================================================================= */

import { Observable } from "rxjs";

/* ================================================================================================================= */
/**
 * Describes the type of event that was received from a LogSource.
 */
export enum LogEventType
{
    /**
     * The log is being watched for changes.
     */
    Opened,

    /**
     * The log was closed.
     * 
     * This is usually due to the file being deleted or the log file being rotated.
     */
    Closed,

    /**
     * Internal error from the ILogSource object itself.
     */
    Error,

    /**
     * A new log line has been added to the log.
     * 
     * Message will contain the new line.
     */
    NewLine,

    /**
     * The log has been truncated.
     */
    Truncated
}

/* ================================================================================================================= */
/**
 * The details of an event from a LogSource
 */
export interface LogEvent
{
    /**
     * Programatic details of the event type.
     * 
     * Opened, closed, etc.
     */
    type: LogEventType;

    /**
     * The identifier for the source in URL form.
     */
    source: string;

    /**
     * The log message.
     * 
     * Only valid for NewLine types
     */
    message?: any;
}

/* ================================================================================================================= */

export const ILogMonitor: unique symbol = Symbol("paws:service:logmonitor");

export interface ILogMonitor
{
    open(sourceName: string): Promise<void>;

    readonly event$: Observable<LogEvent>;
}

/* ================================================================================================================= */
