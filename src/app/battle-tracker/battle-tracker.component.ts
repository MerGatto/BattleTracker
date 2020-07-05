import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import * as $ from "jquery";
import { Options } from "sortablejs";
import { NgbModal, NgbDropdown } from "@ng-bootstrap/ng-bootstrap";
import { Undoable, UndoHandler } from "Common";
import { CombatManager, StatusEnum, BTTime } from "Combat";
import { Participant } from "Combat/Participants/Participant";
import { LogHandler } from "Logging";
import { Action } from "Interfaces/Action";

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
  combatManager: CombatManager;
  indexToSelect: number = -1;
  logHandler = LogHandler;
  options: Options;
  changeDetector: ChangeDetectorRef;

  @ViewChild(NgbDropdown)
  private interruptDropdown: NgbDropdown;

  private _sortByInitiative: boolean;

  get sortByInitiative(): boolean
  {
    return this._sortByInitiative;
  }

  get currentBTTime(): BTTime
  {
    return new BTTime(this.combatManager.combatTurn, this.combatManager.initiativePass, this.combatManager.currentInitiative);
  }

  set sortByInitiative(val: boolean)
  {
    this.Set("sortByInitiative", val);
    UndoHandler.DoAction(() => this.sort(), () => this.sort());
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

  constructor(private ref: ChangeDetectorRef, private modalService: NgbModal)
  {
    super();
    this.initialize();
    this.addParticipant();
    bt = this;
    this.changeDetector = ref;

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
      for (let i = 0; i < this.combatManager.participants.count; i++)
      {
        this.combatManager.participants.items[i].sortOrder = i;
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
    this.combatManager = CombatManager.getInstance();
    this.sortByInitiative = true;
  }

  selectActor(p: Participant)
  {
    this.selectedActor = p;
  }

  sort()
  {
    if (!this.combatManager.passEnded)
    {
      if (this.sortByInitiative)
      {
        this.combatManager.participants.sortByInitiative();
      } else
      {
        this.combatManager.participants.sortBySortOrder();
      }
    }
  }

  /// Style Handler
  getParticipantStyles(p: Participant)
  {
    let styles = {
      acting: this.combatManager.currentActors.contains(p),
      ooc: p.ooc,
      delaying: p.status === StatusEnum.Delaying,
      waiting: p.status === StatusEnum.Waiting,
      noIni: p.diceIni === 0,
      negativeIni: p.getCurrentInitiative() <= 0 && this.combatManager.started,
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
    this.addParticipant()
  }

  btnEdge_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Edge_Click");
    sender.seizeInitiative();
  }

  btnRollInitiative_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " RollInitiative_Click");
    sender.rollInitiative();
  }

  btnAct_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Act_Click");
    this.combatManager.act(sender);
  }

  btnDelay_Click(sender: Participant)
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Delay_Click");
    sender.status = StatusEnum.Delaying;
    if (this.combatManager.currentActors.remove(sender))
    {
      if (this.combatManager.currentActors.count === 0)
      {
        this.combatManager.goToNextActors();
      }
    }
  }

  btnStartRound_Click()
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "StartRound_Click");
    this.combatManager.startRound();
  }

  btnNextPass_Click()
  {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "NextPass_Click");
    this.combatManager.nextIniPass();
    this.combatManager.goToNextActors();
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
    this.combatManager.removeParticipant(sender);
  }

  btnDuplicate_Click(sender: Participant)
  {
    LogHandler.log(this.currentBTTime, sender.name + " Duplicate_Click");
    UndoHandler.StartActions();
    this.combatManager.copyParticipant(sender);
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
    this.combatManager.reset();
  }

  btnLeaveCombat_Click(sender: Participant)
  {
    LogHandler.log(this.currentBTTime, sender.name + " LeaveCombat_Click");
    UndoHandler.StartActions();
    sender.leaveCombat();
    if (this.combatManager.currentActors.contains(sender))
    {
      // Remove sender from active Actors
      this.combatManager.act(sender);
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
    if (!p.canUseAction(action))
    {
      return;
    }
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
    this.interruptDropdown.close();
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
    this.interruptDropdown.close();
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

    // Tab Key
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
      this.changeDetector.detectChanges();
    }
  }

  // Focus Handler
  inp_Focus(e)
  {
    e.target.select();
  }

  keepMenuOpen(e: MouseEvent)
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

  addParticipant(selectNewParticipant = true)
  {
    let p = new Participant();
    this.combatManager.addParticipant(p);
    if (selectNewParticipant)
    {
      this.selectActor(p);
    }
  }
}
