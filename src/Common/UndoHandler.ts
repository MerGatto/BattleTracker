export interface PropertyHistoryItem
{
  obj: object;
  property: string;
  oldValue: any;
  newValue: any;
}

interface HistoryEntry
{
  action: () => void;
  undoAction: () => void;
}

type Chapter = HistoryEntry[];

type History = Chapter[];

class UndoHandler
{
    private pastHistory: History = [];
    private futureHistory: History = [];
    private currentChapter: Chapter = [];

    private halted = true;
    private recording = false;

  constructor() {
  // Debug stuff
  (window as any).uhdump = function uhdump()
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

  HandleProperty(obj: object, prop: string, val: any)
  {
    const propBackingFieldName = "_" + prop;
    if (!obj.hasOwnProperty(propBackingFieldName)) {
      throw new Error("obj is missing property: " + propBackingFieldName)
    }
    const oldval = (obj as any)[propBackingFieldName]
    if (oldval !== val)
    {
      (obj as any)[propBackingFieldName] = val;
      const entry: HistoryEntry = {
        action: function () { (obj as any)[propBackingFieldName] = val; },
        undoAction: function () { (obj as any)[propBackingFieldName] = oldval; }
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
    const entry: HistoryEntry = {
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
    const chapt = this.pastHistory.pop() as Chapter;
    const last = chapt.length - 1;
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
    const chapt = this.futureHistory.pop() as Chapter;
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
    this.currentChapter = [];
    this.futureHistory = [];
  }

  EndActions()
  {
    this.recording = false;
    this.pastHistory.push(this.currentChapter);
  }
}

const _undoHandlerInstance = new UndoHandler()

export default _undoHandlerInstance
