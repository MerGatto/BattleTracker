export function convertToInt(input, deflt = 0)
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

export function deleteRow(row) {
    $(row).remove();
}

export function getRowIndex(obj)
{
    var row = getRow(obj);
    return $("tr").index(row);
}

export function getRow(obj)
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

export function getParticipant(obj)
{
    var row = getRow(obj);
    return $(row).data('participant');
}

export function getRowForIndex(i)
{
    var ele: any = document.getElementById('tblMain')
    return ele.rows[i];
}