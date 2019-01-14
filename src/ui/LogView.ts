/* ================================================================================================================= */
/* ================================================================================================================= */

import { Control, Label, Panel } from "../tau/ui";

import { LogEvent, LogEventType } from "../services/logMonitorService";
import moment = require("moment");

/* ================================================================================================================= */

export class LogView extends Control
{
    constructor ()
    {
        super({ tagName: "UL" });
        this.addClass("log");
    }

    public addLine(e: LogEvent)
    {
        let item = new Panel({ tagName: "LI" });

        switch (e.type)
        {
        case LogEventType.Closed:
        case LogEventType.Opened:
        case LogEventType.Truncated:
            let lab = new Label(LogEventType[e.type] + ": " + e.source);
            lab.addClass("type");
            item.add(lab);
            break;

        case LogEventType.NewLine:
            this.processNewLine(item, e);
            break;
        }

        this.add(item);
    }

    private processNewLine(item: Control, e: LogEvent)
    {
        if (typeof e.message == "string")
            this.addPlainTextLine(item, e);
        else
            this.addObjectLine(item, e);
    }

    private buildHeader(level: string, timestamp?: Date): Control
    {
        if (!timestamp)
            timestamp = new Date();

        let header = new Panel({ tagName: "SPAN" });
        header.addClass("header");

        let timestampLabel = new Label(moment(timestamp).format("lll"), { tagName: "SPAN" });
        timestampLabel.addClass("timestamp");
        header.add(timestampLabel);

        let levelLab = new Label(level.toUpperCase(), { tagName: "SPAN" });
        levelLab.addClass("level", "log-" + level.toLowerCase());
        header.add(levelLab);

        return header;
    }

    private addPlainTextLine(item: Control, e: LogEvent)
    {
        let header = this.buildHeader("DEBUG");

        let textLab = new Label(e.message, { tagName: "PRE" });
        textLab.addClass("message");

        item.add(header);
        item.add(textLab);
    }

    private huntForMessageItems(message: any): [Date, string, string]
    {
        let timestamp = new Date();
        let level = "DEBUG";
        let msg = "";

        for (let k in message)
        {
            if (k.match(/date/i) || k.match(/time/i))
            {
                try
                {
                    timestamp = new Date(message[k]);
                    continue;
                }
                catch
                {
                    // Ignore errors and continue on.
                }
            }

            if (k.match(/level/i))
            {
                level = message[k];
                continue;
            }

            if (k.match(/message/i))
            {
                msg = message[k];
                continue;
            }
        }


        return [timestamp, level, msg];
    }

    private addObjectLine(item: Control, e: LogEvent)
    {
        //text = (typeof e.message != "string") ? JSON.stringify(e.message, null, "  ") : e.message;

        // Check to see if we have some useful details:
        let [timestamp, level, msg] = this.huntForMessageItems(e.message);

        if (msg == null || msg == "")
        {
            // No message, just format as JSON and spit it out.
            e.message = JSON.stringify(e.message, null, '  ');
            this.addPlainTextLine(item, e);
            return;
        }

        let header = this.buildHeader(level, timestamp);
        item.add(header);

        let textLab = new Label(msg, { tagName: "PRE" });
        textLab.addClass("message");

        item.add(textLab);
    }
}

/* ================================================================================================================= */
