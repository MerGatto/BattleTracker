export interface PropertyHistoryItem {
    obj: Object,
    property: string,
    oldValue: any,
    newValue: any
}

export module PropertyHandler {
    export function handleProperty(obj: Object, prop: string, val: any) {        
        if (obj["_"+prop] != val) {
            // console.log("Property "+prop+" from " + obj+" changed from " + obj["_"+prop] + " to "+val)
            obj["_"+prop] = val
        }
    }
}