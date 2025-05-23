import { Component, Input, Output, forwardRef, EventEmitter } from "@angular/core";
@Component({
  standalone: true,
  selector: "app-condition-monitor",
  templateUrl: "./condition-monitor.component.html",
  styleUrls: ["./condition-monitor.component.css"]
})
export class ConditionMonitorComponent {
  private _damage: number;
  @Input()
  get damage(): number {
    return this._damage;
  }
  set damage(val: number) {
    if (this._damage !== val) {
      this._damage = val;
      this.damageChange.emit(val);
    }
  }
  @Output()
  readonly damageChange = new EventEmitter<number>();

  private _health: number;
  @Input()
  get health(): number {
    return this._health;
  }
  set health(value: number) {
    this._health = value;
  }

  private _overflow: number;
  @Input()
  get overflow(): number {
    return this._overflow;
  }
  set overflow(value: number) {
    this._overflow = value;
  }

  private _painTolerance: number;
  @Input()
  get painTolerance(): number {
    return this._painTolerance;
  }
  set painTolerance(value: number) {
    this._painTolerance = value;
  }


  private _hasPainEditor: boolean;
  @Input()
  get hasPainEditor(): boolean {
    return this._hasPainEditor;
  }
  set hasPainEditor(value: boolean) {
    this._hasPainEditor = value;
  }

  get rows(): number {
    return Math.ceil(this.cellCount / 3);
  }

  get cellCount(): number {
    let overflow = 0;
    if (this.overflow > 0) {
      overflow = this.overflow + 1;
    }
    return this.health + overflow;
  }

  constructor() {
    this._health = 10;
    this._overflow = 0;
    this._painTolerance = 0;
    this._damage = 0;
    this._hasPainEditor = false;
  }

  createRange(number: number) {
    const items: number[] = [];
    for (let i = 1; i <= number; i++) {
      items.push(i);
    }
    return items;
  }

  getCols(row: number) {
    // Eg row 4 in 10 cell grid will return 1 here
    return Math.min(3, this.cellCount - (row - 1) * 3);
  }

  OnCellClick(n: number) {
    if (this.damage === n) {
      this.damage = 0;
    } else {
      this.damage = n;
    }
  }

  getCellStyle(n: number) {
    const styles = {
      "damage": this.damage >= n,
      "overflow": n > this.health,
      "filled": n === this.cellCount && this.overflow > 0
    };

    return styles
  }

  getCellText(n: number): string {
    let result = "";

    if (this.hasPainEditor) {
      return result;
    }

    if ((n > this.painTolerance) && (n - this.painTolerance) % 3 === 0 && n <= this.health) {
      result = "-" + ((n - this.painTolerance) / 3);
    }
    return result;
  }
}
