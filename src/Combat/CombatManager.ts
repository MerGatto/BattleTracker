import { Undoable, Utility } from "Common";
import { ParticipantList } from "./Participants/ParticipantList";
import { StatusEnum } from "./Participants/StatusEnum";
import { IParticipant } from "./Participants/IParticipant";

export class CombatManager extends Undoable
{
  private static instance: CombatManager;

  static getInstance(): CombatManager
  {
    if (!CombatManager.instance)
    {
      CombatManager.instance = new CombatManager();
    }
    return CombatManager.instance;
  }

  participants: ParticipantList;
  currentActors: ParticipantList;
  nextSortOrder = 0;

  private _started: boolean;

  get started(): boolean
  {
    return this._started;
  }

  set started(val: boolean)
  {
    this.Set("started", val);
  }

  private _passEnded: boolean;

  get passEnded(): boolean
  {
    return this._passEnded;
  }

  set passEnded(val: boolean)
  {
    this.Set("passEnded", val);
  }

  private _combatTurn: number;

  get combatTurn(): number
  {
    return this._combatTurn;
  }

  set combatTurn(val: number)
  {
    this.Set("combatTurn", val);
  }

  private _initiativePass: number;

  get initiativePass(): number
  {
    return this._initiativePass;
  }

  set initiativePass(val: number)
  {
    this.Set("initiativePass", val);
  }

  private _currentInitiative: number;
  get currentInitiative(): number
  {
    return this._currentInitiative;
  }

  set currentInitiative(val: number)
  {
    this.Set("currentInitiative", val);
  }

  private constructor()
  {
    super();
    this.initialize();
  }

  private initialize()
  {
    this.started = false;
    this.passEnded = true;
    this.combatTurn = 1;
    this.initiativePass = 1;
    this.currentInitiative = NaN;

    this.participants = new ParticipantList();
    this.currentActors = new ParticipantList();
  }

  reset()
  {
    this.combatTurn = 1;
    this.currentActors.clear();
    if (this.started)
    {
      this.started = false;
    }
    this.initiativePass = 1;
    for (let p of this.participants.items)
    {
      p.softReset();
    }
  }

  public startRound()
  {
    this.started = true;
    this.passEnded = false;
    this.goToNextActors();
  }

  nextIniPass()
  {
    this.passEnded = false;
    this.initiativePass++;
    for (let p of this.participants.items)
    {
      if (!p.ooc && p.status !== StatusEnum.Delaying)
      {
        p.status = StatusEnum.Waiting;
      }
    }
  }

  endCombatTurn()
  {
    this.participants.sortBySortOrder();
    this.initiativePass = 1;
    this.combatTurn++;
    this.currentInitiative = NaN;
    for (let p of this.participants.items)
    {
      p.softReset();
    }
    this.started = false;
  }

  endInitiativePass()
  {
    this.passEnded = true;
    if (this.isOver())
    {
      this.endCombatTurn();
      return;
    }
  }
  isOver()
  {
    let over = true;
    for (let p of this.participants.items)
    {
      if (p.getCurrentInitiative() > 0 && !p.ooc)
      {
        over = false;
      }
    }
    return over;
  }

  getNextActors()
  {
    this.currentActors.clear();
    let max = 0;
    let i = 0;
    let edge = false;
    let over = true;
    this.currentInitiative = 0;

    for (let p of this.participants.items)
    {
      let effIni = p.getCurrentInitiative();
      if (!p.ooc && p.status === StatusEnum.Waiting && effIni > 0)
      {
        if (effIni > this.currentInitiative)
        {
          this.currentInitiative = effIni;
        }

        if ((effIni > max && (p.edge || !edge)) || (p.edge && !edge))
        {
          this.currentActors.clear();
          this.currentActors.insert(p);
          edge = p.edge;
          max = effIni;
        } else if (effIni === max && edge === p.edge)
        {
          this.currentActors.insert(p);
        }
      }
    }
  }

  seizeInitiative(p: IParticipant)
  {
    p.seizeInitiative();
  }

  addParticipant(participant: IParticipant)
  {
    participant.sortOrder = this.nextSortOrder++;
    this.participants.insert(participant);
  }

  copyParticipant(p: IParticipant)
  {
    let copy = p.clone();
    copy.edge = false;
    copy.active = false;
    copy.status = StatusEnum.Waiting;
    copy.waiting = false;
    copy.sortOrder = this.nextSortOrder++;

    let regexresult = p.name.match("\\d*$");
    let number = regexresult[0];
    let name = p.name;
    let int;

    //  Extract name and numbner
    if (number)
    {
      name = p.name.substring(0, regexresult.index);
      int = Utility.convertToInt(number);
    }

    // Check for other Participants with the same name
    let high = 0;
    for (let participant of this.participants.items)
    {
      if (participant.name.match(name))
      {
        number = participant.name.match("\\d*$")[0];
        if (number)
        {
          int = Utility.convertToInt(number);
          if (int > high)
          {
            high = int;
          }
        }
      }
    }

    if (high === 0)
    {
      high++;
      p.name = p.name + "1";
    }

    // Set the name for the Copy
    copy.name = name + (high + 1);
    this.participants.insert(copy);
  }

  goToNextActors()
  {
    if (this.currentActors.count > 0)
    {
      for (let a of this.currentActors.items)
      {
        a.status = StatusEnum.Finished;
      }
    }
    this.getNextActors();
    if (this.currentActors.count > 0)
    {
      for (let a of this.currentActors.items)
      {
        a.status = StatusEnum.Active;
      }
    } else
    {
      this.endInitiativePass();
    }

    // TODO place elsewhere
    // if (this.sortByInitiative)
    // {
    //   this.participants.sortByInitiative();
    // }
  }

  act(actor: IParticipant)
  {
    actor.status = StatusEnum.Finished;
    if (this.currentActors.remove(actor))
    {
      if (this.currentActors.count === 0)
      {
        this.goToNextActors();
      }
    }
  }

  removeParticipant(participant)
  {
    this.participants.remove(participant);
  }
}
