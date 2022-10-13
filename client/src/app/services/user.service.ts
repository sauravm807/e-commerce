import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // URL: string = environment.DEV_URL_MONGO;
  // BASE_URL: string = environment.DEV_BASEURL_MONGO;
  URL: string = environment.DEV_URL_MYSQL;
  BASE_URL: string = environment.DEV_BASEURL_MYSQL;

  constructor(private http: HttpClient, private router: Router) { }

  reloadComponent() {
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

  handleImageError() {
    return `${this.BASE_URL}/assets/profile_pics/defaultpics/default_user.png`;
  }

  uploadProfilePic(imageData: any): Observable<any> {
    return this.http.post(`${this.URL}/user/upload/propic`, imageData);
  }

  searchUserList(text: string): Observable<any> {
    return this.http.post(`${this.URL}/user/search`, { searchText: text });
  }

}
