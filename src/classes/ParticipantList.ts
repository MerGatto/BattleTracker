import {UndoHandler} from "./UndoHandler"
import {Participant} from "./Participant"

export class ParticipantList {

    private _list: Array<Participant>;

  get items(): Participant[] {
        return this._list;
    }

    constructor() {
        this._list = new Array<Participant>();
    }

    insert(p: Participant, log: boolean = true) {
        if (log) {
            UndoHandler.DoAction(() => this.insert(p, false), () => this.remove(p, false));
        }
        else 
        {
            this.items.push(p);
        }
    }

    insertAt(p: Participant, i: number, log: boolean = true) {
        if (log) {
            UndoHandler.DoAction(() => this.insertAt(p, i, false), () => this.remove(p, false));
        }
        else 
        {
            this.items.splice(i, 0, p);
        }
    }

    remove(p: Participant, log: boolean = true): boolean {
        var i = this.items.indexOf(p);
      if (i != -1) {
            if (log) {
                UndoHandler.DoAction(() => this.remove(p, false), () => this.insertAt(p, i, false));
            }
            else {
                this.items.splice(i, 1);
            }
            return true;
      }
        return false;
    }

    clear(log: boolean = true) {
        if (log) {
            var items = this.items;
          UndoHandler.DoAction(() => this.clear(false), () => { this._list = items});
        }
        else {
            this._list = [];
        }
    }

    contains(p: Participant, log: boolean = true): boolean {
        return this.items.indexOf(p) != -1;
    }
    
    get count(): number {
        return this.items.length;
    }

}