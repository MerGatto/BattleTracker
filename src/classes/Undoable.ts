
import {UndoHandler} from "./UndoHandler"

export class Undoable
{
    Set(prop: string, val: any)
    {
        UndoHandler.HandleProperty(this, prop, val);
    }
}