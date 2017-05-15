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