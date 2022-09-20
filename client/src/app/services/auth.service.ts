import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  URL: string = environment.DEV_URL_MONGO;
  constructor(private http: HttpClient) { }

  userLogin(data: any) {
    return this.http.post(`${this.URL}/user/login`, data);
  }
}
