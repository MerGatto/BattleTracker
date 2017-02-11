import {StatusEnum} from "./StatusEnum"

export class Participant
{
    name: string
    waiting: boolean
    finished: boolean
    active: boolean
    baseIni: number
    ini: number
    wm: number
    iniChange: number
    ooc: boolean
    fullDefense: boolean
    edge: boolean
    status: StatusEnum 

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
        if (revive || !this.ooc)
        {
            this.setStatus(StatusEnum.Waiting)
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