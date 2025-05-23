import { BTTime } from "Combat";

interface LogEntry {
  timestamp: Date;
  text: string;
  bttime: BTTime;
}

type Log = LogEntry[];

class LogHandler {
  public logbook: Log;

  constructor() {
    this.logbook = [];

    // Debug stuff
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).logdump = () => {
      console.log("===========");
      console.log("logbook: ");
      console.log(this.logbook);
      console.log("===========");
    };
  }

  log(time: BTTime, text: string) {
    const entry: LogEntry = {
      text: text,
      timestamp: new Date(),
      bttime: time
    };
    this.logbook.push(entry);
  }
}

export default new LogHandler()
