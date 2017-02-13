import { Component, OnInit } from '@angular/core';

import { Participant } from "../../classes/Participant"
import { StatusEnum } from "../../classes/StatusEnum"
import * as Utility from "../../utility"
import {PropertyHandler} from "../../classes/PropertyHandler" 

class ParticipantList {

    private _list: Array<Participant>
    get items(): Participant[] {
        return this._list
    }

    constructor() {
        this._list = new Array<Participant>()
    }

    insert(p: Participant, log: boolean = true) {
        if (log) {
            PropertyHandler.DoAction(() => this.insert(p, false), () => this.remove(p, false))
        }
        else 
        {
            this.items.push(p)
        }
    }

    insertAt(p: Participant, i: number, log: boolean = true) {
        if (log) {
            PropertyHandler.DoAction(() => this.insertAt(p, i, false), () => this.remove(p, false))
        }
        else 
        {
            this.items.splice(i, 0, p)
        }
    }

    remove(p: Participant, log: boolean = true): boolean {
        var i = this.items.indexOf(p)
        if (i != -1) {
            if (log) {
                PropertyHandler.DoAction(() => this.remove(p, false), () => this.insertAt(p, i, false))
            }
            else {
                this.items.splice(i, 1)
            }
            return true
        }
        return false
    }

    clear(log: boolean = true) {
        if (log) {
            var items = this.items
            PropertyHandler.DoAction(() => this.clear(false), () => { this._list = items})
        }
        else {
            this._list = []
        }
    }

    contains(p: Participant, log: boolean = true): boolean {
        return this.items.indexOf(p) != -1
    }
    
    get count(): number {
        return this.items.length
    }

}

@Component({
    selector: 'app-battle-tracker',
    templateUrl: './battle-tracker.component.html',
    styleUrls: ['./battle-tracker.component.css']
})
export class BattleTrackerComponent implements OnInit {

    participants: ParticipantList
    // get participants(): Participant[] {
    //     return this._participants
    // }
    // set participants(val: Participant[]) {
    //     PropertyHandler.handleProperty(this, "participants", val)
    // }

    currentActors: ParticipantList
    // get currentActors(): Participant[] {
    //     return this._participants
    // }
    // set currentActors(val: Participant[]) {
    //     PropertyHandler.handleProperty(this, "currentActors", val)
    // }
    
    private _started: boolean
    get started(): boolean {
        return this._started
    }
    set started(val: boolean) {
        PropertyHandler.handleProperty(this, "started", val)
    }

    private _passEnded: boolean
    get passEnded(): boolean {
        return this._passEnded
    }
    set passEnded(val: boolean) {
        PropertyHandler.handleProperty(this, "passEnded", val)
    }

    private _combatTurn: number
    get combatTurn(): number {
        return this._combatTurn
    }
    set combatTurn(val: number) {
        PropertyHandler.handleProperty(this, "combatTurn", val)
    }

    private _initiativeTurn: number
    get initiativeTurn(): number {
        return this._initiativeTurn
    }
    set initiativeTurn(val: number) {
        PropertyHandler.handleProperty(this, "initiativeTurn", val)
    }

    constructor() {
        this.initialize()
        this.addParticipant()
    }

    ngOnInit() {   
        PropertyHandler.inizialize()
        PropertyHandler.StartActions()
    }

    initialize() {
        // this.participants = new Array<Participant>()
        // this.currentActors = new Array<Participant>()
        this.participants = new ParticipantList()
        this.currentActors = new ParticipantList()

        this.started = false
        this.passEnded = false
        this.combatTurn = 1
        this.initiativeTurn = 1
    }

    nextIniPass() {
        this.passEnded = false
        this.initiativeTurn++;
        for (let p of this.participants.items) {
            if (!p.ooc) {
                p.status = StatusEnum.Waiting
            }
        }
    }

    endCombatTurn() {
        this.initiativeTurn = 1;
        this.combatTurn++;
        for (let p of this.participants.items) {
            p.softReset();
        }
        this.started = false;
    }

    endInitiativePass() {
        this.passEnded = true;
        if (this.isOver()) {
            this.endCombatTurn();
            return;
        }
    }

    isOver() {
        var over = true;
        for (let p of this.participants.items) {
            if (this.getInitiative(p) > 0 && !p.ooc) {
                over = false;
            }
        }
        return over;
    }

