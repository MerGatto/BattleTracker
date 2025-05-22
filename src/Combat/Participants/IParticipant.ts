import { StatusEnum } from "./StatusEnum";
import { Action } from "Interfaces/Action";

export interface IParticipant
{
  name: string;
  waiting: boolean;
  finished: boolean;
  active: boolean;
  baseIni: number;
  iniModifier: number
  diceIni: number;
  dices: number;
  hasPainEditor: boolean;
  readonly wm: number;
  ooc: boolean;
  edge: boolean;
  status: StatusEnum;
  painTolerance: number;
  overflowHealth: number;
  physicalHealth: number;
  stunHealth: number;
  physicalDamage: number;
  stunDamage: number;
  sortOrder: number;
  actionHistory: Action[];

  clone(): IParticipant;
  seizeInitiative(): void;
  getCurrentInitiative(): number;
  canUseAction(action: Action): boolean;
  isInFullDefense(): boolean;
  doAction(action: Action): void;
  leaveCombat(): void;
  enterCombat(): void;
  rollInitiative(): void;
  resetActions(): void;

  softReset(revive?: boolean): void;
  hardReset(): void;
}
