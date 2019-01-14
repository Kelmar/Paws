/* ================================================================================================================= */
/* ================================================================================================================= */

const dgram = require('dgram');

import { Subject, Observable } from "rxjs";

import { IDisposable } from "lepton-di";

import { ILogger, LogManager } from "../../../tau/common/logging";

import { LogEvent, LogEventType } from "../common";

import { ILogSource } from "./common";

/* ================================================================================================================= */

const DEFAULT_PORT = 10514;

/* ================================================================================================================= */

export class UdpSource implements ILogSource, IDisposable
{
    private readonly m_log: ILogger

    private m_subject: Subject<LogEvent>;
    private m_socket: any;

    constructor(public readonly name: URL)
    {
        if (!name.port)
            name.port = "" + DEFAULT_PORT;

        this.m_log = LogManager.getLogger("paws.udp4." + name.port);
        this.m_subject = new Subject();

        this.m_socket = dgram.createSocket(this.name.protocol.replace(/:$/, ''));

        this.m_socket.once("listening", () => this.onListening());
        this.m_socket.on("error", (e: any) => this.onError(e));
        this.m_socket.on("message", (message: any, rinfo: any) => this.onMessage(message, rinfo));

        this.m_socket.bind(this.name.port, this.name.hostname);
    }

    public dispose(): void
    {
        if (this.m_subject)
        {
            this.m_subject.complete();
            this.m_subject = null;
        }

        if (this.m_socket)
        {
            this.m_socket.removeAllListeners("message");
            this.m_socket.removeAllListeners("error");

            this.m_socket.close();
            this.m_socket = null;
        }
    }

    public get event$(): Observable<LogEvent>
    {
        return this.m_subject;
    }

    private onListening(): void
    {
        this.m_log.info("UDP log server ready.");

        this.m_subject.next({
            type: LogEventType.Opened,
            source: this.name.href,
            message: ""
        });
    }

    private onMessage(message: any, rinfo: any): void
    {
        this.m_log.debug("Message from {rinfo}", { rinfo: rinfo });

        if (typeof message != "string")
        {
            // Buffer data
            message = message.toString();
        }

        this.m_subject.next({
            type: LogEventType.NewLine,
            source: this.name.protocol + "//" + rinfo.address + ":" + rinfo.port,
            message: message
        });
    }

    private onError(e: any): void
    {
        this.m_log.error(e, "Error receiving data on UDP socket.");

        this.m_subject.next({
            type: LogEventType.Error,
            source: this.name.href,
            message: e
        });

        this.m_subject.complete();
        this.m_subject = null;
    }
}

/* ================================================================================================================= */
