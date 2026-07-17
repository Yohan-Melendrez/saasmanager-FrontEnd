import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const token = raw && raw !== 'undefined' && raw !== 'null' ? raw : null;
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};