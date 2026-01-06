import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LexiconComponent } from './pages/lexicon/lexicon.component';
import { AudioTestComponent } from './pages/audio-test/audio-test.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  { path: 'lexicon', component: LexiconComponent },
  { path: 'audio-test', component: AudioTestComponent },
  { path: '**', redirectTo: '' },
];
