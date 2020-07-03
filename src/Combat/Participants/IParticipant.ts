import { StatusEnum } from "./StatusEnum";
import { Actions } from "Combat/Actions";
import { Action } from "Interfaces/Action";

export interface IParticipant
{
  name: string;
  waiting: boolean;
  finished: boolean;
  active: boolean;
  baseIni: number;
  diceIni: number;
  dices: number;
  hasPainEditor: boolean;
  readonly wm: number;
  ooc: boolean;
  edge: boolean;
  status: StatusEnum;
  actions: Actions;
  painTolerance: number;
  overflowHealth: number;
  physicalHealth: number;
  stunHealth: number;
  physicalDamage: number;
  stunDamage: number;
  sortOrder: number;

  clone(): IParticipant;
  seizeInitiative();
  getCurrentInitiative();
  canUseAction(action: Action): boolean;
  leaveCombat();
  enterCombat();
  rollInitiative();

  softReset(revive?: boolean);
  hardReset();
}
