import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;
  userId: any;
  constructor(private authService: AuthService) {
    this.authService.userDataMessage.subscribe({
      next: (res: any) => {
        this.userId = res.id
      }
    });
  }

  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT_MYSQL);
    this.socket.emit('my message', this.userId);
    this.socket.on("connect", () => {
      console.log(this.socket.id)
    });
    // this.socket.on('my broadcast', (data: string) => {
    //   console.log(data);
    // });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
