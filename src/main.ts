import { enableProdMode, importProvidersFrom } from "@angular/core";
import { environment } from "./environments/environment";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import {provideHttpClient, withNoXsrfProtection} from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { LogMissingTranslationHandler } from 'LogMissingTranslationHandler';
import { MissingTranslationHandler } from '@ngx-translate/core';

// Factory for the loader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

if (environment.production)
{
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withNoXsrfProtection()),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        missingTranslationHandler: {
          provide: MissingTranslationHandler,
          useClass: LogMissingTranslationHandler
        }
      })
    )
  ]
}).catch(err => console.error(err));
