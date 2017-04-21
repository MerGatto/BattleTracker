import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CustomFormsModule } from 'ng2-validation'
import { DropdownModule } from 'ng2-bootstrap';
import { TranslatePipe, TranslateService }   from './translate';
import { Auth }   from './auth';

import { AppComponent } from './app.component';
import { BattleTrackerComponent } from './battle-tracker/battle-tracker.component';
import { ConditionMonitorComponent } from './condition-monitor/condition-monitor.component';

@NgModule({
  declarations: [
    AppComponent,
    BattleTrackerComponent,
    TranslatePipe,
    ConditionMonitorComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule, 
    CustomFormsModule,
    DropdownModule.forRoot()
  ],
  providers: [ TranslateService, Auth ],
  bootstrap: [AppComponent]
})
export class AppModule { }
