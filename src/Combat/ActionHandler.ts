import { Action } from "Interfaces/Action";
import { interruptTable } from "InterruptTable";

const COMMON_INTERRUPTS = [ "fullDefense", "runForYourLife", "counterstrike", "rightBackAtYa" ]
class ActionHandler
{

  get interrupts()
  {
    return interruptTable;
  }

  readonly persistentInterrupts: Array<Action>;
  readonly normalInterrupts: Array<Action>;
  readonly commonInterrupts: Array<Action>;

  constructor()
  {
    this.persistentInterrupts = interruptTable.filter(action => action.persist);
    this.normalInterrupts = interruptTable.filter(action =>
    {
      return !action.edge && !action.martialArt && !action.persist;
    });
    this.commonInterrupts = COMMON_INTERRUPTS.map(key => interruptTable.find(action => action.key === key)).filter(e => e !== undefined)
  }
}

export default new ActionHandler();
