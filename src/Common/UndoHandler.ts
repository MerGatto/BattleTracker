export interface PropertyHistoryItem
{
  obj: Object;
  property: string;
  oldValue: any;
  newValue: any;
}

interface HistoryEntry
{
  action: () => void;
  undoAction: () => void;
}

type Chapter = Array<HistoryEntry>;

type History = Array<Chapter>;

class UndoHandler
{
    private pastHistory: History = [];
    private futureHistory: History;
    private currentChapter: Chapter;

    private halted: boolean = true;
    private recording: boolean = false;

  constructor() {
  // Debug stuff
  (<any>window).uhdump = function uhdump()
  {
    console.log("===========");
    console.log("pastHistory: ");
    console.log(this.pastHistory);
    console.log("futureHistory: ");
    console.log(this.futureHistory);
    console.log("currentChapter: ");
    console.log(this.currentChapter);
    console.log("halted: ");
    console.log(this.halted);
    console.log("recording: ");
    console.log(this.recording);
    console.log("===========");
  };
  }

  Initialize()
  {
    this.pastHistory = [];
    this.futureHistory = [];

    this.recording = false;
  }

  HandleProperty(obj: Object, prop: string, val: any)
  {
    let oldval = obj["_" + prop];
    if (oldval !== val)
    {
      obj["_" + prop] = val;
      let entry: HistoryEntry = {
        action: function () { obj["_" + prop] = val; },
        undoAction: function () { obj["_" + prop] = oldval; }
      };
      if (!this.recording)
      {
        this.StartActions();
      }
      this.currentChapter.push(entry);
    }
  }

  DoAction(action: () => void, undoAction: () => void)
  {
    let entry: HistoryEntry = {
      action: action,
      undoAction: undoAction
    };
    if (this.recording)
    {
      this.currentChapter.push(entry);
    }
    action();
  }

  Undo()
  {
    if (this.recording)
    {
     this.EndActions();
    }
    if (this.pastHistory.length <= 0)
    {
      return;
    }
    let chapt = this.pastHistory.pop();
    let last = chapt.length - 1;
    for (let i = last; i >= 0; i--)
    {
      chapt[i].undoAction();
    }
    this.futureHistory.push(chapt);
  }

  Redo()
  {
    if (this.futureHistory.length <= 0)
    {
      return;
    }
    let chapt = this.futureHistory.pop();
    for (let i = 0; i < chapt.length; i++)
    {
      chapt[i].action();
    }
    this.pastHistory.push(chapt);
  }

  hasFuture() {
    return this.futureHistory.length > 0
  }

  hasPast() {
    return this.pastHistory.length > 0
  }

  StartActions()
  {
    this.futureHistory = [];
    if (this.recording)
    {
      this.EndActions();
    }
    this.recording = true;
    this.currentChapter = new Array();
    this.futureHistory = new Array();
  }

  EndActions()
  {
    this.recording = false;
    this.pastHistory.push(this.currentChapter);
  }
}

let _undoHandlerInstance = new UndoHandler()

export default _undoHandlerInstance
