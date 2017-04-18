import { Component, OnInit } from '@angular/core'

import { Participant } from "../../classes/Participant"
import { ParticipantList } from "../../classes/ParticipantList"
import {Action} from "../../Interfaces/Action"
import { StatusEnum } from "../../classes/StatusEnum"
import * as Utility from "../../utility"
import {UndoHandler} from "../../classes/UndoHandler" 

var bt: any
            
//Debug stuff
(<any>window).btdump = function btdump() {
    console.log("===========")
    console.log("bt: ")
    console.log(bt)    
    console.log("===========")
}

@Component({
    selector: 'app-battle-tracker',
    templateUrl: './battle-tracker.component.html',
    styleUrls: ['./battle-tracker.component.css']
})
export class BattleTrackerComponent implements OnInit {

    participants: ParticipantList
    currentActors: ParticipantList
    indexToSelect: number = -1

    private _started: boolean
    get started(): boolean {
        return this._started
    }
    set started(val: boolean) {
        UndoHandler.HandleProperty(this, "started", val)
    }

    private _passEnded: boolean
    get passEnded(): boolean {
        return this._passEnded
    }
    set passEnded(val: boolean) {
        UndoHandler.HandleProperty(this, "passEnded", val)
    }

    private _combatTurn: number
    get combatTurn(): number {
        return this._combatTurn
    }
    set combatTurn(val: number) {
        UndoHandler.HandleProperty(this, "combatTurn", val)
    }

    private _initiativeTurn: number
    get initiativeTurn(): number {
        return this._initiativeTurn
    }
    set initiativeTurn(val: number) {
        UndoHandler.HandleProperty(this, "initiativeTurn", val)
    }

    private _selectedActor: Participant
    get selectedActor(): Participant {
        return this._selectedActor
    }
    set selectedActor(val: Participant) {
        UndoHandler.HandleProperty(this, "selectedActor", val)
    }

    constructor() {
        this.initialize()
        this.addParticipant()
        this.selectedActor = this.participants.items[0]
        bt = this
    }

    ngOnInit() {   
        UndoHandler.Inizialize()
        UndoHandler.StartActions()
    }

    initialize() {
        this.participants = new ParticipantList()
        this.currentActors = new ParticipantList()

        this.started = false
        this.passEnded = false
        this.combatTurn = 1
        this.initiativeTurn = 1
    }

    nextIniPass() {
        this.passEnded = false
        this.initiativeTurn++
        for (let p of this.participants.items) {
            if (!p.ooc && p.status != StatusEnum.Delaying) {
                p.status = StatusEnum.Waiting
            }
        }
    }

    endCombatTurn() {
        this.initiativeTurn = 1
        this.combatTurn++
        for (let p of this.participants.items) {
            p.softReset()
        }
        this.started = false
    }

    endInitiativePass() {
        this.passEnded = true
        if (this.isOver()) {
            this.endCombatTurn()
            return
        }
    }

    isOver() {
        var over = true
        for (let p of this.participants.items) {
            if (this.getInitiative(p) > 0 && !p.ooc) {
                over = false
            }
        }
        return over
    }

    getNextActors() {
        this.currentActors.clear()
        var max = 0
        var i = 0
        var edge = false
        var over = true
        for (let p of this.participants.items) {
            let effIni = this.getInitiative(p)
            if (!p.ooc && p.status == StatusEnum.Waiting && p.diceIni > 0 && effIni > 0) {
                if (effIni > max && (p.edge || !edge) || p.edge && !edge) {
                    this.currentActors.clear()
                    this.currentActors.insert(p)
                    max = effIni
                    edge = p.edge
                }
                else if (effIni == max && edge == p.edge) {
                    this.currentActors.insert(p)
                }
            }
        }
    }

    getInitiative(p: Participant): number {
        return p.calculateInitiative(this.initiativeTurn)
    }

    seizeInitiative(p: Participant) {
        p.seizeInitiative()
    }

    addParticipant() {
        var p = new Participant()
        this.participants.insert(p)
        this.selectedActor = p
    }

    selectActor(p: Participant) {
        this.selectedActor = p;
    }

    removeParticipant(participant) {
        this.participants.remove(participant)
    }

    goToNextActors() {
        if (this.currentActors.count > 0) {
            for (let a of this.currentActors.items) {
                a.status = StatusEnum.Finished
            }
        }
        this.getNextActors()
        if (this.currentActors.count > 0) {
            for (let a of this.currentActors.items) {
                a.status = StatusEnum.Active
            }
        }
        else {
            this.endInitiativePass()
        }
    }

