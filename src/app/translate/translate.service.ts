import {Injectable, Inject} from "@angular/core";
import translations from "./dictionary.json"

@Injectable({
  providedIn: 'root'
})
export class TranslateService
{

  public get currentLang()
  {
    return this._currentLang;
  }
  private _currentLang: string;

  private _logMissingTranslations: boolean = true;

  public use(lang: string): void
  {
    // set current language
    this._currentLang = lang;
  }

  public instant(key: string)
  {
    // public perform translation
    return this.translate(key);
  }

  private translate(key: string): string
  {
    // private perform translation
    let translation = key;

    if (translations[key] && translations[key][this.currentLang])
    {
      return translations[key][this.currentLang];
    } else
    {
      if (this._logMissingTranslations)
      {
        console.log("no translation for " + key);
      }
    }

    return translation;
  }
}
