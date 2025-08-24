import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private readonly serverUrl = 'http://localhost:4000';

  constructor() {
    this.socket = io(this.serverUrl, {
      withCredentials: true,
      autoConnect: false
    });
  }

  connect(userId: string) {
    this.socket.auth = { userId };
    this.socket.connect();
    this.socket.emit('set-user-id', userId);
  }

  createRoom(): Observable<string> {
    this.socket.emit('create-room');
    return new Observable<string>(observer => {
      this.socket.once('room-created', (roomCode: string) => {
        observer.next(roomCode);
        observer.complete();
      });
    });
  }

  joinRoom(roomCode: string): Observable<{ roomId: string; messages: Message[] }> {
    this.socket.emit('join-room', JSON.stringify({ roomId: roomCode }));
    return new Observable((observer) => {
      this.socket.once('joined-room', (data) => {
        observer.next(data);
        observer.complete();
      });
      this.socket.once('error', (err) => observer.error(err));
    });
  }

  sendMessage(roomCode: string, message: string, userId: string, name: string) {
    this.socket.emit('send-message', { roomCode, message, userId, name });
  }

  onNewMessage(): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socket.on('new-message', (msg: Message) => observer.next(msg));
    });
  }

  onUserJoined(): Observable<number> {
    return new Observable<number>(observer => {
      this.socket.on('user-joined', (count: number) => observer.next(count));
    });
  }

  onUserLeft(): Observable<number> {
    return new Observable<number>(observer => {
      this.socket.on('user-left', (count: number) => observer.next(count));
    });
  }
}
