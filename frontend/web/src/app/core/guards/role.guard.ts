import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const user = inject(AuthService).currentUser();
  return user && roles.includes(user.role)
    ? true
    : inject(Router).createUrlTree(['/login']);
};
