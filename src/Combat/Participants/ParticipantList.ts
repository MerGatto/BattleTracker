import { UndoHandler } from "Common";
import { IParticipant } from "Combat";

export class ParticipantList
{

  get items(): IParticipant[]
  {
    return this._list;
  }

  get count(): number
  {
    return this.items.length;
  }
  private _list: IParticipant[];

  constructor()
  {
    this._list = new Array<IParticipant>();
  }

  insert(p: IParticipant, log = true)
  {
    if (log)
    {
      UndoHandler.DoAction(
        () => this.insert(p, false),
        () => this.remove(p, false)
      );
    } else
    {
      this.items.push(p);
    }
  }

  insertAt(p: IParticipant, i: number, log = true)
  {
    if (log)
    {
      UndoHandler.DoAction(
        () => this.insertAt(p, i, false),
        () => this.remove(p, false)
      );
    } else
    {
      this.items.splice(i, 0, p);
    }
  }

  remove(p: IParticipant, log = true): boolean
  {
    const i = this.items.indexOf(p);
    if (i !== -1)
    {
      if (log)
      {
        UndoHandler.DoAction(
          () => this.remove(p, false),
          () => this.insertAt(p, i, false)
        );
      } else
      {
        this.items.splice(i, 1);
      }
      return true;
    }
    return false;
  }

  move(p: IParticipant, n: number)
  {
    const i = this.items.indexOf(p);
    if (i !== -1 && i + n !== -1 && i + n < this.items.length)
    {
      this.remove(p);
      this.insertAt(p, i + n);
    }
  }

  clear(log = true)
  {
    if (log)
    {
      const items = this.items;
      UndoHandler.DoAction(
        () => this.clear(false),
        () =>
        {
          this._list = items;
        }
      );
    } else
    {
      this._list = [];
    }
  }

  contains(p: IParticipant): boolean
  {
    return this.items.indexOf(p) !== -1;
  }

  sortByInitiative()
  {
    this.items.sort(this.initiativeComparator);
  }

  sortBySortOrder()
  {
    this.items.sort(this.sortOrderComparator);
  }

  sortOrderComparator(p1: IParticipant, p2: IParticipant): number
  {
    return p1.sortOrder - p2.sortOrder;
  }

  initiativeComparator(p1: IParticipant, p2: IParticipant): number
  {
    let p1CompValue = p1.getCurrentInitiative();
    let p2CompValue = p2.getCurrentInitiative();
    if (p2.ooc)
    {
      p2CompValue -= 1000;
    }

    if (p1.ooc)
    {
      p1CompValue -= 1000;
    }

    if (p1.edge)
    {
      p1CompValue += 100;
    }

    if (p2.edge)
    {
      p2CompValue += 100;
    }

    if (p2CompValue === p1CompValue)
    {
      return p1.sortOrder - p2.sortOrder;
    } else
    {
      return p2CompValue - p1CompValue;
    }
  }
}
