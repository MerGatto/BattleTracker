import { Component, OnInit } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { BattleTrackerComponent } from "app/battle-tracker/battle-tracker.component";
import { CommonModule } from "@angular/common";
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { VersionService } from "app/services/version.service";

interface LanguageEntry {
  display: string
  value: "en" | "de"
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule,NgbNavModule, BattleTrackerComponent],
  templateUrl: "./app.component.html"
})

export class AppComponent implements OnInit
{
  title = "Battle Tracker";

  public supportedLanguages: LanguageEntry[] = [];

  constructor(private _translate: TranslateService, public versionService: VersionService) {}

  ngOnInit()
  {
    this.versionService.loadVersion();

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
