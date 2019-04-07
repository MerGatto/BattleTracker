import { UndoHandler } from "./UndoHandler"
import { Participant } from "./Participant"

export class ParticipantList
{
  private _list: Array<Participant>;

  get items(): Participant[]
  {
    return this._list;
  }

  constructor()
  {
    this._list = new Array<Participant>();
  }

  insert(p: Participant, log: boolean = true)
  {
    if (log)
    {
      UndoHandler.DoAction(() => this.insert(p, false), () => this.remove(p, false));
    } else
    {
      this.items.push(p);
    }
  }

  insertAt(p: Participant, i: number, log: boolean = true)
  {
    if (log)
    {
      UndoHandler.DoAction(() => this.insertAt(p, i, false), () => this.remove(p, false));
    } else
    {
      this.items.splice(i, 0, p);
    }
  }

  remove(p: Participant, log: boolean = true): boolean
  {
    var i = this.items.indexOf(p);
    if (i != -1)
    {
      if (log)
      {
        UndoHandler.DoAction(() => this.remove(p, false), () => this.insertAt(p, i, false));
      } else
      {
        this.items.splice(i, 1);
      }
      return true;
    }
    return false;
  }

  move(p: Participant, n: number)
  {
    var i = this.items.indexOf(p);
    if (i !== -1 && i + n !== -1 && i + n < this.items.length)
    {
      this.remove(p);
      this.insertAt(p, i + n);
    }
  }

  clear(log: boolean = true)
  {
    if (log)
    {
      var items = this.items;
      UndoHandler.DoAction(() => this.clear(false), () => { this._list = items });
    } else
    {
      this._list = [];
    }
  }

  contains(p: Participant, log: boolean = true): boolean
  {
    return this.items.indexOf(p) != -1;
  }

  get count(): number
  {
    return this.items.length;
  }

  sortByInitiative()
  {
    this.items.sort(this.initiativeComparator);
  }

  sortBySortOrder()
  {
    this.items.sort(this.sortOrderComparator);
  }

  sortOrderComparator(p1: Participant, p2: Participant): number
  {
    return p1.sortOrder - p2.sortOrder;
  }

  initiativeComparator(p1: Participant, p2: Participant): number
  {
    var p1CompValue = p1.calculateInitiative(1);
    var p2CompValue = p2.calculateInitiative(1);
    if (p2.ooc)
    {
      p2CompValue -= 100;
    }

    if (p1.ooc)
    {
      p1CompValue -= 100;
    }

    if (p2CompValue == p1CompValue)
    {
      return p1.sortOrder - p2.sortOrder;
    }
    else
    {
      return p2CompValue - p1CompValue;
    }
  }
}
