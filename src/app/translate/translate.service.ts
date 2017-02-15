import {Injectable, Inject} from '@angular/core';

@Injectable()
export class TranslateService {
	private _currentLang: string;
	private _translations = require("./dictionary.json")
	
	public get currentLang() {
	  return this._currentLang;
	}

	public use(lang: string): void {
		// set current language
		this._currentLang = lang;
	}

	private translate(key: string): string {
		// private perform translation
		let translation = key;
     
    if (this._translations[key] && this._translations[key][this.currentLang]) {
			return this._translations[key][this.currentLang];
		}

		return translation;
	}

	public instant(key: string) {
		// public perform translation
		return this.translate(key); 
	}
}