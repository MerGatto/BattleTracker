import {UndoHandler} from "./UndoHandler"

interface InterruptModifierTable {
    fullDefense: number,
    block: number
}

export class Interrupts {
    
    readonly interruptTable: InterruptModifierTable = {
        fullDefense: -10,
        block: -5
    }

    private readonly _actions: Array<string> = []
    get actions() {
        return this._actions
    }

    get modifier(): number {
        var sum: number = 0
        for (let action of this.actions) {
            if (this[action] === true) sum+= this.interruptTable[action]
        }

        return sum
    }

    constructor() {
        for (let key in this.interruptTable) {
            this.actions.push(key)
        }
        for (let action of this.actions) {
            this["_"+action] = false
            Object.defineProperty(this, action, {
                get: () => { return this["_"+action]},
                set: (val: boolean) => { UndoHandler.HandleProperty(this, action, val) }
            })
        }
        this.reset()
    }

    reset() {
        for (var action of this.actions) {
            this[action] = false
        }
    }
}