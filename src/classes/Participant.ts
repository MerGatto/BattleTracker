import {StatusEnum} from "./StatusEnum"
import {PropertyHandler} from "./PropertyHandler"

export class Participant
{
    private _name: string
    get name(): string {
        return this._name
    }
    set name(val: string) {
        PropertyHandler.handleProperty(this, "name", val)
    }


    private _waiting: boolean
    get waiting(): boolean {
        return this._waiting
    }
    set waiting(val: boolean) {
        PropertyHandler.handleProperty(this, "waiting", val)
    }


    private _finished: boolean
    get finished(): boolean {
        return this._finished
    }
    set finished(val: boolean) {
        PropertyHandler.handleProperty(this, "finished", val)
    }

    private _active: boolean
    get active(): boolean {
        return this._active
    }
    set active(val: boolean) {
        PropertyHandler.handleProperty(this, "active", val)
    }
    
    private _baseIni: number
    get baseIni(): number {
        return this._baseIni
    }
    set baseIni(val: number) {
        PropertyHandler.handleProperty(this, "baseIni", val)
    }

    private _ini: number
    get ini(): number {
        return this._ini
    }
    set ini(val: number) {
        PropertyHandler.handleProperty(this, "ini", val)
    }

    private _wm: number
    get wm(): number {
        return this._wm
    }
    set wm(val: number) {
        PropertyHandler.handleProperty(this, "wm", val)
    }

    private _iniChange: number
    get iniChange(): number {
        return this._iniChange
    }
    set iniChange(val: number) {
        PropertyHandler.handleProperty(this, "iniChange", val)
    }

    private _ooc: boolean
    get ooc(): boolean {
        return this._ooc
    }
    set ooc(val: boolean) {
        PropertyHandler.handleProperty(this, "ooc", val)
    }

    private _fullDefense: boolean
    get fullDefense(): boolean {
        return this._fullDefense
    }
    set fullDefense(val: boolean) {
        PropertyHandler.handleProperty(this, "fullDefense", val)
    }

    private _edge: boolean
    get edge(): boolean {
        return this._edge
    }
    set edge(val: boolean) {
        PropertyHandler.handleProperty(this, "edge", val)
    }

    private _status: StatusEnum 
    get status(): StatusEnum {
        return this._status
    }
    set status(val: StatusEnum) {
        PropertyHandler.handleProperty(this, "status", val)
    }

    constructor()
    {
        this.setStatus(StatusEnum.Waiting)
        this.waiting = false
        this.finished = false
        this.active = false
        this.baseIni = 0
        this.ini = 0
        this.wm = 0
        this.iniChange = 0
        this.ooc = false
        this.fullDefense = false
        this.edge = false
        this.name = ""
    }

    seizeInitiative() 
    {
        this.edge = true
    }

    calculateInitiative(initiativeTurn: number)
    {
        var ini = this.ini + this.iniChange - this.wm -(initiativeTurn-1) * 10
        if (this.fullDefense)
        {
            ini = ini-10
        }
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

    setStatus(status)
    {
        this.status = status
    }

    softReset(revive = false)
    {
        this.ini = 0
        this.edge = false
        this.setStatus(StatusEnum.Waiting)
        if (revive || !this.ooc)
        {
            this.enterCombat()
        }
        this.fullDefense = false
    }

    hardReset()
    {
        this.softReset(true)
        this.wm = 0
        this.iniChange = 0
    }
}