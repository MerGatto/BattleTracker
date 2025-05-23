import { Action } from "./Interfaces/Action";

export const interruptTable: Action[] = [
  {
    key: "fullDefense",
    iniMod: -10,
    persist: true
  },
  {
    key: "block",
    iniMod: -5
  },
  {
    key: "intercept",
    iniMod: -5
  },
  {
    key: "counterstrike",
    iniMod: -7,
    martialArt: true
  },
  {
    key: "diveForCover",
    iniMod: -5
  },
  {
    key: "dodge",
    iniMod: -5
  },
  {
    key: "parry",
    iniMod: -5
  },
  {
    key: "reversal",
    iniMod: -7,
    martialArt: true
  },
  {
    key: "rightBackAtYa",
    iniMod: -10
  },
  {
    key: "runForYourLife",
    iniMod: -5
  },
  {
    key: "diveOnTheGrenade",
    iniMod: -5
  },
  {
    key: "sacrificeThrow",
    iniMod: -10,
    martialArt: true
  },
  {
    key: "riposte",
    iniMod: -7,
    martialArt: true
  },
  {
    key: "protectingThePrinciple",
    iniMod: -5,
    edge: true,
  },
  {
    key: "shadowBlock",
    iniMod: -5,
    martialArt: true
  },
  {
    key: "iAmTheFirewall",
    iniMod: -5,
    martialArt: false
  }
];
