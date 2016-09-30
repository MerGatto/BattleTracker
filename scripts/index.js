var newParticipantRow = 
                '<td><input type="text"></td>' +
                '<td><input class="inpIni iniInput" type="number"></td>' +
                '<td><input class="vm iniInput" type="number"></td>' +
                '<td><input class="iniChange iniInput" type="number"></td>' +
                '<td class="effIni"></td>' +
                '<td><input type="button" class="btnDie" value="Die">' +
                '<input type="button" class="btnRevive" value="Revive"></td>' +
                '<td><input type="button" class="btnDelete" value="Del"></td>'

var participants = new Array();

var kampfRunde = 1;
window.iniDurchgang = 1;
var currentActors = new Array();;

$( document ).ready(function() {
    console.log( "ready!" );
    addParticipant();
});


function nextIniTurn()
{
    window.iniDurchgang++;
    $.each(participants, function()
    {
        if (this.status != StatusEnum.Dead)
        {
            this.setStatus(StatusEnum.Idle);
            this.calculateInitiative();
        }
    });
}

function getNextParticipants()
{
    var nextParticipants = new Array();
    var max = 0;
    var i = 0;
    var over = true;
    $.each(participants, function() 
    {   
        if (this.ini > 0)
        {
            over = false;
        }
        if (this.status == StatusEnum.Idle && this.baseIni > 0 && this.ini > 0)
        {
            if (this.ini > max)
            {
                nextParticipants = [];
                nextParticipants.push(this);
                max = this.ini;
            }
            else if (this.ini == max)
            {
                nextParticipants.push(this);
            }
        }
    });
    if (nextParticipants.length == 0)
    {
        if (!over)
        {
            nextIniTurn();
            nextParticipants = getNextParticipants();
        }
    }
    return nextParticipants;
}

function addParticipant()
{
    var row = $('#tblMain > tbody')[0].insertRow();
    row.innerHTML = newParticipantRow;
    var p = new Participant(row);
    p.syncValuesToRow();
    $(row).data('participant', p);
    participants.push(p)
    $(row).find('.iniInput').on('input', function() 
    {
        var row = getRow(this);
        var p = $(row).data('participant');
        p.syncValuesFromRow();
    });

    $(row).find('.btnDelete').click(btnDelete_Click);
    $(row).find('.btnDie').click(btnDie_Click);
    $(row).find('.btnRevive').click(btnRevive_Click);
    $(row).find('.btnRevive').toggle();
}

function removeParticipant(participant)
{
    var row = participant.row;
    var i = participants.indexOf(participant)
    participants.splice(i, 1);
    deleteRow(row);
}

/// Button Handler
    function btnAddParticipant_Click()
    {
        addParticipant();
    }

    function btnNext_Click()
    {
        if (currentActors.length > 0)
        {
            $.each(currentActors, function()
            {
                this.setStatus(StatusEnum.Finished);
            });
        }
        currentActors = [];
        currentActors = getNextParticipants();
        if (currentActors.length > 0)
        {
            $.each(currentActors, function()
            {
                this.setStatus(StatusEnum.Active);
            });
        }
    }

    function btnWait_Click()
    {
        if (currentActors.length > 0)
        {
            $.each(currentActors, function()
            {
                this.setStatus(StatusEnum.Waiting);
            });
        }
        currentActors = [];
        currentActors = getNextParticipants();
        if (currentActors.length > 0)
        {
            $.each(currentActors, function()
            {
                this.setStatus(StatusEnum.Active);
            });
        }
    }

    function btnDelete_Click()
    {
        removeParticipant(getParticipant(this));
    }

    function btnReset_Click()
    {
        kampfRunde = 1;
        window.iniDurchgang = 1;
        $.each(participants, function()
        {
            this.softReset();
        });
    }

    function btnDie_Click()
    {
        getParticipant(this).setStatus(StatusEnum.Dead);    
        var row = getRow(this);
        $(row).find('.btnRevive').toggle();
        $(row).find('.btnDie').toggle();
    }

    function btnRevive_Click()
    {
        getParticipant(this).setStatus(StatusEnum.Idle);
        var row = getRow(this);        
        $(row).find('.btnRevive').toggle();
        $(row).find('.btnDie').toggle();
    }
