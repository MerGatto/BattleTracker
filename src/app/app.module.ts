import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CustomFormsModule } from 'ng2-validation'

import { AppComponent } from './app.component';
import { BattleTrackerComponent } from './battle-tracker/battle-tracker.component';

@NgModule({
  declarations: [
    AppComponent,
    BattleTrackerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule, 
    CustomFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
