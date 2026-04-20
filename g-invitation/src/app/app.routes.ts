import { Routes } from '@angular/router';
import { InvitationPageComponent } from './pages/invitation-page/invitation-page/invitation-page.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { TableOrganizerComponent } from './pages/admin-panel/table-organizer/table-organizer.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LoginComponent } from './pages/login/login.component';
import { guestIdGuard } from './guards/guest-id.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [authGuard] },
  { path: 'admin/tables', component: TableOrganizerComponent, canActivate: [authGuard] },
  { path: '404', component: NotFoundComponent },
  { path: '', component: InvitationPageComponent, canActivate: [authGuard] },
  { path: ':guestId', component: InvitationPageComponent, canActivate: [guestIdGuard] },
];
