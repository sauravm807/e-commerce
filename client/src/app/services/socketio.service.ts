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
  onlineUsersList: any = [];
  private onlineUsers = new BehaviorSubject([]);
  onlineUsersMessage = this.onlineUsers.asObservable();
  private chatObs = new BehaviorSubject({});
  chatObsMessage = this.chatObs.asObservable();

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
    this.socket.emit("logoutAll", this.userId);
  }

  getOnlineUsers() {
    this.socket.on("updateUsers", (usersData: any) => {
      this.onlineUsersList = usersData.users;
      this.onlineUsers.next(usersData);
    });
  }

  sendMessage(data: any) {
    this.socket.emit("sendMessage", data);
    this.getMessages();
  }


  getMessages() {
    this.socket.on("createdMessageData", (messageData: any) => {
      console.log("messageData=========")
      if (messageData) {
        this.chatObs.next(messageData);
        return;
      }
    });
  }

}
