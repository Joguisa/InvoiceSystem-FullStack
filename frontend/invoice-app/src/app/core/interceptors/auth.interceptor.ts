import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const token = authService.getToken();

  const currentLang = localStorage.getItem('sg_ia_language') || 'es';

  const headers: { [key: string]: string } = {
    'Accept-Language': currentLang
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  req = req.clone({ setHeaders: headers });

  return next(req);
};
