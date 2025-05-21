import { Action } from "Interfaces/Action";
import { interruptTable } from "InterruptTable";
import { UndoHandler } from "Common";

const COMMON_INTERRUPTS = [ "fullDefense", "runForYourLife", "counterstrike", , "intercept" ] as const
export class Actions
{

  get actionHistory()
  {
    return this._actionHistory;
  }

  get interrupts()
  {
    return interruptTable;
  }

  get modifier(): number
  {
    let sum: number = 0;
    for (let action of this.persistentInterrupts)
    {
      if (this[action.key] === true)
      {
        sum += action.iniMod;
      }
    }
    for (let action of this.actionHistory)
    {
      sum += action.iniMod;
    }

    return sum;
  }

  readonly persistentInterrupts: Array<Action>;
  readonly normalInterrupts: Array<Action>;
  readonly commonInterrupts: Array<Action>;
  private _actionHistory: Array<Action> = [];

  constructor()
  {
    this.persistentInterrupts = interruptTable.filter(action => action.persist);
    this.normalInterrupts = interruptTable.filter(action =>
    {
      return !action.edge && !action.martialArt && !action.persist;
    });
    this.commonInterrupts = interruptTable.filter(action => COMMON_INTERRUPTS.includes(action.key))

    for (let action of this.persistentInterrupts)
    {
      this["_" + action.key] = false;
      Object.defineProperty(this,
        action.key,
        {
          get: () => this["_" + action.key],
          set: (val: boolean) => { UndoHandler.HandleProperty(this, action.key, val); }
        });
    }
    this.reset();
  }

  doAction(action: Action)
  {
    UndoHandler.DoAction(() =>
    {
      this.actionHistory.push(action);
    },
      () =>
      {
        this.actionHistory.pop();
      });
  }

  reset()
  {
    for (let action of this.persistentInterrupts)
    {
      this[action.key] = false;
    }
    let items = this.actionHistory;
    UndoHandler.DoAction(() => this._actionHistory = [], () => { this._actionHistory = items; });
  }
}
