import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpStatus } from '../constants/http-status.constants';
import { ErrorHandlerService } from '../services/error-handler.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/auth/login');

      if (error.status === HttpStatus.UNAUTHORIZED && !isLoginRequest) {
        authService.logout();
        router.navigate(['/login']);
      } else if (!isLoginRequest) {
        errorHandler.handle(error);
      }

      return throwError(() => error);
    })
  );
};