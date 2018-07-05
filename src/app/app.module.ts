import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";

import { CustomFormsModule } from "ng2-validation"
import { BsDropdownModule } from "ngx-bootstrap";
import { TranslatePipe, TranslateService } from "./translate";
import { Auth } from "./auth";

import { SortablejsModule } from "angular-sortablejs";

import { AppComponent } from "./app.component";
import { BattleTrackerComponent } from "./battle-tracker/battle-tracker.component";
import { ConditionMonitorComponent } from "./condition-monitor/condition-monitor.component";
import { RangeSliderComponent } from "./range-slider/range-slider.component";

@NgModule({
  declarations: [
    AppComponent,
    BattleTrackerComponent,
    TranslatePipe,
    ConditionMonitorComponent,
    RangeSliderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CustomFormsModule,
    BsDropdownModule.forRoot(),
    SortablejsModule.forRoot({ animation: 150 })
  ],
  providers: [TranslateService, Auth],
  bootstrap: [AppComponent]
})
export class AppModule {}
