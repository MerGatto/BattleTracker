import { Component, OnInit } from '@angular/core'

import { Participant } from "../../classes/Participant"
import { ParticipantList } from "../../classes/ParticipantList"
import {Action} from "../../Interfaces/Action"
import { StatusEnum } from "../../classes/StatusEnum"
import * as Utility from "../../utility"
import {UndoHandler} from "../../classes/UndoHandler"
import { LogHandler } from "../../classes/LogHandler"
import * as $ from 'jquery';

var bt: any;

//Debug stuff
(<any>window).btdump = function btdump()
{
  console.log("===========");
  console.log("bt: ");
  console.log(bt);
  console.log("===========");
};

@Component({
  selector: 'app-battle-tracker',
  templateUrl: './battle-tracker.component.html',
  styleUrls: ['./battle-tracker.component.css']
})
export class BattleTrackerComponent implements OnInit
{
  participants: ParticipantList;
  currentActors: ParticipantList;
  indexToSelect: number = -1;
  logHandler = LogHandler;

  private _started: boolean;

  get started(): boolean
  {
    return this._started;
  }

  set started(val: boolean)
  {
    UndoHandler.HandleProperty(this, "started", val);
  }

  private _passEnded: boolean;

  get passEnded(): boolean
  {
    return this._passEnded;
  }

  set passEnded(val: boolean)
  {
    UndoHandler.HandleProperty(this, "passEnded", val);
  }

  private _combatTurn: number;

  get combatTurn(): number
  {
    return this._combatTurn;
  }

  set combatTurn(val: number)
  {
    UndoHandler.HandleProperty(this, "combatTurn", val);
  }

  private _initiativeTurn: number;

  get initiativeTurn(): number
  {
    return this._initiativeTurn;
  }

  set initiativeTurn(val: number)
  {
    UndoHandler.HandleProperty(this, "initiativeTurn", val);
  }

  private _selectedActor: Participant;

  get selectedActor(): Participant
  {
    return this._selectedActor;
  }

  set selectedActor(val: Participant)
  {
    UndoHandler.HandleProperty(this, "selectedActor", val);
  }

  constructor()
  {
    this.initialize();
    this.addParticipant();
    this.selectedActor = this.participants.items[0];
    bt = this;
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
    this.passEnded = false;
    this.combatTurn = 1;
    this.initiativeTurn = 1;
  }

  nextIniPass()
  {
    this.passEnded = false;
    this.initiativeTurn++;
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
    this.initiativeTurn = 1;
    this.combatTurn++;
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
    var over = true;
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
    var max = 0;
    var i = 0;
    var edge = false;
    var over = true;
    for (let p of this.participants.items)
    {
      let effIni = this.getInitiative(p);
      if (!p.ooc && p.status == StatusEnum.Waiting && effIni > 0)
      {
        if (effIni > max && (p.edge || !edge) || p.edge && !edge)
        {
          this.currentActors.clear();
          this.currentActors.insert(p);
          max = effIni;
          edge = p.edge;
        } else if (effIni == max && edge == p.edge)
        {
          this.currentActors.insert(p);
        }
      }
    }
  }

  getInitiative(p: Participant): number
  {
    return p.calculateInitiative(this.initiativeTurn);
  }

  seizeInitiative(p: Participant)
  {
    p.seizeInitiative();
  }

  addParticipant()
  {
    var p = new Participant();
    this.participants.insert(p);
    this.selectActor(p);
  }

  copyParticipant(p: Participant)
  {
    var copy = p.clone();
    copy.edge = false;
    copy.active = false;
    copy.status = StatusEnum.Waiting;
    copy.waiting = false;

    var regexresult = p.name.match("\\d*$");
    var number = regexresult[0];
    var name = p.name;
    var int;

    //  Extract name and numbner
    if (number)
    {
      name = p.name.substring(0, regexresult.index);
      console.log(name);
      int = Utility.convertToInt(number);
    }

    // Check for other Participants with the same name
    var high = 0;
    for (var participant of this.participants.items)
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
  }

  act(actor: Participant)
  {
    actor.status = StatusEnum.Finished;
    if (this.currentActors.remove(actor))
    {
      if (this.currentActors.count == 0)
      {
        this.goToNextActors();
      }
    }
  }

  /// Style Handler
  getParticipantStyles(p: Participant)
  {
    var styles = {
      'acting': this.currentActors.contains(p),
      'ooc': p.ooc,
      'delaying': p.status == StatusEnum.Delaying,
      'waiting': p.status == StatusEnum.Waiting,
      'noIni': p.diceIni == 0,
      'negativeIni': this.getInitiative(p) <= 0 && this.started,
      'finished': p.status == StatusEnum.Finished,
      'edged': p.edge,
      'selected': p == this.selectedActor
    };
    return styles;
  }

  /// Button Handler
  btnAddParticipant_Click()
  {
    UndoHandler.StartActions();
    LogHandler.Log("AddParticipant_Click");
    this.addParticipant();
  }

