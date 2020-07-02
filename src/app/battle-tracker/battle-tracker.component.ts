import { Component, OnInit } from "@angular/core";

import { Participant } from "../../classes/Participant";
import { ParticipantList } from "../../classes/ParticipantList";
import { Action } from "../../Interfaces/Action";
import { StatusEnum } from "../../classes/StatusEnum";
import * as Utility from "../../utility";
import { UndoHandler } from "../../classes/UndoHandler";
import { LogHandler } from "../../classes/LogHandler";
import * as $ from "jquery";
import { Undoable } from "classes/Undoable";
import { Options } from "sortablejs";
import { BTTime } from "classes/bttime";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

let bt: any;

// Debug stuff
(<any>window).btdump = function btdump()
{
  console.log("===========");
  console.log("bt: ");
  console.log(bt);
  console.log("===========");
};

@Component({
  selector: "app-battle-tracker",
  templateUrl: "./battle-tracker.component.html",
  styleUrls: ["./battle-tracker.component.css"]
})
export class BattleTrackerComponent extends Undoable implements OnInit
{
  participants: ParticipantList;
  currentActors: ParticipantList;
  indexToSelect: number = -1;
  logHandler = LogHandler;
  nextSortOrder = 0;
  options: Options;

  private _started: boolean;

  get started(): boolean
  {
    return this._started;
  }

  set started(val: boolean)
  {
    this.Set("started", val);
  }

  private _sortByInitiative: boolean;

  get sortByInitiative(): boolean
  {
    return this._sortByInitiative;
  }

  set sortByInitiative(val: boolean)
  {
    this.Set("sortByInitiative", val);
    UndoHandler.DoAction(() => this.sort(), () => this.sort());
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

  private _selectedActor: Participant;

  get selectedActor(): Participant
  {
    return this._selectedActor;
  }

  set selectedActor(val: Participant)
  {
    this.Set("selectedActor", val);
  }

  get currentBTTime(): BTTime
  {
    return new BTTime(this.combatTurn, this.initiativePass, this.currentInitiative);
  }

  constructor(private modalService: NgbModal)
  {
    super();
    this.initialize();
    this.addParticipant();
    this.selectedActor = this.participants.items[0];
    bt = this;

    this.options = {
      onUpdate: (event: CustomEvent) =>
      {
        this.onSortUpdate(event);
      }
    };
  }

  onSortUpdate(event: any)
  {
    if (!this.sortByInitiative)
    {
      for (let i = 0; i < this.participants.count; i++)
      {
        this.participants.items[i].sortOrder = i;
      }
    }
  }

  ngOnInit()
  {
    UndoHandler.Initialize();
    UndoHandler.StartActions();
    LogHandler.Initialize();
  }

  initialize()
  {
    this.participants = new ParticipantList();
    this.currentActors = new ParticipantList();

    this.started = false;
    this.passEnded = true;
    this.combatTurn = 1;
    this.initiativePass = 1;
    this.currentInitiative = NaN;
    this.sortByInitiative = true;
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
      if (this.getInitiative(p) > 0 && !p.ooc)
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
      let effIni = this.getInitiative(p);
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

  getInitiative(p: Participant): number
  {
    return p.calculateInitiative(this.initiativePass);
  }

  seizeInitiative(p: Participant)
  {
    p.seizeInitiative();
  }

  addParticipant(): Participant
  {
    let p = new Participant();
    p.sortOrder = this.nextSortOrder++;
    this.participants.insert(p);
    this.selectActor(p);
    return p;
  }

  copyParticipant(p: Participant)
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

  selectActor(p: Participant)
  {
    this.selectedActor = p;
  }

  removeParticipant(participant)
  {
    this.participants.remove(participant);
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
    if (this.sortByInitiative)
    {
      this.participants.sortByInitiative();
    }
  }

  act(actor: Participant)
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

  sort()
  {
    if (!this.passEnded)
    {
      if (this.sortByInitiative)
      {
        this.participants.sortByInitiative();
      } else
      {
        this.participants.sortBySortOrder();
      }
    }
  }

  /// Style Handler
  getParticipantStyles(p: Participant)
  {
    let styles = {
      acting: this.currentActors.contains(p),
      ooc: p.ooc,
      delaying: p.status === StatusEnum.Delaying,
      waiting: p.status === StatusEnum.Waiting,
      noIni: p.diceIni === 0,
      negativeIni: this.getInitiative(p) <= 0 && this.started,
      finished: p.status === StatusEnum.Finished,
      edged: p.edge,
      selected: p === this.selectedActor
    };
    return styles;
  }

  /// Button Handler
  btnAddParticipant_Click()
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "AddParticipant_Click");
    this.addParticipant();
  }

