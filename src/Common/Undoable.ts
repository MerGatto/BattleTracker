import { UndoHandler } from "Common";

export class Undoable
{
  Set(prop: string, val: any)
  {
    UndoHandler.HandleProperty(this, prop, val);
  }
}
