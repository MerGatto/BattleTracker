// app/translate/translation.ts

import { OpaqueToken } from '@angular/core';

// translation token
export const TRANSLATIONS = new OpaqueToken('translations');

const dictionary = require("./dictionary.json")

// providers
export const TRANSLATION_PROVIDERS = [
	{ provide: TRANSLATIONS, useValue: dictionary },
];