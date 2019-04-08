export function convertToInt(input, deflt = 0)
{
  let int = parseInt(input, 10);
  if (isNaN(int))
  {
    return deflt;
  } else
  {
    return int;
  }
}
