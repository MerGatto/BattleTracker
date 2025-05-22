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
  private _currentLang: "en" | "de" = "en";

  private _logMissingTranslations: boolean = true;

  public use(lang: "en" | "de"): void
  {
    // set current language
    this._currentLang = lang;
  }

  public instant(key: string)
  {
    // public perform translation
    return this.translate(key as keyof typeof translations);
  }

  private translate(key: keyof typeof translations): string
  {
    let translationKey: keyof typeof translations
    translationKey = <keyof typeof translations>key
    // private perform translation
    let translation = key;

    if (translations[translationKey] && translations[key][this.currentLang])
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
