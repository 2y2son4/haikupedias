import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LexiconComponent } from './pages/lexicon/lexicon.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  { path: 'lexicon', component: LexiconComponent },
  { path: '**', redirectTo: '' },
];
