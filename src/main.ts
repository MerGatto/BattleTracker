/// <reference types="@angular/localize" />
import { enableProdMode, importProvidersFrom } from "@angular/core";
import { environment } from "./environments/environment";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "app/app.component";
import {provideHttpClient, withNoXsrfProtection} from '@angular/common/http';
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";

if (environment.production)
{
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withNoXsrfProtection()),
    importProvidersFrom(NgbNavModule)]
}).catch(err => console.error(err));
