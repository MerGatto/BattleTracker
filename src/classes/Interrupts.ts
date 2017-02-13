import {UndoHandler} from "./UndoHandler"
import {ActionEntry} from "../Interfaces/IActionEntry"

interface IInterruptTable {
    fullDefense: ActionEntry,
    block: ActionEntry,
    intercept: ActionEntry,
    counterstrike: ActionEntry,
    diveForCover: ActionEntry,
    dodge: ActionEntry,
    parry: ActionEntry,
    reversal: ActionEntry,
    rightBackAtYa: ActionEntry,
    runForYourLife: ActionEntry,
    diveOnTheGrenade: ActionEntry,
    sacrificeThrow: ActionEntry,
    riposte: ActionEntry,
    protectingThePrinciple: ActionEntry,
    shadowBlock: ActionEntry
}

export class Interrupts {
    
    readonly interruptTable: IInterruptTable = {
        fullDefense: {
            iniMod: -10,
            persist: true,
            edge: false,
            martialArt: false
        },
        block: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: false
        },
        intercept: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: false
        },
        counterstrike: {
            iniMod: -7,
            persist: false,
            edge: false,
            martialArt: true
        },
        diveForCover: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: false
        },
        dodge: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: false
        },
        parry: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: false
        },
        reversal: {
            iniMod: -7,
            persist: false,
            edge: false,
            martialArt: true
        },
        rightBackAtYa: {
            iniMod: -10,
            persist: false,
            edge: false,
            martialArt: false
        },
        runForYourLife: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: false
        },
        diveOnTheGrenade: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: false
        },
        sacrificeThrow: {
            iniMod: -10,
            persist: false,
            edge: false,
            martialArt: true
        },
        riposte: {
            iniMod: -7,
            persist: false,
            edge: false,
            martialArt: true
        },
        protectingThePrinciple: {
            iniMod: -5,
            persist: false,
            edge: true,
            martialArt: false
        },
        shadowBlock: {
            iniMod: -5,
            persist: false,
            edge: false,
            martialArt: true
        }
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