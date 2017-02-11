import { Participant } from "./Participant"
import { StatusEnum } from "./StatusEnum"
import { $ } from "jquery" 

var participants: Participant[] = new Array<Participant>()
var started = false;

var combatTurn = 1
var initiativeTurn = 1
var currentActors = new Array()

function nextIniTurn() {
    initiativeTurn++;
    $.each(participants, function () {
        if (!this.dead) {
            this.setStatus(StatusEnum.Idle);
        }
        this.calculateInitiative();
    });
}

function endCombatTurn() {
    initiativeTurn = 1;
    combatTurn++;
    $.each(participants, function () {
        this.softReset();
    });
    this.started = false;
}

function endInitiativePass() {
    if (isOver()) {
        endCombatTurn();
        return;
    } 
}

function isOver() {
    var over = true;
    $.each(participants, function () {
        if (this.ini > 0 && !this.dead) {
            over = false;
        }
    });
    return over;
}

function getNextParticipants() {
    var nextParticipants = new Array();
    var max = 0;
    var i = 0;
    var edge = false;
    var over = true;
    $.each(participants, function () {
        if (!this.dead && this.status == StatusEnum.Idle && this.baseIni > 0 && this.ini > 0) {
            if (this.ini > max && (this.edge || !edge) || this.edge && !edge) {
                nextParticipants = [];
                nextParticipants.push(this);
                max = this.ini;
                edge = this.edge;
            }
            else if (this.ini == max && edge == this.edge) {
                nextParticipants.push(this);
            }
        }
    });
    return nextParticipants;
}

function addParticipant() {
    var p = new Participant();
    participants.push(p)
}

function removeParticipant(participant) {
    var i = participants.indexOf(participant)
    participants.splice(i, 1);
}

function goToNextActors() {
    if (currentActors.length > 0) {
        $.each(currentActors, function () {
            this.setStatus(StatusEnum.Finished);
        });
    }
    currentActors = [];
    currentActors = getNextParticipants();
    if (currentActors.length > 0) {
        $.each(currentActors, function () {
            this.setStatus(StatusEnum.Active);
        });
    }
    else {
        endInitiativePass();
    }
}

function act(actor) {
    actor.setStatus(StatusEnum.Finished);
    var i = currentActors.indexOf(actor)
    if (i != -1) {
        currentActors.splice(i, 1);
        if (currentActors.length == 0) {
            goToNextActors();
        }
    }
}
