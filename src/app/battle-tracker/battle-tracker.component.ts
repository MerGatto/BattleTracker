import { Component, OnInit } from '@angular/core';
import { Participant } from "../../classes/Participant"
import { StatusEnum } from "../../classes/StatusEnum"
import * as Utility from "../../utility"

@Component({
    selector: 'app-battle-tracker',
    templateUrl: './battle-tracker.component.html',
    styleUrls: ['./battle-tracker.component.css']
})
export class BattleTrackerComponent implements OnInit {

    participants: Participant[]
    started: boolean
    passEnded: boolean
    combatTurn: number
    initiativeTurn: number
    currentActors: Participant[]
    statusEnum = StatusEnum

    constructor() {
        this.initialize()
        this.addParticipant()
    }

    ngOnInit() {
    }

    initialize() {
        this.participants = new Array<Participant>()
        this.started = false
        this.passEnded = false
        this.combatTurn = 1
        this.initiativeTurn = 1
        this.currentActors = new Array<Participant>()
    }

    nextIniPass() {
        this.passEnded = false
        this.initiativeTurn++;
        for (let p of this.participants) {
            if (!p.ooc) {
                p.setStatus(StatusEnum.Waiting);
            }
        }
    }

    endCombatTurn() {
        this.initiativeTurn = 1;
        this.combatTurn++;
        for (let p of this.participants) {
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
        for (let p of this.participants) {
            if (this.getInitiative(p) > 0 && !p.ooc) {
                over = false;
            }
        }
        return over;
    }

    getNextParticipants() {
        var nextParticipants: Participant[] = new Array<Participant>();
        var max = 0;
        var i = 0;
        var edge = false;
        var over = true;
        for (let p of this.participants) {
            let effIni = this.getInitiative(p)
            if (!p.ooc && p.status == StatusEnum.Waiting && p.ini > 0 && effIni > 0) {
                if (effIni > max && (p.edge || !edge) || p.edge && !edge) {
                    nextParticipants = [];
                    nextParticipants.push(p);
                    max = effIni;
                    edge = p.edge;
                }
                else if (effIni == max && edge == p.edge) {
                    nextParticipants.push(p);
                }
            }
        }
        return nextParticipants;
    }

    getInitiative(p: Participant): number {
        return p.calculateInitiative(this.initiativeTurn)
    }

    seizeInitiative(p: Participant) {
        p.seizeInitiative()
    }

    addParticipant() {
        var p = new Participant();
        this.participants.push(p)
    }

    removeParticipant(participant) {
        var i = this.participants.indexOf(participant)
        this.participants.splice(i, 1);
    }

    goToNextActors() {
        if (this.currentActors.length > 0) {
            for (let a of this.currentActors) {
                a.setStatus(StatusEnum.Finished);
            }
        }
        this.currentActors = [];
        this.currentActors = this.getNextParticipants();
        if (this.currentActors.length > 0) {
            for (let a of this.currentActors) {
                a.setStatus(StatusEnum.Active);
            }
        }
        else {
            this.endInitiativePass();
        }
    }

    act(actor: Participant) {
        actor.setStatus(StatusEnum.Finished);
        var i = this.currentActors.indexOf(actor)
        if (i != -1) {
            this.currentActors.splice(i, 1);
            if (this.currentActors.length == 0) {
                this.goToNextActors();
            }
        }
    }

    /// Style Handler
    getParticipantStyles(p: Participant) {
        var styles = {
            'acting': this.currentActors.indexOf(p) != -1,
            'ooc': p.ooc,
            'delaying': p.status == StatusEnum.Delaying,
            'waiting': p.status == StatusEnum.Waiting,
            'noIni': p.ini == 0,
            'negIni': p.ini < 0,
            'finished': p.status == StatusEnum.Finished,
            'edged': p.edge
        }
        return styles;
    }

    /// Button Handler
    btnAddParticipant_Click() {
        this.addParticipant();
    }

    btnEdge_Click(sender: Participant) {
        sender.seizeInitiative();
    }

    btnAct_Click(sender: Participant) {
        this.act(sender);
    }

    btnDelay_Click(sender: Participant) {
        sender.setStatus(StatusEnum.Delaying);
        var i = this.currentActors.indexOf(sender)
        this.currentActors.splice(i, 1);
        if (this.currentActors.length == 0) {
            this.goToNextActors();
        }
    }

    btnStartRound_Click() {
        this.started = true;
        this.goToNextActors();
    }

    btnNextPass_Click() {
        this.nextIniPass();
        this.goToNextActors();
        $(this).hide();
    }

    btnDelete_Click(sender: Participant) {
        if (sender.name != "") {
            if (!confirm("Are you sure you want to remove " + sender.name + "?")) {
                return;
            }
        }
        this.removeParticipant(sender);
    }

    btnReset_Click() {
        if (!confirm("Are you sure you want to reset the BattleTracker?")) {
            return;
        }
        this.combatTurn = 1;
        this.currentActors = []
        if (this.started) {
            this.started = false;
        }
        this.initiativeTurn = 1;
        for (let p of this.participants){
            p.hardReset();
        }
    }

    btnLeaveCombat_Click(sender: Participant) {
        sender.leaveCombat();
        var i = this.currentActors.indexOf(sender)
        if (i != -1) {
            // Remove sender from active Actors
            this.act(sender);
        }
    }

    btnEnterCombat_Click(sender: Participant) {
        sender.enterCombat();
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
}
