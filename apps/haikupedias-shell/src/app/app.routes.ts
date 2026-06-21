import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LexiconComponent } from './pages/lexicon/lexicon.component';
import { ProjectComponent } from './pages/project/project.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  { path: 'lexicon', component: LexiconComponent },
  { path: 'project', component: ProjectComponent },
  { path: '**', redirectTo: '' },
];
