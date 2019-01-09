/* ================================================================================================================= */
/* ================================================================================================================= */

export * from "./common/windowService";

/* ================================================================================================================= */

import { ENVIRONMENT_INFO, ElectronSupport } from "tau/common/startup";

switch (ENVIRONMENT_INFO.electron)
{
case ElectronSupport.Main:
    require("./main/windowService");
    break;

case ElectronSupport.Render:
default:
    require("./render/windowService");
    break;
}

/* ================================================================================================================= */
