import { Component } from '@angular/core';
import { TranslateService } from './translate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Battle Tracker';
    
    public translatedText: string;
    public supportedLanguages: any[];
  
    constructor(private _translate: TranslateService) { }

    ngOnInit() {
      // standing data
      this.supportedLanguages = [
        { display: 'English', value: 'en' },
        { display: 'Deutsch', value: 'de' },
      ];
      
      this.selectLang('en');
        
    }
    
    isCurrentLang(lang: string) {
      return lang === this._translate.currentLang;
    }
    
    selectLang(lang: string) {
      // set default;
      this._translate.use(lang);
    }
}
