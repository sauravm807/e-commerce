import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // URL: string = environment.DEV_URL_MONGO;
  URL: string = environment.DEV_URL_MYSQL;
  constructor(private authService: AuthService, private http: HttpClient, private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getAccessToken();
    const authRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next.handle(authRequest)
      .pipe(catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          const refreshToken = this.authService.getRefreshToken();
          if (refreshToken) {
            return this.http.post(`${this.URL}/user/get/tokens`, { token: refreshToken })
              .pipe(
                switchMap((res: any) => {
                  this.authService.saveToken(res.token);
                  return next.handle(request.clone({
                    headers: request.headers.set('Authorization', `Bearer ${res.token.accessToken}`)
                  }));
                }),
                catchError((err: HttpErrorResponse) => {
                  this.authService.removeTokens();
                  this.router.navigate(['/login']);
                  return throwError(() => err);
                })
              );
          }
        }
        return throwError(() => err);
      }));
  }
}
