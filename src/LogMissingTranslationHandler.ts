import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LogMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    // Log, fallback, or return a custom string
    console.warn(`Missing translation for key: ${params.key}`);
    return `??${params.key}??`;
  }
}
