import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;
  userId: any;
  onlineUsersList: any = [];
  private onlineUsers = new BehaviorSubject([]);
  onlineUsersMessage = this.onlineUsers.asObservable();

  constructor(private authService: AuthService) {
    this.authService.userDataMessage.subscribe({
      next: (res: any) => {
        this.userId = res.id;
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
    this.socket.emit("logoutAll", this.userId);
  }

  getOnlineUsers() {
    this.socket.on("updateUsers", (usersData: any) => {
      this.onlineUsersList = usersData.users;
      this.onlineUsers.next(usersData);
    });
  }

  sendMessage(data: any, userData: any) {
    this.socket.emit("message", { data, userData });
  }

  getMessages() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('message', (messageData: any) => {
        observer.next(messageData);
      });
    });
  }

  updateSeenMessages(user: any) {
    this.socket.emit("updateSeenMessage", user)
  }

  updateSeenMsg() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('updateSeenMessage', (user: any) => {
        observer.next(user);
      });
    });
  }

  updateConnectedUsers(id1: any, id2: any) {
    this.socket.emit("connectedUser", [id1, id2]);
  }

}
