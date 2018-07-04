export interface PropertyHistoryItem {
    obj: Object,
    property: string,
    oldValue: any,
    newValue: any;
}

interface HistoryEntry {
    action: () => void;
  undoAction: () => void;
}

type Chapter = Array<HistoryEntry>

type History = Array<Chapter>

export module UndoHandler {

    var pastHistory: History = [];
  var futureHistory: History;
  var currentChapter: Chapter;

  var halted: boolean = true;
  var recording: boolean = false;

  export function Initialize() {
        pastHistory = [];
    futureHistory = [];

    recording = false;
  }

                    
    //Debug stuff
    (<any>window).uhdump = function uhdump() {
        console.log("===========");
      console.log("pastHistory: ");
      console.log(pastHistory);
      console.log("futureHistory: ");
      console.log(futureHistory);
      console.log("currentChapter: ");
      console.log(currentChapter);
      console.log("halted: ");
      console.log(halted);
      console.log("recording: ");
      console.log(recording);
      console.log("===========");
    };

  export function HandleProperty(obj: Object, prop: string, val: any) {        
        var oldval = obj["_"+prop];
    if (oldval != val) {
            obj["_"+prop] = val;
      var entry: HistoryEntry = {
                action: function () {obj["_"+prop] = val },
                undoAction: function () { obj["_"+prop] = oldval }
            };
      if (!recording) {
                StartActions();
      }
            currentChapter.push(entry);
    }
    }

    export function DoAction(action: () => void, undoAction: () => void) {
        var entry: HistoryEntry = {
            action: action,
            undoAction: undoAction 
        };
      if (recording) {
            currentChapter.push(entry);
      }
        action();
    }

    export function Undo() {
        if (recording) EndActions();
      if (pastHistory.length <= 0) return;
      var chapt = pastHistory.pop();
      var last = chapt.length-1;
      for (var i = last; i >= 0; i--) {
            chapt[i].undoAction();
      }
        futureHistory.push(chapt);
    }

    export function Redo() {
        if (futureHistory.length <= 0) return;
      var chapt = futureHistory.pop();
      for (var i = 0; i < chapt.length; i++) {
            chapt[i].action();
      }
        pastHistory.push(chapt);

    }

    export function StartActions() {
        futureHistory = [];
      if (recording) EndActions();
      recording = true;
      currentChapter = new Array();
      futureHistory = new Array();
    }

    export function EndActions() {
        recording = false;
      pastHistory.push(currentChapter);
    }
}