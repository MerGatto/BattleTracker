export class Utility {
  public static convertToInt(input: string | number | undefined | null, deflt = 0): number {
    if (input == null) {
      return deflt
    }

    let int = deflt
    if (typeof input === "string") {
      int = parseInt(input, 10);
    }
    if (isNaN(int)) {
      return deflt;
    }
    else {
      return int;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static ConvertStyleObjectToString(styles: any): string {
    let result = '';
    let first = true;
    for (const key in styles) {
      if (styles[key]) {

        if (!first) {
          result += ' ';
        }
        else {
          first = false;
        }

        result += key;
      }

    }
    return result;

  }
}
