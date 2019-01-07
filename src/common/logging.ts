/* ================================================================================================================= */
/* ================================================================================================================= */

require('./string');

/* ================================================================================================================= */

export enum Level
{
    All     = 0,
    Verbose = 1,
    Trace   = 2,
    Debug   = 3,
    Info    = 4,
    Warn    = 5,
    Warning = 5,
    Error   = 6,
    Fatal   = 7
}

/* ================================================================================================================= */

export class LogMessage
{
    public readonly levelName: string;
    public readonly timestamp: Date;
    public readonly text: string;
    public readonly properties: any;

    constructor(readonly level: Level, readonly error: Error, text: string, ...args: any[])
    {
        this.levelName = Level[level];
        this.timestamp = new Date();
        this.text = (args !== null && args.length > 0) ? text.formatPegasus(...args) : text;
        this.properties = args;
    }
}

/* ================================================================================================================= */

export interface ILogTarget
{
    write(message: LogMessage): void;
}

/* ================================================================================================================= */

export interface ILogger
{
    level: Level;

    isEnabled(level: Level): boolean;

    write(level: Level, e: Error | string, ...args: any[]): void;

    verbose(e: Error | string, ...args: any[]): void;
    trace  (e: Error | string, ...args: any[]): void;
    debug  (e: Error | string, ...args: any[]): void;
    info   (e: Error | string, ...args: any[]): void;
    warn   (e: Error | string, ...args: any[]): void;
    error  (e: Error | string, ...args: any[]): void;
    fatal  (e: Error | string, ...args: any[]): void;
}

/* ================================================================================================================= */

class ConsoleTarget implements ILogTarget
{
    public write(message: LogMessage): void
    {
        console.log("{timestamp} {levelName,5}: {text}".formatPegasus(message));

        if (message.error != null)
            console.log(message.error);
    }
}

/* ================================================================================================================= */

class Logger implements ILogger
{
    constructor(readonly target: ILogTarget)
    {
        this.level = Level.Debug;
    }

    public level: Level;

    public isEnabled(level: Level): boolean { return level >= this.level; }

    public write(level: Level, e: Error | string, ...args: any[]): void
    {
        if (!this.isEnabled(level))
            return;

        let error: Error = null;
        let msg: string;

        if (e instanceof Error)
        {
            error = e;
            msg = args.shift();
        }
        else
            msg = e;

        let message = new LogMessage(level, error, msg, ...args);

        this.target.write(message);
    }

    public verbose(e: Error | string, ...args: any[]): void { this.write(Level.Verbose, e, ...args); }
    public trace  (e: Error | string, ...args: any[]): void { this.write(Level.Trace  , e, ...args); }
    public debug  (e: Error | string, ...args: any[]): void { this.write(Level.Debug  , e, ...args); }
    public info   (e: Error | string, ...args: any[]): void { this.write(Level.Info   , e, ...args); }
    public warn   (e: Error | string, ...args: any[]): void { this.write(Level.Warn   , e, ...args); }
    public error  (e: Error | string, ...args: any[]): void { this.write(Level.Error  , e, ...args); }
    public fatal  (e: Error | string, ...args: any[]): void { this.write(Level.Fatal  , e, ...args); }
}

/* ================================================================================================================= */

let defaultTarget: ConsoleTarget = null;

export module LogManager
{
    export function getLogger(loggerName: string): ILogger
    {
        if (defaultTarget == null)
            defaultTarget = new ConsoleTarget();

        return new Logger(defaultTarget);
    }
}

/* ================================================================================================================= */
