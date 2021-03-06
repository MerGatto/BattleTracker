import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslatePipe, TranslateService } from "./translate";
import { Auth } from "./auth";

import { SortablejsModule } from "ngx-sortablejs";

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
    NgbModule,
    SortablejsModule.forRoot({ animation: 150 })
  ],
  providers: [TranslateService, Auth],
  bootstrap: [AppComponent]
})
export class AppModule { }
