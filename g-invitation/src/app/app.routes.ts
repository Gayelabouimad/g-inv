import { Routes } from '@angular/router';
import { InvitationPageComponent } from './pages/invitation-page.component';
import { NotFoundComponent } from './pages/not-found.component';

export const routes: Routes = [
  { path: '', component: InvitationPageComponent },
  { path: ':eventSlug', component: InvitationPageComponent },
  { path: ':eventSlug/:routeSlug', component: InvitationPageComponent },
  { path: '**', component: NotFoundComponent },
];
