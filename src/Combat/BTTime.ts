import { Undoable } from "Common";

export class BTTime extends Undoable
{
  public static readonly Start: number = Number.MAX_SAFE_INTEGER;
  public static readonly End: number = Number.MIN_SAFE_INTEGER;

  private static readonly BEFORE_COMBAT: string = "Before combat";

  private _combatTurn: number;
  private _initiativePass: number;
  private _initiativeScore: number;

  get combatTurn(): number
  {
    return this._combatTurn;
  }
  set combatTurn(val: number)
  {
    this.Set("combatTurn", val);
  }

  get initiativePass(): number
  {
    return this._initiativePass;
  }
  set initiativePass(val: number)
  {
    this.Set("initiativePass", val);
  }

  get initiativeScore(): number
  {
    return this._initiativeScore;
  }
  set initiativeScore(val: number)
  {
    this.Set("initiativeScore", val);
  }

  constructor(combatTurn: number, initiativePass: number = BTTime.Start, initiativeScore: number = BTTime.Start)
  {
    super();
    this._combatTurn = combatTurn;
    this._initiativePass = initiativePass;
    this._initiativeScore = initiativeScore;
  }

  public toString(): string
  {
    let text: string = "";
    if (this.combatTurn === BTTime.Start)
    {
      return BTTime.BEFORE_COMBAT;
    }

    text = "Combat Turn " + this.combatTurn;

    if (this.initiativePass === BTTime.Start)
    {
      return text + ": Start";
    }
    else if (this.initiativePass === BTTime.End)
    {
      return text + ": End";
    }

    text += "; Pass " + this.initiativePass;

    if (this.initiativeScore = BTTime.Start)
    {
      return text + ": Start";
    }
    else if (this.initiativeScore === BTTime.End)
    {
      return text + ": End";

    }

    text += "; Score " + this.initiativeScore;

    return text;
  }
}
