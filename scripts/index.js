var newParticipantRow =
    '<td><input type="text" class="inpName"></td>' +
    '<td class="effIni"></td>' +
    '<td><input class="inpIni iniInput" type="number"></td>' +
    '<td><input class="vm iniInput" type="number"></td>' +
    '<td><input class="iniChange iniInput" type="number"></td>' +
    '<td><button class="btnAct">Act</button>' +
    '<button class="btnWait">Wait</button></td>' +
    '<td><input class="chkFullDefense"" type="checkbox"></td>' +
    '<td><button class="btnDie">Die</button>' +
    '<button class="btnRevive">Revive</button></td>' +
    '<td><button class="btnDelete">Delete</button></td>'

var participants = new Array();
var started = false;

var combatTurn = 1;
var initiativeTurn = 1;
var currentActors = new Array();;

$(document).ready(function () {
    console.log("ready!");
    addParticipant();    
    syncTurnValues();
});


function nextIniTurn() {
    initiativeTurn++;
    $.each(participants, function () {
        if (!this.dead) {
            this.setStatus(StatusEnum.Idle);
        }
            this.calculateInitiative();
    });
    syncTurnValues();
}

function endCombatTurn()
{
    initiativeTurn = 1;
    combatTurn++;
    $('#btnStart').toggle();
    $('.btnDelete').toggle();
    $.each(participants, function () {
        this.softReset();
    });
    this.started = false;
    syncTurnValues();
}

function getNextParticipants() {
    var nextParticipants = new Array();
    var max = 0;
    var i = 0;
    var over = true;
    $.each(participants, function () {
        if (this.ini > 0 && !this.dead) {
            over = false;
        }
        if (!this.dead && this.status == StatusEnum.Idle && this.baseIni > 0 && this.ini > 0) {
            if (this.ini > max) {
                nextParticipants = [];
                nextParticipants.push(this);
                max = this.ini;
            }
            else if (this.ini == max) {
                nextParticipants.push(this);
            }
        }
    });
    if (nextParticipants.length == 0) {
        if (!over) {
            nextIniTurn();
            nextParticipants = getNextParticipants();
        }
        else
        {
            endCombatTurn();
        }
    }
    return nextParticipants;
}

function addParticipant() {
    var row = $('#tblMain > tbody')[0].insertRow();
    $(row).addClass('participant');
    row.innerHTML = newParticipantRow;
    var p = new Participant(row);
    p.syncValuesToRow();
    $(row).data('participant', p);
    participants.push(p)
    $(row).find('.iniInput').on('focus', function () {
        this.select();
    });

    $(row).find('.iniInput').on('input', function () {
        var row = getRow(this);
        var p = $(row).data('participant');
        p.syncValuesFromRow();
    });
    
    $(".chkFullDefense").change(function() {
        var participant = getParticipant(this);
        participant.fullDefense = this.checked;
        participant.calculateInitiative();
});

    $(".inpIni").on('keydown', function (e) {
        var keyCode = e.keyCode || e.which;

        if (keyCode == 9) {
            e.preventDefault();
            var row = getRow(this);
            var nextRow = $(row).next()[0];
            if (nextRow != undefined && !$(nextRow).hasClass('footerrow'))
            {
                $(nextRow).find('.inpIni')[0].select();
            }
            else
            {
                addParticipant();
                nextRow = $(row).next()[0];
                $(nextRow).find('.inpIni')[0].select();
            }
        }
    });

    $(".inpName").on('keydown', function (e) {
        var keyCode = e.keyCode || e.which;

        if (keyCode == 9) {
            e.preventDefault();
            var row = getRow(this);
            var nextRow = $(row).next()[0];
            if (nextRow != undefined && !$(nextRow).hasClass('footerrow'))
            {
                $(nextRow).find('.inpName')[0].focus();
            }
            else
            {
                addParticipant();
                nextRow = $(row).next()[0];
                $(nextRow).find('.inpName')[0].focus();
            }
        }
    });

    $(row).find('.btnDelete').click(btnDelete_Click);
    $(row).find('.btnDie').click(btnDie_Click);
    $(row).find('.btnRevive').click(btnRevive_Click);
    $(row).find('.btnWait').click(btnWait_Click);
    $(row).find('.btnAct').click(btnAct_Click);
    $(row).find('.btnRevive').toggle();
}

function removeParticipant(participant) {
    var row = participant.row;
    var i = participants.indexOf(participant)
    participants.splice(i, 1);
    deleteRow(row);
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
}

function  syncTurnValues()
{
    $('#spanCT')[0].innerHTML = combatTurn;
    $('#spanIT')[0].innerHTML = initiativeTurn;
}

function act(actor)
{
    actor.setStatus(StatusEnum.Finished);
    var i = currentActors.indexOf(actor)
    if (i != -1)
    {
        currentActors.splice(i, 1);
        if (currentActors.length == 0) {
            goToNextActors();
        }
    }
}

/// Button Handler
function btnAddParticipant_Click() {
    addParticipant();
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
    
    $('#btnStart').toggle();
    $('.btnDelete').toggle();
    started = true;
    goToNextActors();
}

function btnDelete_Click() {
    removeParticipant(getParticipant(this));
}

function btnReset_Click() {
    combatTurn = 1;
    if (started)
    {
        $('#btnStart').toggle();
        $('.btnDelete').toggle();
        started = false;
    }
    initiativeTurn = 1;
    $.each(participants, function () {
        this.softReset();
    });
    syncTurnValues();
}

function btnDie_Click() {
    var actor = getParticipant(this)
    actor.die();
    var row = getRow(this);
    $(row).find('.btnRevive').toggle();
    $(row).find('.btnDie').toggle();
    var i = currentActors.indexOf(actor)
    if (i != -1)
    {
        act(actor);
    }
}

function btnRevive_Click() {
    getParticipant(this).revive();
    var row = getRow(this);
    $(row).find('.btnRevive').toggle();
    $(row).find('.btnDie').toggle();
}
