import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { NgbModal, NgbNavModule, NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { Undoable, UndoHandler, Utility } from "Common";
import { CombatManager, StatusEnum, BTTime, IParticipant } from "Combat";
import { Participant } from "Combat/Participants/Participant";
import { LogHandler } from "Logging";
import { Action } from "Interfaces/Action";
import { TranslatePipe } from "../translate/translate.pipe";
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from "@angular/common";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import ActionHandler from "Combat/ActionHandler";
import { ConditionMonitorComponent } from "app/condition-monitor/condition-monitor.component";

let bt: BattleTrackerComponent;

@Component({
  selector: "app-battle-tracker",
  templateUrl: "./battle-tracker.component.html",
  styleUrls: ["./battle-tracker.component.css"],
  imports: [
    TranslatePipe,
    NgxSliderModule,
    NgbNavModule,
    NgbDropdownModule,
    FormsModule,
    CommonModule,
    DragDropModule,
    ConditionMonitorComponent
  ]
})
export class BattleTrackerComponent extends Undoable implements OnInit {
  combatManager = CombatManager
  indexToSelect = -1;
  logHandler = LogHandler;
  changeDetector: ChangeDetectorRef;
  actionHandler = ActionHandler

  get currentBTTime(): BTTime {
    return new BTTime(this.combatManager.combatTurn, this.combatManager.initiativePass, this.combatManager.currentInitiative);
  }

  private _selectedActor: IParticipant | null = null

  get selectedActor(): IParticipant | null {
    return this._selectedActor;
  }

  set selectedActor(val: IParticipant | null) {
    this.Set("selectedActor", val);
  }

  constructor(private ref: ChangeDetectorRef, private modalService: NgbModal) {
    super();
    this.addParticipant();
    this.changeDetector = ref;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (!this.combatManager.started) {
      moveItemInArray(this.combatManager.participants.items, event.previousIndex, event.currentIndex);
      for (let i = 0; i < this.combatManager.participants.count; i++) {
        this.combatManager.participants.items[i].sortOrder = i;
      }
    }
  }

  ngOnInit() {
    UndoHandler.Initialize();
    UndoHandler.StartActions();
  }

  selectActor(p: IParticipant) {
    this.selectedActor = p;
  }

  sort() {
    if (!this.combatManager.started) {
      this.combatManager.participants.sortBySortOrder();
    }
    else {
      this.combatManager.participants.sortByInitiative()
    }
  }

  /// Style Handler
  getParticipantStyles(p: IParticipant) {
    const styles = {
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

    // This is necessary due to a bug in production mode
    return Utility.ConvertStyleObjectToString(styles);
  }

  /// Button Handler
  btnAddParticipant_Click() {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "AddParticipant_Click");
    this.addParticipant()
  }

  btnEdge_Click(sender: IParticipant) {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Edge_Click");
    sender.seizeInitiative();
  }

  btnRollInitiative_Click(sender: IParticipant) {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " RollInitiative_Click");
    sender.rollInitiative();
  }

  btnAct_Click(sender: IParticipant) {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Act_Click");
    this.combatManager.act(sender);
    this.sort();
  }

  btnDelay_Click(sender: IParticipant) {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Delay_Click");
    sender.status = StatusEnum.Delaying;
    if (this.combatManager.currentActors.remove(sender)) {
      if (this.combatManager.currentActors.count === 0) {
        this.combatManager.goToNextActors();
      }
    }
  }

  btnStartRound_Click() {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "StartRound_Click");
    if (this.combatManager.participants.items.some(p => p.diceIni <= 0)) {
      // Confirm?
      this.combatManager.participants.items.filter(p => p.diceIni <= 0).forEach(p => p.rollInitiative())
    }

    this.combatManager.startRound();
    this.sort();
  }

  btnNextPass_Click() {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "NextPass_Click");
    this.combatManager.nextIniPass();
    this.combatManager.goToNextActors();
    this.sort();
  }

  btnDelete_Click(sender: IParticipant) {
    LogHandler.log(this.currentBTTime, sender.name + " Delete_Click");
    if (sender.name !== "") {
      if (!confirm("Are you sure you want to remove " + sender.name + "?")) {
        LogHandler.log(this.currentBTTime, sender.name + " Delete_Cancel");
        return;
      }
    }
    LogHandler.log(this.currentBTTime, sender.name + " Delete_Confirm");
    UndoHandler.StartActions();
    this.combatManager.removeParticipant(sender);
  }

  btnDuplicate_Click(sender: IParticipant) {
    LogHandler.log(this.currentBTTime, sender.name + " Duplicate_Click");
    UndoHandler.StartActions();
    this.combatManager.copyParticipant(sender);
  }

  btnReset_Click() {
    LogHandler.log(this.currentBTTime, "Reset_Click");
    if (!confirm("Are you sure you want to end combat?")) {
      LogHandler.log(this.currentBTTime, "Reset_Cancel");
      return;
    }
    LogHandler.log(this.currentBTTime, "Reset_Confirm");
    UndoHandler.StartActions();
    this.combatManager.endCombat();
    this.sort()
  }

  btnLeaveCombat_Click(sender: IParticipant) {
    LogHandler.log(this.currentBTTime, sender.name + " LeaveCombat_Click");
    UndoHandler.StartActions();
    sender.leaveCombat();
    if (this.combatManager.currentActors.contains(sender)) {
      // Remove sender from active Actors
      this.combatManager.act(sender);
    }
  }

  btnEnterCombat_Click(sender: IParticipant) {
    LogHandler.log(this.currentBTTime, sender.name + " EnterCombat_Click");
    UndoHandler.StartActions();
    sender.enterCombat();
  }

  btnAction_Click(p: IParticipant, action: Action) {
    if (!p.canUseAction(action)) {
      return;
    }
    LogHandler.log(this.currentBTTime, p.name + " Action_Click: " + action.key);
    UndoHandler.StartActions();
    p.doAction(action);
  }

  btnCustomAction_Click(p: IParticipant, inputElem: HTMLInputElement) {
    if (!this.canUseCustomInterrupt(p, inputElem)) {
      return;
    }
    LogHandler.log(this.currentBTTime, p.name + " CustomAction_Click: " + inputElem.value);
    UndoHandler.StartActions();
    const action: Action = {
      iniMod: Number(inputElem.value),
      edge: false,
      key: "custom",
      martialArt: false,
      persist: false
    };
    p.doAction(action);
    inputElem.value = "-5";
  }

  canUseCustomInterrupt(p: IParticipant, inputElem: HTMLInputElement) {
    return (Number(inputElem.value) * -1) <= p.getCurrentInitiative();
  }

  isUndoDisabled() {
    return !UndoHandler.hasPast();
  }

  isRedoDisabled() {
    return !UndoHandler.hasFuture();
  }

  btnUndo_Click() {
    LogHandler.log(this.currentBTTime, "Undo_Click");
    UndoHandler.Undo();
  }

  btnRedo_Click() {
    LogHandler.log(this.currentBTTime, "Redo_Click");
    UndoHandler.Redo();
  }

  inpName_KeyDown(e: KeyboardEvent) {
    const keyCode = e.code

    if (keyCode === "Tab" && !e.shiftKey) // Tab key
    {
      e.preventDefault();

      const row = this.closestByClass(e.target as HTMLElement, "participant");
      if (!row) return;

      const nextRow = row.nextElementSibling as HTMLElement;
      if (nextRow) {
        const field = nextRow.querySelector("input") as HTMLInputElement;
        if (field) {
          field.select();
          nextRow.click();
          return;
        }
      }

      LogHandler.log(this.currentBTTime, "TabAddParticipant");
      UndoHandler.StartActions();
      this.addParticipant();

      const index = row.getAttribute("data-indexnr");
      this.indexToSelect = index !== null ? 1 + Number(index) : -1;
    }
    else if (keyCode === "Tab" && e.shiftKey) // Shift + Tab
    {
      e.preventDefault();

      const row = this.closestByClass(e.target as HTMLElement, "participant");
      if (!row) return;

      const prevRow = row.previousElementSibling as HTMLElement;
      if (prevRow) {
        const field = prevRow.querySelector("input") as HTMLInputElement;
        if (field) {
          field.select();
          prevRow.click();
          return;
        }
      }
    }
  }

  inpDiceIni_KeyDown(e: KeyboardEvent) {
    const keyCode = e.code;

    if (keyCode === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      const nextRow = row?.nextElementSibling as HTMLElement | null;
      if (nextRow != null) {
        const field: HTMLInputElement = nextRow.querySelectorAll(".inpDiceIni")[0] as HTMLInputElement;
        if (field) {
          field.select();
          nextRow.click()
          return;
        }
      }
    } else if (keyCode === "Tab" && e.shiftKey) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      const prevRow = row?.previousElementSibling as HTMLElement | null;
      if (prevRow != null) {
        const field: HTMLInputElement = prevRow.querySelectorAll(".inpDiceIni")[0] as HTMLInputElement;
        if (field) {
          field.select();
          prevRow.click()
          return;
        }
      }
    }
  }

  inpBaseIni_KeyDown(e: KeyboardEvent) {
    const keyCode = e.code;
    const shift = e.shiftKey;

    if (keyCode === "Tab" && !shift) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      const nextRow = row?.nextElementSibling as HTMLElement | null;
      if (nextRow != null) {
        const field: HTMLInputElement = nextRow.querySelectorAll(".inpBaseIni")[0] as HTMLInputElement;
        if (field) {
          field.select();
          nextRow.click()
          return;
        }
      }
    } else if (keyCode === "Tab" && shift) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      const prevRow = row?.previousElementSibling as HTMLElement | null;
      if (prevRow != null) {
        const field: HTMLInputElement = prevRow.querySelectorAll(".inpBaseIni")[0] as HTMLInputElement;
        if (field) {
          field.select();
          prevRow.click();
          return;
        }
      }
    }
  }

  ngReady() {
    const row = document.getElementById("participant" + this.indexToSelect);
    if (row) {
      const field: HTMLInputElement = row.querySelectorAll("input")[0] as HTMLInputElement;
      if (field) {
        this.indexToSelect = -1;
        field.select();
        row.click();
      }
      this.changeDetector.detectChanges();
    }
  }

  // Focus Handler
  inp_Focus(e: Event) {
    if (e.target instanceof HTMLInputElement)
      e.target.select();
  }

  iniChange(e: Event, p: IParticipant) {
    if (p.diceIni < 0) {
      e.preventDefault();
      p.diceIni = 0;
      const target = e.target as HTMLInputElement
      target.value = '0';
    }
  }

  onChange(e: Event) {
    console.log(e);
  }

  addParticipant(selectNewParticipant = true) {
    const p = new Participant();
    this.combatManager.addParticipant(p);
    if (selectNewParticipant) {
      this.selectActor(p);
    }
  }

  // Helper to find the closest ancestor with a given class
  private closestByClass(el: HTMLElement, className: string): HTMLElement | null {
    while (el && !el.classList.contains(className)) {
      if (el.parentElement != null) {
        el = el.parentElement;
      }
      else {
        return null
      }
    }
    return el;
  }
}
