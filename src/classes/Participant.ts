import {StatusEnum} from "./StatusEnum"
import {UndoHandler} from "./UndoHandler"
import {Actions} from "./Actions"

export class Participant
{
  private _name: string;

  get name(): string
  {
    return this._name;
  }

  set name(val: string)
  {
    UndoHandler.HandleProperty(this, "name", val);
  }

  private _waiting: boolean;

  get waiting(): boolean
  {
    return this._waiting;
  }

  set waiting(val: boolean)
  {
    UndoHandler.HandleProperty(this, "waiting", val);
  }

  private _finished: boolean;

  get finished(): boolean
  {
    return this._finished;
  }

  set finished(val: boolean)
  {
    UndoHandler.HandleProperty(this, "finished", val);
  }

  private _active: boolean;

  get active(): boolean
  {
    return this._active;
  }

  set active(val: boolean)
  {
    UndoHandler.HandleProperty(this, "active", val);
  }

  private _baseIni: number;

  get baseIni(): number
  {
    return this._baseIni;
  }

  set baseIni(val: number)
  {
    UndoHandler.HandleProperty(this, "baseIni", val);
  }

  private _diceIni: number;

  get diceIni(): number
  {
    return this._diceIni;
  }

  set diceIni(val: number)
  {
    UndoHandler.HandleProperty(this, "diceIni", val);
  }

  private _dices: number;

  get dices(): number
  {
    return this._dices;
  }

  set dices(val: number)
  {
    UndoHandler.HandleProperty(this, "dices", val);
  }

  private _hasPainEditor: boolean;

  get hasPainEditor(): boolean
  {
    return this._hasPainEditor;
  }

  set hasPainEditor(val: boolean)
  {
    UndoHandler.HandleProperty(this, "hasPainEditor", val);
  }

  get wm(): number
  {
    // Pain Editor Exception
    if (this.hasPainEditor)
    {
      return 0;
    }

    var physicalWM = Math.floor((this.physicalDamage - this.painTolerance) / 3);
    if (physicalWM < 0)
    {
      physicalWM = 0;
    }
    var stunWM = Math.floor((this.stunDamage - this.painTolerance) / 3);
    if (stunWM < 0)
    {
      stunWM = 0;
    }
    return physicalWM + stunWM;
  }

  private _ooc: boolean;

  get ooc(): boolean
  {
    // Handle Manual out of Combat
    // TODO maybe make manual out of combat an extra property and style it accordingly
    if (this._ooc)
    {
      return true;
    }

    // Pain Editor Exception
    if (this.hasPainEditor)
    {
      return this.physicalDamage >= this.physicalHealth;
    }

    return this.physicalDamage >= this.physicalHealth || this.stunDamage >= this.stunHealth;
  }

  set ooc(val: boolean)
  {
    UndoHandler.HandleProperty(this, "ooc", val);
  }

  private _edge: boolean;

  get edge(): boolean
  {
    return this._edge;
  }

  set edge(val: boolean)
  {
    UndoHandler.HandleProperty(this, "edge", val);
  }

  private _status: StatusEnum;

  get status(): StatusEnum
  {
    return this._status;
  }

  set status(val: StatusEnum)
  {
    UndoHandler.HandleProperty(this, "status", val);
  }

  private _actions: Actions;

  get actions(): Actions
  {
    return this._actions;
  }

  set actions(val: Actions)
  {
    UndoHandler.HandleProperty(this, "actions", val);
  }

  private _painTolerance: number;

  get painTolerance(): number
  {
    return this._painTolerance;
  }

  set painTolerance(val: number)
  {
    UndoHandler.HandleProperty(this, "painTolerance", val);
  }

  private _overflowHealth: number;

  get overflowHealth(): number
  {
    return this._overflowHealth;
  }

  set overflowHealth(val: number)
  {
    UndoHandler.HandleProperty(this, "overflowHealth", val);
  }

  private _physicalHealth: number;

  get physicalHealth(): number
  {
    return this._physicalHealth;
  }

  set physicalHealth(val: number)
  {
    UndoHandler.HandleProperty(this, "physicalHealth", val);
  }

  private _stunHealth: number;

  get stunHealth(): number
  {
    return this._stunHealth;
  }

  set stunHealth(val: number)
  {
    UndoHandler.HandleProperty(this, "stunHealth", val);
  }

  private _physicalDamage: number;

  get physicalDamage(): number
  {
    return this._physicalDamage;
  }

  set physicalDamage(val: number)
  {
    UndoHandler.HandleProperty(this, "physicalDamage", val);
  }

  private _stunDamage: number;

  get stunDamage(): number
  {
    return this._stunDamage;
  }

  set stunDamage(val: number)
  {
    UndoHandler.HandleProperty(this, "stunDamage", val);
  }

  constructor()
  {
    this.status = StatusEnum.Waiting;
    this.waiting = false;
    this.finished = false;
    this.active = false;
    this.baseIni = 0;
    this.diceIni = 0;
    this.dices = 1;
    this.ooc = false;
    this.actions = new Actions();
    this.edge = false;
    this.name = "";
    this.painTolerance = 0;
    this.overflowHealth = 4;
    this.physicalHealth = 10;
    this.stunHealth = 10;
    this.stunDamage = 0;
    this.physicalDamage = 0;
    this.hasPainEditor = false;
  }

  clone(): Participant
  {
    var clone: Participant = new Participant();
    clone._active = this._active;
    clone._baseIni = this._baseIni;
    clone._diceIni = this._diceIni;
    clone._dices = this._dices;
    clone._edge = this._edge;
    clone._finished = this._finished;
    clone._name = this._name;
    clone._ooc = this._ooc;
    clone._overflowHealth = this._overflowHealth;
    clone._painTolerance = this._painTolerance;
    clone._physicalDamage = this._physicalDamage;
    clone._physicalHealth = this._physicalHealth;
    clone._status = this._status;
    clone._stunDamage = this._stunDamage;
    clone._stunHealth = this._stunHealth;
    clone._waiting = this._waiting;
    clone._hasPainEditor = this._hasPainEditor;
    return clone;
  }

  seizeInitiative()
  {
    this.edge = true;
  }

  calculateInitiative(initiativeTurn: number)
  {
    var ini = this.diceIni + this.baseIni - this.wm - (initiativeTurn - 1) * 10 + this.actions.modifier;
    return ini;
  }

  leaveCombat()
  {
    this.ooc = true;
  }

  enterCombat()
  {
    this.ooc = false;
  }

  rollInitiative()
  {
    this.diceIni = 0;
    var max = 6;
    var min = 1;
    for (var i = 0; i < this.dices; i++)
    {
      this.diceIni += Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var test = false;
    // DICE TEST
    if (test)
    {
      var slots: Array<number> = new Array<number>();
      for (var index = 1; index <= 6; index++)
      {
        slots[index] = 0;
      }
      for (var i = 0; i < 1000000; i++)
      {
        var d = Math.floor(Math.random() * (max - min + 1)) + min;
        slots[d]++;
      }
      console.log(slots);
    }
  }

  softReset(revive = false)
  {
    this.diceIni = 0;
    this.edge = false;
    this.status = StatusEnum.Waiting;
    if (revive || !this.ooc)
    {
      this.enterCombat();
    }
    this.actions.reset();
  }

  hardReset()
  {
    this.softReset(true);
    this.physicalDamage = 0;
    this.stunDamage = 0;
    this.diceIni = 0;
    this.dices = 1;
    this.baseIni = 0;
  }
}
