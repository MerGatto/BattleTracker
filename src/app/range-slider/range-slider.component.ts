import { Component, OnInit, Input,  forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RangeSliderComponent),
  multi: true
};

@Component({
  selector: 'range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.css'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class RangeSliderComponent implements OnInit, ControlValueAccessor {
  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  private _value: number
  get value(): number {
    return this._value
  }
  set value(val: number) {
    this._value = val
    this.onChangeCallback(val);
  }
  
  private _max: number
  @Input()
  set max(value: number) {
    this._max = value
  }
  get max(): number {
    return this._max
  }  

  private _min: number
  @Input()
  set min(value: number) {
    this._min = value
  }
  get min(): number {
    return this._min
  }

  private _step: number
  @Input()
  set step(value: number) {
    this._step = value
  }
  get step(): number {
    return this._step
  }


  constructor() {
    this._max = 10
    this._min = 0
    this._step = 1
    this._value = 1
   }

  ngOnInit() {
  }


  writeValue(val: number): void {
    if (val != this.value) {
      this.value = val
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

  onInput(e) {
    let val = $(e.target).val()
    if (val > this.max) {
      this.value = this.max
      $(e.target).val(this.max)
    }
    if (val < this.min) {
      this.value = this.min
      $(e.target).val(this.min)
    }
  }

  inp_Focus(e) { 
    e.target.select()
  }

}
