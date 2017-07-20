interface LogEntry {
    timestamp: Date
    text: String
}

type Log = Array<LogEntry>

export module LogHandler {
    export var log : Log
    
    export function Initialize() {
        log = []
    }

    export function Log(text: String) {
        var entry: LogEntry = {
            text: text,
            timestamp: new Date()
        }
        log.push(entry)
    }

        //Debug stuff
    (<any>window).logdump = function logdump() {
        console.log("===========")
        console.log("log: ")
        console.log(log)
        console.log("===========")
    }

}