  btnEdge_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.Log(sender.name + " Edge_Click");
    sender.seizeInitiative();
  }

  btnRollInitative_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.Log(sender.name + " RollInitative_Click");
    sender.rollInitiative();
  }

  btnAct_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.Log(sender.name + " Act_Click");
    this.act(sender);
  }

  btnDelay_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.Log(sender.name + " Delay_Click");
    sender.status = StatusEnum.Delaying;
    if (this.currentActors.remove(sender))
    {
      if (this.currentActors.count == 0)
      {
        this.goToNextActors();
      }
    }
  }

  btnStartRound_Click()
  {
    UndoHandler.StartActions();
    LogHandler.Log("StartRound_Click");
    this.started = true;
    this.passEnded = false;
    this.goToNextActors();
  }

  btnNextPass_Click()
  {
    UndoHandler.StartActions();
    LogHandler.Log("NextPass_Click");
    this.nextIniPass();
    this.goToNextActors();
  }

  btnDelete_Click(sender: Participant)
  {
    LogHandler.Log(sender.name + " Delete_Click");
    if (sender.name != "")
    {
      if (!confirm("Are you sure you want to remove " + sender.name + "?"))
      {
        LogHandler.Log(sender.name + " Delete_Cancel");
        return;
      }
    }
    LogHandler.Log(sender.name + " Delete_Confirm");
    UndoHandler.StartActions();
    this.removeParticipant(sender);
  }

  btnDuplicate_Click(sender: Participant)
  {
    LogHandler.Log(sender.name + " Duplicate_Click");
    UndoHandler.StartActions();
    this.copyParticipant(sender);
  }

  btnReset_Click()
  {
    LogHandler.Log("Reset_Click");
    if (!confirm("Are you sure you want to reset the BattleTracker?"))
    {
      LogHandler.Log("Reset_Cancel");
      return;
    }
    LogHandler.Log("Reset_Confirm");
    UndoHandler.StartActions();
    this.combatTurn = 1;
    this.currentActors.clear();
    if (this.started)
    {
      this.started = false;
    }
    this.initiativeTurn = 1;
    for (let p of this.participants.items)
    {
      p.softReset();
    }
  }

  btnLeaveCombat_Click(sender: Participant)
  {
    LogHandler.Log(sender.name + " LeaveCombat_Click");
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
    LogHandler.Log(sender.name + " EnterCombat_Click");
    UndoHandler.StartActions();
    sender.enterCombat();
  }

  btnAction_Click(p: Participant, action: Action, persistent: boolean)
  {
    LogHandler.Log(p.name + " Action_Click: " + action.key);
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
    LogHandler.Log(p.name + " CustomAction_Click: " + inputElem.value);
    UndoHandler.StartActions();
    var action: Action = {
      iniMod: Number(inputElem.value),
      edge: false,
      key: "custom",
      martialArt: false,
      persist: false
    }
    p.actions.doAction(action);
    inputElem.value = "-5";
  }

  btnUndo_Click()
  {
    LogHandler.Log("Undo_Click");
    UndoHandler.Undo();
  }

  btnRedo_Click()
  {
    LogHandler.Log("Redo_Click");
    UndoHandler.Redo();
  }

  inpName_KeyDown(e)
  {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 9 && !e.shiftKey)
    {
      e.preventDefault();
      var row = $(e.target).closest('.participant');
      var nextRow = $(row).next()[0];
      if (nextRow != undefined)
      {
        var field: any = $(nextRow).find('input')[0];
        if (field)
        {
          field.select();
          $(nextRow).click();
          return;
        }
      }
      LogHandler.Log("TabAddParticipant");
      UndoHandler.StartActions();
      this.addParticipant();
      this.indexToSelect = 1 + $(row).data("indexnr");
    } else if (keyCode == 9 && e.shiftKey)
    {
      e.preventDefault();
      var row = $(e.target).closest('.participant');
      var prevRow = $(row).prev()[0];
      if (prevRow != undefined)
      {
        var field: any = $(prevRow).find('input')[0];
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
    var keyCode = e.keyCode || e.which;

    if (keyCode == 9 && !e.shiftKey)
    {
      e.preventDefault();
      var row = $(e.target).closest('.participant');
      var nextRow = $(row).next()[0];
      if (nextRow != undefined)
      {
        var field: any = $(nextRow).find('.inpDiceIni')[0];
        if (field)
        {
          field.select();
          $(nextRow).click();
          return;
        }
      }
    } else if (keyCode == 9 && e.shiftKey)
    {
      e.preventDefault();
      var row = $(e.target).closest('.participant');
      var prevRow = $(row).prev()[0];
      if (prevRow != undefined)
      {
        var field: any = $(prevRow).find('.inpDiceIni')[0];
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
    var keyCode = e.keyCode || e.which;
    var shift = e.shiftKey;

    if (keyCode == 9 && !shift)
    {
      e.preventDefault();
      var row = $(e.target).closest('.participant');
      var nextRow = $(row).next()[0];
      if (nextRow != undefined)
      {
        var field: any = $(nextRow).find('.inpBaseIni')[0];
        if (field)
        {
          field.select();
          $(nextRow).click();
          return;
        }
      }
    } else if (keyCode == 9 && shift)
    {
      e.preventDefault();
      var row = $(e.target).closest('.participant');
      var prevRow = $(row).prev()[0];
      if (prevRow != undefined)
      {
        var field: any = $(prevRow).find('.inpBaseIni')[0];
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
    var row = document.getElementById("participant" + this.indexToSelect);
    if (row)
    {
      var field: any = $(row).find('input')[0];
      if (field)
      {
        this.indexToSelect = -1;
        field.select();
        $(row).click();
      }
    }
  }

  //Focus Handler
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