    getNextActors() {
        this.currentActors.clear()
        var max = 0;
        var i = 0;
        var edge = false;
        var over = true;
        for (let p of this.participants.items) {
            let effIni = this.getInitiative(p)
            if (!p.ooc && p.status == StatusEnum.Waiting && p.ini > 0 && effIni > 0) {
                if (effIni > max && (p.edge || !edge) || p.edge && !edge) {
                    this.currentActors.clear()
                    this.currentActors.insert(p);
                    max = effIni;
                    edge = p.edge;
                }
                else if (effIni == max && edge == p.edge) {
                    this.currentActors.insert(p);
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
        var p = new Participant();
        this.participants.insert(p)
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
        this.getNextActors();
        if (this.currentActors.count > 0) {
            for (let a of this.currentActors.items) {
                a.status = StatusEnum.Active
            }
        }
        else {
            this.endInitiativePass();
        }
    }

    act(actor: Participant) {
        actor.status = StatusEnum.Finished;
        if (this.currentActors.remove(actor)) {
            if (this.currentActors.count == 0) {
                this.goToNextActors();
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
            'noIni': p.ini == 0,
            'negativeIni': this.getInitiative(p) <= 0 && this.started,
            'finished': p.status == StatusEnum.Finished,
            'edged': p.edge
        }
        return styles;
    }

    /// Button Handler
    btnAddParticipant_Click() {
        PropertyHandler.StartActions()
        this.addParticipant();
    }

    btnEdge_Click(sender: Participant) {
        PropertyHandler.StartActions()
        sender.seizeInitiative();
    }

    btnAct_Click(sender: Participant) {
        PropertyHandler.StartActions()
        this.act(sender);
    }

    btnDelay_Click(sender: Participant) {
        PropertyHandler.StartActions()
        sender.status = StatusEnum.Delaying;
        if (this.currentActors.remove(sender)) {
            if (this.currentActors.count == 0) {
                this.goToNextActors();
            }
        }
    }

    btnStartRound_Click() {
        PropertyHandler.StartActions()
        this.started = true;
        this.goToNextActors();
    }

    btnNextPass_Click() {
        PropertyHandler.StartActions()
        this.nextIniPass();
        this.goToNextActors();
    }

    btnDelete_Click(sender: Participant) {
        if (sender.name != "") {
            if (!confirm("Are you sure you want to remove " + sender.name + "?")) {
                return;
            }
        }
        PropertyHandler.StartActions()
        this.removeParticipant(sender);
    }

    btnReset_Click() {
        if (!confirm("Are you sure you want to reset the BattleTracker?")) {
            return;
        }
        PropertyHandler.StartActions()
        this.combatTurn = 1;
        this.currentActors.clear()
        if (this.started) {
            this.started = false;
        }
        this.initiativeTurn = 1;
        for (let p of this.participants.items){
            p.hardReset();
        }
    }

    btnLeaveCombat_Click(sender: Participant) {
        PropertyHandler.StartActions()
        sender.leaveCombat();
        if (this.currentActors.contains(sender)) {
            // Remove sender from active Actors
            this.act(sender);
        }
    }

    btnEnterCombat_Click(sender: Participant) {
        PropertyHandler.StartActions()
        sender.enterCombat();
    }

    btnUndo_Click() {
        PropertyHandler.Undo()
    }

    btnRedo_Click() {
        PropertyHandler.Redo()
    }

    inpName_KeyDown(e) {       
        var keyCode = e.keyCode || e.which;

        if (keyCode == 9) {
            e.preventDefault();
            var row = Utility.getRow(e.target);
            var nextRow = $(row).next()[0];
            if (nextRow != undefined) 
            { 
                var field:any = $(nextRow).find('.input-md')[0]
                if(field) {
                    field.select()
                    return
                }
            }
            PropertyHandler.StartActions() 
            this.addParticipant();
        }
    }

    inpIni_KeyDown(e) {    
        var keyCode = e.keyCode || e.which;

        if (keyCode == 9) {
            e.preventDefault();
            var row = Utility.getRow(e.target);
            var nextRow = $(row).next()[0];
            if (nextRow != undefined) 
            { 
                var field:any = $(nextRow).find('.inpIni')[0]
                if(field) {
                    field.select()
                    return
                }
            }            
        }
    }

    //Focus Handler
    inp_Focus(e) { 
        e.target.select()
    }

    wmChange(e, p:Participant) {
        if (p.wm < 0) {
            e.preventDefault()
            p.wm = 0
            e.target.value = 0
        }
    }

    iniChange(e, p:Participant) {
        if (p.ini < 0) {
            e.preventDefault()
            p.ini = 0
            e.target.value = 0
        }
    }

    onChange(e) {
        console.log(e)
    }
}