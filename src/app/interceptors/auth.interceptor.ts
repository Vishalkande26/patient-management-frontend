import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    const token =
      localStorage.getItem('token');

    /*
     * Login and registration do not need JWT.
     */
    if (
      req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/register')
    ) {
      return next(req);
    }

    /*
     * Add JWT to every protected API request.
     */
    if (token) {

      const authReq =
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

      console.log(
        'Authorization header added:',
        req.url
      );

      return next(authReq);
    }

    /*
     * No token available.
     */
    console.warn(
      'No JWT token found for request:',
      req.url
    );

    return next(req);
  };