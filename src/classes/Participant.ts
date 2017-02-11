import {StatusEnum} from "./StatusEnum"

export class Participant
{
    name: string
    waiting: boolean
    finished: boolean
    active: boolean
    baseIni: number
    ini: number
    vm: number
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
        this.vm = 0
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
        this.ini = this.baseIni + this.iniChange - this.vm -(initiativeTurn-1) * 10
        if (this.fullDefense)
        {
            this.ini = this.ini-10
        }
        return this.ini
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
        this.baseIni = 0
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
        this.vm = 0
        this.iniChange = 0
    }
}