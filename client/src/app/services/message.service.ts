import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

    // URL: string = environment.DEV_URL_MONGO;
  // BASE_URL: string = environment.DEV_BASEURL_MONGO;
  URL: string = environment.DEV_URL_MYSQL;
  BASE_URL: string = environment.DEV_BASEURL_MYSQL;

  constructor(private http: HttpClient) { }

  getLatestMessageListUser(): Observable<any> {
    return this.http.get(`${this.URL}/user/chat/chatlist`);
  }

  getMessageByChatId(chatId: any): Observable<any> {
    return this.http.get(`${this.URL}/user/chat/messages/${chatId}`);
  }

  getMessageByUserId(userId: any) : Observable<any> {
    return this.http.get(`${this.URL}/user/chat/get/messages/${userId}`);
  }
}
