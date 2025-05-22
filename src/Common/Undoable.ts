import UndoHandler from "./UndoHandler";

export class Undoable
{
  Set(prop: string, val: unknown)
  {
    UndoHandler.HandleProperty(this, prop, val);
  }
}
