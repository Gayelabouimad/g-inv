import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { InviteeService } from '../services/invitee.service';
import { EVENT_CONFIG } from '../data/event.data';

export const guestIdGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const inviteeService = inject(InviteeService);
  const guestId = route.paramMap.get('guestId');

  if (!guestId) {
    return true; // Allow empty route (home page)
  }

  try {
    // Check if this is a valid guest ID by loading from Firestore
    const invitee = await inviteeService.getInvitee(guestId, EVENT_CONFIG.eventSlug);

    if (!invitee) {
      // Invalid guest ID - redirect to 404 using replaceUrl to avoid history
      router.navigate(['/404'], { replaceUrl: true });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating guest ID:', error);
    // On error, allow navigation but let the component handle the error
    return true;
  }
};

