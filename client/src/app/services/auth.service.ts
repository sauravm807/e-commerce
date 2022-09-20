import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  URL: string = environment.DEV_URL_MONGO;
  constructor(private http: HttpClient) { }

  saveToken(tokens: any) {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }

  userLogin(data: any): Observable<any> {
    return this.http.post(`${this.URL}/user/login`, data);
  }
}
