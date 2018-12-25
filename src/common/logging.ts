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

    constructor(readonly level: Level, text: string, args?: any)
    {
        this.levelName = Level[level];
        this.timestamp = new Date();
        this.text = args !== null ? text.formatPegasus(args) : text;
        this.properties = args;
    }
}

/* ================================================================================================================= */

export interface ILogTarget
{
    write(message: LogMessage): void;
}

export interface ILogger
{
    isEnabled(level: Level): boolean;

    write<T>(level: Level, msg: any, args?: T): void;

    verbose<T>(msg: any, args?: T): void;
    trace  <T>(msg: any, args?: T): void;
    debug  <T>(msg: any, args?: T): void;
    info   <T>(msg: any, args?: T): void;
    warn   <T>(msg: any, args?: T): void;
    error  <T>(msg: any, args?: T): void;
    fatal  <T>(msg: any, args?: T): void;
}

class ConsoleTarget implements ILogTarget
{
    public write(message: LogMessage): void
    {
        console.log("{timestamp} {levelName,5}: {text}".formatPegasus(message));
    }
}

class Logger implements ILogger
{
    constructor(readonly target: ILogTarget)
    {
    }

    isEnabled(level: Level): boolean { return true; }

    write<T>(level: Level, msg: any, args?: T): void
    {
        let message = new LogMessage(level, msg, args);

        this.target.write(message);
    }

    verbose<T>(msg: any, args?: T): void { this.write(Level.Verbose, msg, args); }
    trace  <T>(msg: any, args?: T): void { this.write(Level.Trace  , msg, args); }
    debug  <T>(msg: any, args?: T): void { this.write(Level.Debug  , msg, args); }
    info   <T>(msg: any, args?: T): void { this.write(Level.Info   , msg, args); }
    warn   <T>(msg: any, args?: T): void { this.write(Level.Warn   , msg, args); }
    error  <T>(msg: any, args?: T): void { this.write(Level.Error  , msg, args); }
    fatal  <T>(msg: any, args?: T): void { this.write(Level.Fatal  , msg, args); }
}

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
