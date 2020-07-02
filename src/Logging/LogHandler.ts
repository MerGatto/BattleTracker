import { BTTime } from "Combat";

interface LogEntry
{
  timestamp: Date;
  text: String;
  bttime: BTTime;
}

type Log = Array<LogEntry>;

export module LogHandler
{
  export let logbook: Log;

  export function Initialize()
  {
    logbook = [];
  }

  export function log(time: BTTime, text: String)
  {
    let entry: LogEntry = {
      text: text,
      timestamp: new Date(),
      bttime: time
    };
    logbook.push(entry);
  }

  // Debug stuff
  (<any>window).logdump = function logdump()
  {
    console.log("===========");
    console.log("logbook: ");
    console.log(logbook);
    console.log("===========");
  };
}
