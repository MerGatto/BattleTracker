import { Component, OnInit } from "@angular/core";
import { TranslateService } from "./translate";
import { BattleTrackerComponent } from "./battle-tracker/battle-tracker.component";
import { CommonModule } from "@angular/common";
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

declare var Auth0Lock: any;

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule,NgbNavModule, BattleTrackerComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit
{
  title = "Battle Tracker";

  public supportedLanguages: any[] = [];

  constructor(private _translate: TranslateService) {}

  ngOnInit()
  {
    // standing data
    this.supportedLanguages = [
      { display: "English", value: "en" },
      { display: "Deutsch", value: "de" },
    ];

    this.selectLang("en");
  }

  isCurrentLang(lang: string)
  {
    return lang === this._translate.currentLang;
  }

  selectLang(lang: "en" | "de")
  {
    // set default;
    this._translate.use(lang);
  }
}
