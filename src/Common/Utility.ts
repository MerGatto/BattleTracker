export class Utility
{
  public static convertToInt(input, deflt = 0): number
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
}
