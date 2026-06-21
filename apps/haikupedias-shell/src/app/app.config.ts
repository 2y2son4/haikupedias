import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideMarkdown({ loader: HttpClient }) 
  ],
};
