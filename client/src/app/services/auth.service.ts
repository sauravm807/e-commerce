import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL: string = environment.DEV_URL_MONGO;
  // BASEURL: string = environment.DEV_BASEURL_MONGO;
  URL: string = environment.DEV_URL_MYSQL;
  BASEURL: string = environment.DEV_BASEURL_MYSQL;
  userData = new BehaviorSubject({});
  userDataMessage = this.userData.asObservable();

  constructor(private http: HttpClient) { }

  saveToken(tokens: any) {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }

  removeTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  userLogin(data: any): Observable<any> {
    return this.http.post(`${this.URL}/user/login`, data);
  }

  getUserLoggedInData(): Observable<any> {
    return this.http.get(`${this.URL}/user/me`);
  }

  userLogout() {
    return this.http.delete(`${this.URL}/user/logout`);
  }

  userLogoutAllDevices() {
    return this.http.delete(`${this.URL}/user/logout/all-tokens`);
  }
}
