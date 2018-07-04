import { Component } from '@angular/core';
import { TranslateService } from './translate';
import { Auth } from './auth';

declare var Auth0Lock;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent
{
  title = 'Battle Tracker';

  public translatedText: string;
  public supportedLanguages: any[];

  constructor(private _translate: TranslateService, private auth: Auth) {}

  ngOnInit()
  {
    // standing data
    this.supportedLanguages = [
      { display: 'English', value: 'en' },
      { display: 'Deutsch', value: 'de' },
    ];

    this.selectLang('en');
  }

  isCurrentLang(lang: string)
  {
    return lang === this._translate.currentLang;
  }

  selectLang(lang: string)
  {
    // set default;
    this._translate.use(lang);
  }
}
