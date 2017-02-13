import {Injectable, Inject} from '@angular/core';
import { TRANSLATIONS } from './translations'; // import our opaque token

@Injectable()
export class TranslateService {
	private _currentLang: string;
	
	public get currentLang() {
	  return this._currentLang;
	}

  // inject our translations
	constructor(@Inject(TRANSLATIONS) private _translations: any) {
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