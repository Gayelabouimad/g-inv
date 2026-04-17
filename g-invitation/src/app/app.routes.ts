import { Routes } from '@angular/router';
import { InvitationPageComponent } from './pages/invitation-page/invitation-page/invitation-page.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { guestIdGuard } from './guards/guest-id.guard';

export const routes: Routes = [
  { path: 'admin', component: AdminPanelComponent },
  { path: '404', component: NotFoundComponent },
  { path: '', component: InvitationPageComponent },
  { path: ':guestId', component: InvitationPageComponent, canActivate: [guestIdGuard] },
];
