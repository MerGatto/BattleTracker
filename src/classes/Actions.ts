import {UndoHandler} from "./UndoHandler"
import {Action} from "../Interfaces/Action"
import {interruptTable} from "./InterruptTable"

export class Actions {

    get interrupts() {
        return interruptTable
    }

    get modifier(): number {
        var sum: number = 0
        for (let action of this.persistentInterrupts) {
            if (this[action.key] === true) sum+= action.iniMod
        }

        return sum
    }

    readonly persistentInterrupts: Array<Action>
    readonly normalInterrupts: Array<Action>

    constructor() {
        this.persistentInterrupts = interruptTable.filter(action => { return action.persist })
        this.normalInterrupts = interruptTable.filter(action => { return !action.edge && !action.martialArt && !action.persist})
        for (let action of this.persistentInterrupts) {
            this["_"+action.key] = false
            Object.defineProperty(this, action.key, {
                get: () => { return this["_"+action.key]},
                set: (val: boolean) => { UndoHandler.HandleProperty(this, action.key, val) }
            })
        }
        this.reset()
    }

    reset() {
        for (var action of this.persistentInterrupts) {
            this[action.key] = false
        }
    }
}