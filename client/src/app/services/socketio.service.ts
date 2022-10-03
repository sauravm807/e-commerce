import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;
  userId: any;
  private onlineUsers = new BehaviorSubject([]);
  onlineUsersMessage = this.onlineUsers.asObservable();

  constructor(private authService: AuthService) {
    this.authService.userDataMessage.subscribe({
      next: (res: any) => {
        this.userId = res.id
      }
    });
  }

  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT_MYSQL);
    this.socket.on("connect", () => {
      this.socket.emit('joinUser', this.userId);
    });
    this.getOnlineUsers();
  }

  disconnect() {
    this.getOnlineUsers();
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  logoutAll() {
    this.socket.emit("logout all", this.userId);
  }

  getOnlineUsers() {
    this.socket.on("update users", (users: any) => {
      this.onlineUsers.next(users);
    });
  }
}
