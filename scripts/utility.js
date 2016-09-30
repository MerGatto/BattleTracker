function convertToInt(input, deflt = 0)
{
    var int =  parseInt(input, 10);
    if (isNaN(int))
    {
        return deflt;
    }
    else
    {
        return int;
    }
}

function deleteRow(row) {
    $(row).remove();
}

function getRowIndex(obj)
{
    var row = getRow(obj);
    return $("tr").index(row);
}

function getRow(obj)
{
    var node = obj;
    if (node == undefined)
    {
        return undefined;
    }
    if (node.nodeName == "TR")
    {
        return node;
    }
    return getRow(node.parentNode);
}

function getParticipant(obj)
{
    var row = getRow(obj);
    return $(row).data('participant');
}

function getRowForIndex(i)
{
    return document.getElementById('tblMain').rows[i];
}