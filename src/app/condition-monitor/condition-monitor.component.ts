import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { UndoHandler } from "../../classes/UndoHandler"

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ConditionMonitorComponent),
  multi: true
};

@Component({
  selector: 'app-condition-monitor',
  templateUrl: './condition-monitor.component.html',
  styleUrls: ['./condition-monitor.component.css'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class ConditionMonitorComponent implements OnInit, ControlValueAccessor {

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  private _damage: number
  get damage(): number {
    return this._damage
  }
  set damage(val: number) {
    UndoHandler.HandleProperty(this, "damage", val)
    this.onChangeCallback(val);
  }

  private _health: number
  @Input()
  set health(value: number) {
    UndoHandler.HandleProperty(this, "health", value)
  }
  get health(): number {
    return this._health
  }

  private _painPolerance: number
  @Input()
  set painPolerance(value: number) {
    UndoHandler.HandleProperty(this, "painPolerance", value)
  }
  get painPolerance(): number {
    return this._painPolerance
  }

  get rows(): number {
    return Math.ceil(this.health / 3)
  }

  constructor() { }

  ngOnInit() {
  }

  createRange(number) {
    var items: number[] = [];
    for (var i = 1; i <= number; i++) {
      items.push(i);
    }
    return items;
  }

  getCols(row: number) {
    if (this.health / (row * 3) >= 1) {
      return 3
    }
    else {
      return this.health % 3;
    }
  }

  OnCellClick(n: number) {
    if (this.damage == n) {
      this.damage = 0
    }
    else {
      this.damage = n;
    }
  }

  getCellStyle(n: number) {
    var styles = {
      'damage': this.damage >= n
    }
    return styles
  }

  getCellText(n: number): string {
    var result: string = ""
    if ((n > this.painPolerance) && (n - this.painPolerance) % 3 == 0) {
      result = '-' + ((n - this.painPolerance) / 3)
    }
    return result
  }



  writeValue(val: number): void {
    if (val != this.damage) {
      this.damage = val
    }
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn
  }
  setDisabledState(isDisabled: boolean): void {

  }

}
