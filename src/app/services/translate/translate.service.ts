import {Injectable} from "@angular/core";
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

  private _logMissingTranslations = true;

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
    const translationKey = key as keyof typeof translations
    // private perform translation
    const translation = key;

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
