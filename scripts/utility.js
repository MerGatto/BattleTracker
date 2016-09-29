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
    var i = getRowIndex(row);
    document.getElementById("tblMain").deleteRow(i);
}

function getRowIndex(obj)
{
    return $("tr").index(obj);
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