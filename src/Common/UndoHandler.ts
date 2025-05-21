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

export module UndoHandler
{
  let pastHistory: History = [];
  let futureHistory: History;
  let currentChapter: Chapter;

  let halted: boolean = true;
  let recording: boolean = false;

  export function Initialize()
  {
    pastHistory = [];
    futureHistory = [];

    recording = false;
  }

  // Debug stuff
  (<any>window).uhdump = function uhdump()
  {
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

  export function HandleProperty(obj: Object, prop: string, val: any)
  {
    let oldval = obj["_" + prop];
    if (oldval !== val)
    {
      obj["_" + prop] = val;
      let entry: HistoryEntry = {
        action: function () { obj["_" + prop] = val; },
        undoAction: function () { obj["_" + prop] = oldval; }
      };
      if (!recording)
      {
        StartActions();
      }
      currentChapter.push(entry);
    }
  }

  export function DoAction(action: () => void, undoAction: () => void)
  {
    let entry: HistoryEntry = {
      action: action,
      undoAction: undoAction
    };
    if (recording)
    {
      currentChapter.push(entry);
    }
    action();
  }

  export function Undo()
  {
    if (recording)
    {
      EndActions();
    }
    if (pastHistory.length <= 0)
    {
      return;
    }
    let chapt = pastHistory.pop();
    let last = chapt.length - 1;
    for (let i = last; i >= 0; i--)
    {
      chapt[i].undoAction();
    }
    futureHistory.push(chapt);
  }

  export function Redo()
  {
    if (futureHistory.length <= 0)
    {
      return;
    }
    let chapt = futureHistory.pop();
    for (let i = 0; i < chapt.length; i++)
    {
      chapt[i].action();
    }
    pastHistory.push(chapt);
  }

  export function hasFuture() {
    return futureHistory.length > 0
  }

  export function hasPast() {
    return pastHistory.length > 0
  }

  export function StartActions()
  {
    futureHistory = [];
    if (recording)
    {
      EndActions();
    }
    recording = true;
    currentChapter = new Array();
    futureHistory = new Array();
  }

  export function EndActions()
  {
    recording = false;
    pastHistory.push(currentChapter);
  }
}
