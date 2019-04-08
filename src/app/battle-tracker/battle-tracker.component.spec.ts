/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";

import { BattleTrackerComponent } from "./battle-tracker.component";

describe("BattleTrackerComponent",
  () =>
  {
    let component: BattleTrackerComponent;
    let fixture: ComponentFixture<BattleTrackerComponent>;

    beforeEach(async(() =>
    {
      TestBed.configureTestingModule({
          declarations: [BattleTrackerComponent]
        })
        .compileComponents();
    }));

    beforeEach(() =>
    {
      fixture = TestBed.createComponent(BattleTrackerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it("should create",
      () =>
      {
        expect(component).toBeTruthy();
      });
  });
