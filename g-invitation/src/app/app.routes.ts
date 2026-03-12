import { Routes } from '@angular/router';
import { InvitationPageComponent } from './pages/invitation-page/invitation-page.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { NotFoundComponent } from './pages/not-found.component';

export const routes: Routes = [
  { path: 'admin', component: AdminPanelComponent },
  { path: '', component: InvitationPageComponent },
  { path: ':eventSlug', component: InvitationPageComponent },
  { path: ':eventSlug/:routeSlug', component: InvitationPageComponent },
  { path: '**', component: NotFoundComponent },
];
