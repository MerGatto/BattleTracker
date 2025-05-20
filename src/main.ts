/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { environment } from "./environments/environment";
import { AppModule } from "./app/app.module";
import * as jQuery from "jquery";

if (environment.production)
{
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
