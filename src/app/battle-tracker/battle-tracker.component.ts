import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, QueryList, ViewChildren } from "@angular/core";
import { NgbModal, NgbDropdown } from "@ng-bootstrap/ng-bootstrap";
import { Undoable, UndoHandler, Utility } from "Common";
import { CombatManager, StatusEnum, BTTime } from "Combat";
import { Participant } from "Combat/Participants/Participant";
import { LogHandler } from "Logging";
import { Action } from "Interfaces/Action";

let bt: any;

// Debug stuff
(<any>window).btdump = function btdump() {
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
export class BattleTrackerComponent extends Undoable implements OnInit {
  combatManager: CombatManager;
  indexToSelect: number = -1;
  logHandler = LogHandler;
  changeDetector: ChangeDetectorRef;

  @ViewChildren(NgbDropdown) interruptDropdowns: QueryList<NgbDropdown>;
  private _sortByInitiative: boolean;

  get sortByInitiative(): boolean {
    return this._sortByInitiative;
  }

  get currentBTTime(): BTTime {
    return new BTTime(this.combatManager.combatTurn, this.combatManager.initiativePass, this.combatManager.currentInitiative);
  }

  set sortByInitiative(val: boolean) {
    this.Set("sortByInitiative", val);
    UndoHandler.DoAction(() => this.sort(), () => this.sort());
  }

  private _selectedActor: Participant;

  get selectedActor(): Participant {
    return this._selectedActor;
  }

  set selectedActor(val: Participant) {
    this.Set("selectedActor", val);
  }

  constructor(private ref: ChangeDetectorRef, private modalService: NgbModal) {
    super();
    this.initialize();
    this.addParticipant();
    bt = this;
    this.changeDetector = ref;
  }

  onSortUpdate(event: any) {
    if (!this.sortByInitiative) {
      for (let i = 0; i < this.combatManager.participants.count; i++) {
        this.combatManager.participants.items[i].sortOrder = i;
      }
    }
  }

  ngOnInit() {
    UndoHandler.Initialize();
    UndoHandler.StartActions();
    LogHandler.Initialize();
  }

  initialize() {
    this.combatManager = CombatManager.getInstance();
    this.sortByInitiative = true;
  }

  selectActor(p: Participant) {
    this.selectedActor = p;
  }

  sort() {
    if (!this.combatManager.passEnded) {
      if (this.sortByInitiative) {
        this.combatManager.participants.sortByInitiative();
      } else {
        this.combatManager.participants.sortBySortOrder();
      }
    }
  }

  /// Style Handler
  getParticipantStyles(p: Participant) {
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

    // This is necessary due to a bug in production mode
    return Utility.ConvertStyleObjectToString(styles);
  }

  /// Button Handler
  btnAddParticipant_Click() {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, "AddParticipant_Click");
    this.addParticipant()
  }

  btnEdge_Click(sender: Participant) {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Edge_Click");
    sender.seizeInitiative();
  }

  btnRollInitiative_Click(sender: Participant) {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " RollInitiative_Click");
    sender.rollInitiative();
  }

  btnAct_Click(sender: Participant) {
    UndoHandler.StartActions();
    LogHandler.log(this.currentBTTime, sender.name + " Act_Click");
    this.combatManager.act(sender);
    this.sort();
  }

  btnDelay_Click(sender: Participant) {
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

  btnDelete_Click(sender: Participant) {
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

  btnDuplicate_Click(sender: Participant) {
    LogHandler.log(this.currentBTTime, sender.name + " Duplicate_Click");
    UndoHandler.StartActions();
    this.combatManager.copyParticipant(sender);
  }

  btnReset_Click() {
    LogHandler.log(this.currentBTTime, "Reset_Click");
    if (!confirm("Are you sure you want to reset the BattleTracker?")) {
      LogHandler.log(this.currentBTTime, "Reset_Cancel");
      return;
    }
    LogHandler.log(this.currentBTTime, "Reset_Confirm");
    UndoHandler.StartActions();
    this.combatManager.reset();
  }

  btnLeaveCombat_Click(sender: Participant) {
    LogHandler.log(this.currentBTTime, sender.name + " LeaveCombat_Click");
    UndoHandler.StartActions();
    sender.leaveCombat();
    if (this.combatManager.currentActors.contains(sender)) {
      // Remove sender from active Actors
      this.combatManager.act(sender);
    }
  }

  btnEnterCombat_Click(sender: Participant) {
    LogHandler.log(this.currentBTTime, sender.name + " EnterCombat_Click");
    UndoHandler.StartActions();
    sender.enterCombat();
  }

  btnAction_Click(p: Participant, action: Action, persistent: boolean, index: number) {
    if (!p.canUseAction(action)) {
      return;
    }
    LogHandler.log(this.currentBTTime, p.name + " Action_Click: " + action.key);
    UndoHandler.StartActions();
    if (!persistent) {
      p.actions.doAction(action);
    } else {
      if (!p.actions[action.key]) {
        p.actions[action.key] = !p.actions[action.key];
      }
    }

    this.interruptDropdowns.toArray()[index].close();
  }

  btnCustomAction_Click(p: Participant, inputElem: HTMLInputElement, index: number) {
    if (!this.canUseCustomInterrupt(p, inputElem)) {
      return;
    }
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

    this.interruptDropdowns.toArray()[index].close();
  }

  canUseCustomInterrupt(p: Participant, inputElem: HTMLInputElement) {
    return (Number(inputElem.value) * -1) <= p.getCurrentInitiative();
  }

  btnUndo_Click() {
    LogHandler.log(this.currentBTTime, "Undo_Click");
    UndoHandler.Undo();
  }

  btnRedo_Click() {
    LogHandler.log(this.currentBTTime, "Redo_Click");
    UndoHandler.Redo();
  }

  btnAddReminder_Click(content) {
    this.modalService.open(content);
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
    let keyCode = e.code;

    if (keyCode === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      let nextRow = row.nextElementSibling as HTMLElement;
      if (nextRow !== undefined) {
        let field: HTMLInputElement = nextRow.querySelectorAll(".inpDiceIni")[0] as HTMLInputElement;
        if (field) {
          field.select();
          nextRow.click
          return;
        }
      }
    } else if (keyCode === "Tab" && e.shiftKey) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      const prevRow = row.previousElementSibling as HTMLElement;
      if (prevRow !== undefined) {
        let field: any = prevRow.querySelectorAll(".inpDiceIni")[0] as HTMLInputElement;
        if (field) {
          field.select();
          prevRow.click()
          return;
        }
      }
    }
  }

  inpBaseIni_KeyDown(e) {
    let keyCode = e.keyCode || e.which;
    let shift = e.shiftKey;

    if (keyCode === 9 && !shift) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      let nextRow = row.nextElementSibling as HTMLElement;
      if (nextRow !== undefined) {
        let field: HTMLInputElement = nextRow.querySelectorAll(".inpDiceIni")[0] as HTMLInputElement;
        if (field) {
          field.select();
          nextRow.click()
          return;
        }
      }
    } else if (keyCode === 9 && shift) {
      e.preventDefault();
      const row = this.closestByClass(e.target as HTMLElement, "participant");
      const prevRow = row.previousElementSibling as HTMLElement;
      if (prevRow !== undefined) {
        let field: any = prevRow.querySelectorAll(".inpBaseIni")[0];
        if (field) {
          field.select();
          prevRow.click();
          return;
        }
      }
    }
  }

  ngReady() {
    let row = document.getElementById("participant" + this.indexToSelect);
    if (row) {
      let field: any = row.querySelectorAll("input")[0];
      if (field) {
        this.indexToSelect = -1;
        field.select();
        row.click();
      }
      this.changeDetector.detectChanges();
    }
  }

  // Focus Handler
  inp_Focus(e) {
    e.target.select();
  }

  iniChange(e, p: Participant) {
    if (p.diceIni < 0) {
      e.preventDefault();
      p.diceIni = 0;
      e.target.value = 0;
    }
  }

  onChange(e) {
    console.log(e);
  }

  addParticipant(selectNewParticipant = true) {
    let p = new Participant();
    this.combatManager.addParticipant(p);
    if (selectNewParticipant) {
      this.selectActor(p);
    }
  }

  // Helper to find the closest ancestor with a given class
  private closestByClass(el: HTMLElement, className: string): HTMLElement | null {
    while (el && !el.classList.contains(className)) {
      el = el.parentElement;
    }
    return el;
  }
}
