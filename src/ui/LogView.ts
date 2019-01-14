/* ================================================================================================================= */
/* ================================================================================================================= */

import { Control, Label, Panel } from "../tau/ui";

import { LogEvent, LogEventType } from "../services/logMonitorService";

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
        item.addClass("line");

        let text: string = "";

        switch (e.type)
        {
        case LogEventType.Closed:
        case LogEventType.Opened:
        case LogEventType.Truncated:
            text = e.source;
            break;

        case LogEventType.NewLine:
            text = (typeof e.message != "string") ? JSON.stringify(e.message) : e.message;
            break;
        }

        let typeLab = new Label(LogEventType[e.type] + ": ");
        typeLab.addClass("type");

        let textLab = new Label(text, { tagName: 'P' });
        textLab.addClass("message");

        item.add(typeLab);
        item.add(textLab);

        this.add(item);
    }
}

/* ================================================================================================================= */
