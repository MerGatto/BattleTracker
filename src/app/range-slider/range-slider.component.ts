import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as $ from 'jquery';
//import { Slider } from 'bootstrap-slider';

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
export class RangeSliderComponent implements OnInit, AfterViewInit, ControlValueAccessor
{
  _slider;

  @ViewChild('sliderino')
  sliderino: ElementRef;

  ngAfterViewInit()
  {
    this._slider = new Slider(this.sliderino.nativeElement, { ticks: this.ticks, ticks_labels: this.ticks});
    this._slider.on('change', (e) =>
    {
      this.value = Number(e.newValue);
    });
  }

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  private _value: number;

  get value(): number
  {
    return this._value;
  }

  set value(val: number)
  {
    this._value = val;
    this.onChangeCallback(val);

    if (this._slider) {
      this._slider.setValue(val);
    }
  }

  private _max: number;

  @Input()
  set max(value: number)
  {
    this._max = value;
  }

  get max(): number
  {
    return this._max;
  }

  private _min: number;

  @Input()
  set min(value: number)
  {
    this._min = value;
  }

  get min(): number
  {
    return this._min;
  }

  private _step: number;

  @Input()
  set step(value: number)
  {
    this._step = value;
    var ticks: number[] = [];
    if (value <= 0)
    {
      return;
    }
    for (var i = Number(this._min); i <= Number(this._max); i += Number(this._step))
    {
      ticks.push(i);
    }
    this.ticks = ticks;
    if (this._slider)
    {
      console.log("ticks");
    }
  }

  get step(): number
  {
    return this._step;
  }

  private _ticks: number[];

  set ticks(value: number[])
  {
    this._ticks = value;
  }

  get ticks(): number[]
  {
    return this._ticks;
  }

  constructor()
  {
    this._max = 10;
    this._min = 0;
    this._step = 1;
    this._value = 1;
    this._ticks = [];
  }

  ngOnInit() {}

  writeValue(val: number): void
  {
    if (val != this.value)
    {
      this.value = val;
    }
  }

  registerOnChange(fn: any): void
  {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void
  {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  inp_Focus(e)
  {
    e.target.select();
  }
}
