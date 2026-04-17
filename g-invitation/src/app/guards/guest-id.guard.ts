import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { INVITEES } from '../data/invitees.data';

export const guestIdGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const guestId = route.paramMap.get('guestId');

  if (!guestId) {
    return true; // Allow empty route (home page)
  }

  // Check if this is a valid guest ID
  const invitee = INVITEES.find((item) => item.id === guestId);

  if (!invitee) {
    // Invalid guest ID - redirect to 404 using replaceUrl to avoid history
    router.navigate(['/404'], { replaceUrl: true });
    return false;
  }

  return true;
};

