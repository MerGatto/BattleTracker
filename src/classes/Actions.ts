import { UndoHandler } from "./UndoHandler"
import { Action } from "../Interfaces/Action"
import { interruptTable } from "./InterruptTable"

export class Actions
{
  private _actionHistory: Array<Action> = [];

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
    var sum: number = 0;
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

  constructor()
  {
    this.persistentInterrupts = interruptTable.filter(action => { return action.persist });
    this.normalInterrupts = interruptTable.filter(action =>
    {
      return !action.edge && !action.martialArt && !action.persist
    });
    for (let action of this.persistentInterrupts)
    {
      this["_" + action.key] = false;
      Object.defineProperty(this,
        action.key,
        {
          get: () => { return this["_" + action.key] },
          set: (val: boolean) => { UndoHandler.HandleProperty(this, action.key, val) }
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
    for (var action of this.persistentInterrupts)
    {
      this[action.key] = false;
    }
    var items = this.actionHistory;
    UndoHandler.DoAction(() => this._actionHistory = [], () => { this._actionHistory = items });
  }
}