    act(actor: Participant) {
        actor.status = StatusEnum.Finished
        if (this.currentActors.remove(actor)) {
            if (this.currentActors.count == 0) {
                this.goToNextActors()
            }
        }
    }

    /// Style Handler
    getParticipantStyles(p: Participant) {
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
        }
        return styles
    }

    /// Button Handler
    btnAddParticipant_Click() {
        UndoHandler.StartActions()
        this.addParticipant()
    }

    btnEdge_Click(sender: Participant) {
        UndoHandler.StartActions()
        sender.seizeInitiative()
    }

    btnRollInitative_Click(sender: Participant) {
        UndoHandler.StartActions()
        sender.rollInitiative()
    }

    btnAct_Click(sender: Participant) {
        UndoHandler.StartActions()
        this.act(sender)
    }

    btnDelay_Click(sender: Participant) {
        UndoHandler.StartActions()
        sender.status = StatusEnum.Delaying
        if (this.currentActors.remove(sender)) {
            if (this.currentActors.count == 0) {
                this.goToNextActors()
            }
        }
    }

    btnStartRound_Click() {
        UndoHandler.StartActions()
        this.started = true
        this.passEnded = false
        this.goToNextActors()
    }

    btnNextPass_Click() {
        UndoHandler.StartActions()
        this.nextIniPass()
        this.goToNextActors()
    }

    btnDelete_Click(sender: Participant) {
        if (sender.name != "") {
            if (!confirm("Are you sure you want to remove " + sender.name + "?")) {
                return
            }
        }
        UndoHandler.StartActions()
        this.removeParticipant(sender)
    }

    btnReset_Click() {
        if (!confirm("Are you sure you want to reset the BattleTracker?")) {
            return
        }
        UndoHandler.StartActions()
        this.combatTurn = 1
        this.currentActors.clear()
        if (this.started) {
            this.started = false
        }
        this.initiativeTurn = 1
        for (let p of this.participants.items){
            p.hardReset()
        }
    }

    btnLeaveCombat_Click(sender: Participant) {
        UndoHandler.StartActions()
        sender.leaveCombat()
        if (this.currentActors.contains(sender)) {
            // Remove sender from active Actors
            this.act(sender)
        }
    }

    btnEnterCombat_Click(sender: Participant) {
        UndoHandler.StartActions()
        sender.enterCombat()
    }

    actnBtn_Click(p?: Participant, action?: Action) {
        UndoHandler.StartActions()
        if (action && p) {
            p.actions.doAction(this.getInitiative(p), action)
        }
    }

    btnUndo_Click() {
        UndoHandler.Undo()
    }

    btnRedo_Click() {
        UndoHandler.Redo()
    }

    inpName_KeyDown(e) {       
        var keyCode = e.keyCode || e.which

        if (keyCode == 9) {
            e.preventDefault()
            var currentIndex: number = Utility.getDataIndex(e.target)
            var row = Utility.getRow(e.target)
            var nextRow = $(row).next()[0]
            if (nextRow != undefined) 
            { 
                var field:any = $(nextRow).find('.input-md')[0]
                if(field) {
                    field.select()
                    $(nextRow).click();
                    return
                }
            }
            UndoHandler.StartActions() 
            this.addParticipant()
            this.indexToSelect = currentIndex + 1
        }
    }

    inpIni_KeyDown(e) {    
        var keyCode = e.keyCode || e.which

        if (keyCode == 9) {
            e.preventDefault()
            var row = Utility.getRow(e.target)
            var nextRow = $(row).next()[0]
            if (nextRow != undefined) 
            { 
                var field:any = $(nextRow).find('.inpIni')[0]
                if(field) {
                    field.select()
                    $(nextRow).click();
                    return
                }
            }            
        }
    }

    selectIndex(i: Number) {
        if (i == this.indexToSelect) {
            var row = Utility.getRowForIndex(i)
            if (row != undefined) 
            { 
                var field:any = $(row).find('.input-md')[0]
                if(field) {
                    field.select()
                    this.indexToSelect = -1
                }
            }    

        }
        return i
    }

    //Focus Handler
    inp_Focus(e) { 
        e.target.select()
    }

    iniChange(e, p:Participant) {
        if (p.diceIni < 0) {
            e.preventDefault()
            p.diceIni = 0
            e.target.value = 0
        }
    }

    onChange(e) {
        console.log(e)
    }
}
