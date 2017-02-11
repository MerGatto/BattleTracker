
$(document).ready(function () {
    console.log("ready!");
    addParticipant();
    syncTurnValues();
});

/// Button Handler
function btnAddParticipant_Click() {
    addParticipant();
}

function btnEdge_Click() {
    var actor = getParticipant(this);
    actor.seizeInitiative();
}

function btnAct_Click() {
    var actor = getParticipant(this);
    act(actor);
}

function btnWait_Click() {
    var actor = getParticipant(this);
    actor.setStatus(StatusEnum.Waiting);
    var i = currentActors.indexOf(actor)
    currentActors.splice(i, 1);
    if (currentActors.length == 0) {
        goToNextActors();
    }
}

function btnStartRound_Click() {
    started = true;
    $('.battletracker').toggleClass('started');
    goToNextActors();
}

function btnNextInitiativePass_Click() {    
    nextIniTurn();
    goToNextActors();  
    $(this).hide(); 
}

function btnDelete_Click() {
    var name = $(getRow(this)).find('.inpName')[0].value;
    if (name != "") {
        if (!confirm("Are you sure you want to remove " + name + "?")) {
            return;
        }
    }
    removeParticipant(getParticipant(this));
}

function btnReset_Click() {
    if (!confirm("Are you sure you want to reset the BattleTracker?")) {
        return;
    }
    combatTurn = 1;
    if (started) {
        started = false;
    }
    initiativeTurn = 1;
    $.each(participants, function () {
        this.hardReset();
    });
    syncTurnValues();
}

function btnDie_Click() {
    var actor = getParticipant(this)
    actor.die();
    var row = getRow(this);
    var i = currentActors.indexOf(actor)
    if (i != -1) {
        act(actor);
    }
}

function btnRevive_Click() {
    getParticipant(this).revive();
    var row = getRow(this);
}
