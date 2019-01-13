/* ================================================================================================================= */
/* ================================================================================================================= */

const dgram = require('dgram');

import { ILogSource, EventType, Event } from "./common";
import { IDisposable } from "lepton-di";
import { ILogger, LogManager } from "tau/common/logging";
import { Subject, Observable } from "rxjs";

/* ================================================================================================================= */

const DEFAULT_PORT = 10514;
const DEFAULT_ADDRESS = "localhost";

/* ================================================================================================================= */

// This is the example UDP server from the node docs, just exploring how this works.

const logServer = dgram.createSocket('udp4');
logServer.on('error', (err: Error) =>
{
    console.log(`server error:\n${err}`);
});

logServer.on('message', (message: any, rinfo: any) =>
{
    /*
     * rinfo: { address: 'ip', family: 'IPvX', port: remote_port_num, size: num_bytes }
     */
    console.log(rinfo, `: ${message}`);
});

logServer.on('listening', () =>
{
    /*
     * Address: { address: 'ip', family: 'IPvX', port: 41234 };
     */
    const address = logServer.address();
    console.log("server listening", address);
});

logServer.bind(41234);

/* ================================================================================================================= */

export interface UdpSourceOptions
{
    bindTo?: string;
}

/* ================================================================================================================= */

const DEFAULT_OPTIONS: UdpSourceOptions = {
    bindTo: DEFAULT_ADDRESS + ":" + DEFAULT_PORT
}

/* ================================================================================================================= */

export class UdpSource implements ILogSource, IDisposable
{
    private readonly m_log: ILogger

    private readonly m_address: string;
    private readonly m_port: number;

    private readonly m_fullAddress: URL;

    private m_subject: Subject<Event>;
    private m_socket: any;

    constructor(options?: UdpSourceOptions)
    {
        options = {...DEFAULT_OPTIONS, ...options};

        [this.m_address, this.m_port] = UdpSource.parseBindTo(options.bindTo);
        this.m_fullAddress = new URL("udp://" + this.m_address + ":" + this.m_port);

        this.m_log = LogManager.getLogger("paws.udp." + this.m_port);
        this.m_subject = new Subject();

        this.m_socket = dgram.createSocket("udp");

        this.m_socket.once("listening", () => this.onListening());
        this.m_socket.on("error", (e: any) => this.onError(e));
        this.m_socket.on("message", (message: any, rinfo: any) => this.onMessage(message, rinfo));

        this.m_socket.bind(this.m_port, this.m_address);
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

    public get event$(): Observable<Event>
    {
        return this.m_subject;
    }

    private static parseBindTo(bindTo: string): [string, number]
    {
        let parts: string[] = bindTo.split(':', 2);

        let address = parts[0] || DEFAULT_ADDRESS;
        let port: number = DEFAULT_PORT;

        if (parts.length > 1)
            port = parseInt(parts[1]) || DEFAULT_PORT;

        return [address, port];
    }

    private onListening(): void
    {
        this.m_log.info("UDP Log Server Ready.");
        this.m_subject.next({
            type: EventType.Opened,
            source: this.m_fullAddress,
            message: ""
        });
    }

    private onMessage(message: any, rinfo: any): void
    {
        this.m_subject.next({
            type: EventType.NewLine,
            source: new URL("udp://" + rinfo.address + ":" + rinfo.port),
            message: message
        });
    }

    private onError(e: any): void
    {
        this.m_log.error(e, "Error receiving data on UDP socket.");

        this.m_subject.next({
            type: EventType.Error,
            source: this.m_fullAddress,
            message: e
        });

        this.m_subject.complete();
        this.m_subject = null;
    }
}

/* ================================================================================================================= */
