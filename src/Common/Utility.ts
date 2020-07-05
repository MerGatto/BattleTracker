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

  public static ConvertStyleObjectToString(styles: any): string
  {
    let result = '';
    let first = true;
    for (var key in styles)
    {
      if (styles[key])
      {

        if (!first)
        {
          result += ' ';
        }
        else
        {
          first = false;
        }

        result += key;
      }

    }
    return result;

  }
}