  btnEdge_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Edge_Click");
    sender.seizeInitiative();
  }

  btnRollInitative_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " RollInitative_Click");
    sender.rollInitiative();
  }

  btnAct_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Act_Click");
    this.act(sender);
  }

  btnDelay_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Delay_Click");
    sender.status = StatusEnum.Delaying;
    if (this.currentActors.remove(sender))
    {
      if (this.currentActors.count === 0)
      {
        this.goToNextActors();
      }
    }
  }

  btnStartRound_Click()
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "StartRound_Click");
    this.started = true;
    this.passEnded = false;
    this.goToNextActors();
  }

  btnNextPass_Click()
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "NextPass_Click");
    this.nextIniPass();
    this.goToNextActors();
  }

  btnDelete_Click(sender: Participant)
  {
    LogHandler.log(this.currentBTTime, sender.name + " Delete_Click");
    if (sender.name !== "")
    {
      if (!confirm("Are you sure you want to remove " + sender.name + "?"))
      {
        LogHandler.log(this.currentBTTime, sender.name + " Delete_Cancel");
        return;
      }
    }
    LogHandler.log(this.currentBTTime, sender.name + " Delete_Confirm");
    UndoHandler.StartActions();
    this.removeParticipant(sender);
  }

  btnDuplicate_Click(sender: Participant)
  {
    LogHandler.log(this.currentBTTime, sender.name + " Duplicate_Click");
    UndoHandler.StartActions();
    this.copyParticipant(sender);
  }

  btnReset_Click()
  {
    LogHandler.log(this.currentBTTime, "Reset_Click");
    if (!confirm("Are you sure you want to reset the BattleTracker?"))
    {
      LogHandler.log(this.currentBTTime, "Reset_Cancel");
      return;
    }
    LogHandler.log(this.currentBTTime, "Reset_Confirm");
    UndoHandler.StartActions();
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

  btnLeaveCombat_Click(sender: Participant)
  {
    LogHandler.log(this.currentBTTime, sender.name + " LeaveCombat_Click");
    UndoHandler.StartActions();
    sender.leaveCombat();
    if (this.currentActors.contains(sender))
    {
      // Remove sender from active Actors
      this.act(sender);
    }
  }

  btnEnterCombat_Click(sender: Participant)
  {
    LogHandler.log(this.currentBTTime, sender.name + " EnterCombat_Click");
    UndoHandler.StartActions();
    sender.enterCombat();
  }

  btnAction_Click(p: Participant, action: Action, persistent: boolean)
  {
    LogHandler.log(this.currentBTTime, p.name + " Action_Click: " + action.key);
    UndoHandler.StartActions();
    if (!persistent)
    {
      p.actions.doAction(action);
    } else
    {
      if (!p.actions[action.key])
      {
        p.actions[action.key] = !p.actions[action.key];
      }
    }
  }

  btnCustomAction_Click(p: Participant, inputElem: HTMLInputElement)
  {
    LogHandler.log(this.currentBTTime, p.name + " CustomAction_Click: " + inputElem.value);
    UndoHandler.StartActions();
    let action: Action = {
      iniMod: Number(inputElem.value),
      edge: false,
      key: "custom",
      martialArt: false,
      persist: false
    };
    p.actions.doAction(action);
    inputElem.value = "-5";
  }

  btnUndo_Click()
  {
    LogHandler.log(this.currentBTTime, "Undo_Click");
    UndoHandler.Undo();
  }

  btnRedo_Click()
  {
    LogHandler.log(this.currentBTTime, "Redo_Click");
    UndoHandler.Redo();
  }

  btnAddReminder_Click(content)
  {
    this.modalService.open(content);
  }

  inpName_KeyDown(e)
  {
    let keyCode = e.keyCode || e.which;

    if (keyCode === 9 && !e.shiftKey)
    {
      e.preventDefault();
      let row = $(e.target).closest(".participant");
      let nextRow = $(row).next()[0];
      if (nextRow !== undefined)
      {
        let field: any = $(nextRow).find("input")[0];
        if (field)
        {
          field.select();
          $(nextRow).click();
          return;
        }
      }
      LogHandler.log(this.currentBTTime, "TabAddParticipant");
      UndoHandler.StartActions();
      this.addParticipant();
      this.indexToSelect = 1 + $(row).data("indexnr");
    } else if (keyCode === 9 && e.shiftKey)
    {
      e.preventDefault();
      let row = $(e.target).closest(".participant");
      let prevRow = $(row).prev()[0];
      if (prevRow !== undefined)
      {
        let field: any = $(prevRow).find("input")[0];
        if (field)
        {
          field.select();
          $(prevRow).click();
          return;
        }
      }
    }
  }

  inpDiceIni_KeyDown(e)
  {
    let keyCode = e.keyCode || e.which;

    if (keyCode === 9 && !e.shiftKey)
    {
      e.preventDefault();
      let row = $(e.target).closest(".participant");
      let nextRow = $(row).next()[0];
      if (nextRow !== undefined)
      {
        let field: any = $(nextRow).find(".inpDiceIni")[0];
        if (field)
        {
          field.select();
          $(nextRow).click();
          return;
        }
      }
    } else if (keyCode === 9 && e.shiftKey)
    {
      e.preventDefault();
      let row = $(e.target).closest(".participant");
      let prevRow = $(row).prev()[0];
      if (prevRow !== undefined)
      {
        let field: any = $(prevRow).find(".inpDiceIni")[0];
        if (field)
        {
          field.select();
          $(prevRow).click();
          return;
        }
      }
    }
  }

  inpBaseIni_KeyDown(e)
  {
    let keyCode = e.keyCode || e.which;
    let shift = e.shiftKey;

    if (keyCode === 9 && !shift)
    {
      e.preventDefault();
      let row = $(e.target).closest(".participant");
      let nextRow = $(row).next()[0];
      if (nextRow !== undefined)
      {
        let field: any = $(nextRow).find(".inpBaseIni")[0];
        if (field)
        {
          field.select();
          $(nextRow).click();
          return;
        }
      }
    } else if (keyCode === 9 && shift)
    {
      e.preventDefault();
      let row = $(e.target).closest(".participant");
      let prevRow = $(row).prev()[0];
      if (prevRow !== undefined)
      {
        let field: any = $(prevRow).find(".inpBaseIni")[0];
        if (field)
        {
          field.select();
          $(prevRow).click();
          return;
        }
      }
    }
  }

  ngReady()
  {
    let row = document.getElementById("participant" + this.indexToSelect);
    if (row)
    {
      let field: any = $(row).find("input")[0];
      if (field)
      {
        this.indexToSelect = -1;
        field.select();
        $(row).click();
      }
    }
  }

  // Focus Handler
  inp_Focus(e)
  {
    e.target.select();
  }

  keepMenuOpen(e)
  {
    e.stopPropagation();
  }

  iniChange(e, p: Participant)
  {
    if (p.diceIni < 0)
    {
      e.preventDefault();
      p.diceIni = 0;
      e.target.value = 0;
    }
  }

  onChange(e)
  {
    console.log(e);
  }
}
