import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  URL: string = environment.DEV_URL_MONGO;

  constructor(private http: HttpClient) { }

  uploadProfilePic(imageData: any): Observable<any> {
    return this.http.post(`${this.URL}/user/upload/propic`, imageData);
  }
}
