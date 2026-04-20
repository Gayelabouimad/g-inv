import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser.pipe(
    filter((user) => user !== undefined),
    take(1),
    timeout(5000),
    map((user) => {
      if (user) {
        return true;
      }
      return router.createUrlTree(['/admin/login']);
    }),
    catchError(() => of(router.createUrlTree(['/admin/login'])))
  );
};

