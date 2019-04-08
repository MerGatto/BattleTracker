import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

declare var Slider;

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RangeSliderComponent),
  multi: true
};

@Component({
  selector: "ng-range-slider",
  templateUrl: "./range-slider.component.html",
  styleUrls: ["./range-slider.component.css"],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class RangeSliderComponent implements OnInit, AfterViewInit, ControlValueAccessor
{

  get value(): number
  {
    return this._value;
  }

  set value(val: number)
  {
    this._value = val;
    this.onChangeCallback(val);

    if (this._slider)
    {
      this._slider.setValue(val);
    }
  }

  @Input()
  set max(value: number)
  {
    this._max = value;
  }

  get max(): number
  {
    return this._max;
  }

  @Input()
  set min(value: number)
  {
    this._min = value;
  }

  get min(): number
  {
    return this._min;
  }

  @Input()
  set tickInterval(value: number)
  {
    this._tickInterval = value;
  }

  get tickInterval(): number
  {
    return this._tickInterval;
  }

  @Input()
  set step(value: number)
  {
    this._step = value;
  }

  get step(): number
  {
    return this._step;
  }
  get ticks(): number[]
  {
    let ticks: number[] = [];
    if (this.tickInterval <= 0)
    {
      return ticks;
    }

    for (let i = Number(this.min); i < Number(this.max); i += Number(this.tickInterval))
    {
      ticks.push(i);
    }
    ticks.push(this.max);

    return ticks;
  }
  _slider;

  @ViewChild("sliderino")
  sliderino: ElementRef;

  private _value: number;

  private _max: number;

  private _min: number;

  private _tickInterval: number;

  private _step: number;

  constructor()
  {
    this._max = 10;
    this._min = 0;
    this._step = 1;
    this._value = 1;
    this.tickInterval = 0;
  }

  ngAfterViewInit()
  {
    this._slider = new Slider(this.sliderino.nativeElement,
      {
        ticks: this.ticks,
        ticks_labels: this.ticks,
        step: this.step,
        min: this.min,
        max: this.max
      });
    this._slider.on("change", (e) =>
    {
      this.value = Number(e.newValue);
    });
  }

  ngOnInit() { }

  writeValue(val: number): void
  {
    if (val !== this.value)
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

  setDisabledState(isDisabled: boolean): void { }

  inp_Focus(e)
  {
    e.target.select();
  }

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };
}
