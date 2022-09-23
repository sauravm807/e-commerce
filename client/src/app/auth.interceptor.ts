import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  URL: string = environment.DEV_URL_MONGO;
  constructor(private authService: AuthService, private http: HttpClient) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getAccessToken();
    const authRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next.handle(authRequest).pipe(catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const refreshToken = this.authService.getRefreshToken();
        const authRequest = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${refreshToken}`)
        });
        // return this.http.get(`${this.URL}/user/get/tokens`).subscribe((res: any) => {
        //   this.authService.removeTokens();
        //   this.authService.saveToken(res.data.token);
        // })
      }

      return throwError(() => err);
    }));
  }
}
