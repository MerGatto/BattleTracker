import {StatusEnum} from "./StatusEnum"
import {UndoHandler} from "./UndoHandler"
import {Actions} from "./Actions"

export class Participant
{
    private _name: string
    get name(): string {
        return this._name
    }
    set name(val: string) {
        UndoHandler.HandleProperty(this, "name", val)
    }

    private _waiting: boolean
    get waiting(): boolean {
        return this._waiting
    }
    set waiting(val: boolean) {
        UndoHandler.HandleProperty(this, "waiting", val)
    }

    private _finished: boolean
    get finished(): boolean {
        return this._finished
    }
    set finished(val: boolean) {
        UndoHandler.HandleProperty(this, "finished", val)
    }

    private _active: boolean
    get active(): boolean {
        return this._active
    }
    set active(val: boolean) {
        UndoHandler.HandleProperty(this, "active", val)
    }
    
    private _baseIni: number
    get baseIni(): number {
        return this._baseIni
    }
    set baseIni(val: number) {
        UndoHandler.HandleProperty(this, "baseIni", val)
    }

    private _ini: number
    get ini(): number {
        return this._ini
    }
    set ini(val: number) {
        UndoHandler.HandleProperty(this, "ini", val)
    }

    private _wm: number
    get wm(): number {
        return this._wm
    }
    set wm(val: number) {
        UndoHandler.HandleProperty(this, "wm", val)
    }

    private _iniChange: number
    get iniChange(): number {
        return this._iniChange
    }
    set iniChange(val: number) {
        UndoHandler.HandleProperty(this, "iniChange", val)
    }

    private _ooc: boolean
    get ooc(): boolean {
        return this._ooc
    }
    set ooc(val: boolean) {
        UndoHandler.HandleProperty(this, "ooc", val)
    }

    private _edge: boolean
    get edge(): boolean {
        return this._edge
    }
    set edge(val: boolean) {
        UndoHandler.HandleProperty(this, "edge", val)
    }

    private _status: StatusEnum 
    get status(): StatusEnum {
        return this._status
    }
    set status(val: StatusEnum) {
        UndoHandler.HandleProperty(this, "status", val)
    }

    private _actions: Actions
    get actions(): Actions {
        return this._actions
    }
    set actions(val: Actions) {
        UndoHandler.HandleProperty(this, "actions", val)
    }

    constructor()
    {
        this.status = StatusEnum.Waiting
        this.waiting = false
        this.finished = false
        this.active = false
        this.baseIni = 0
        this.ini = 0
        this.wm = 0
        this.iniChange = 0
        this.ooc = false
        this.actions = new Actions()
        this.edge = false
        this.name = ""
    }

    seizeInitiative() 
    {
        this.edge = true
    }

    calculateInitiative(initiativeTurn: number)
    {
        var ini = this.ini + this.iniChange - this.wm -(initiativeTurn-1) * 10 + this.actions.modifier
        return ini
    }

    leaveCombat()
    {
        this.ooc = true
    }

    enterCombat()
    {
        this.ooc = false
    }

    softReset(revive = false)
    {
        this.ini = 0
        this.edge = false
        this.status = StatusEnum.Waiting
        if (revive || !this.ooc)
        {
            this.enterCombat()
        }
        this.actions.reset()
    }

    hardReset()
    {
        this.softReset(true)
        this.wm = 0
        this.iniChange = 0
    }
}