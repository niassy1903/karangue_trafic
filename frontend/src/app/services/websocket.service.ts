import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  private messageSubject = new Subject<string>();

  constructor() {
    this.connect();
  }

  // Établir la connexion WebSocket
  private connect() {
    this.socket = new WebSocket('ws://localhost:3000'); // Remplace par l'URL de ton serveur WebSocket

    this.socket.onopen = () => {
      console.log('Connexion WebSocket établie.');
    };

    this.socket.onmessage = (event) => {
      this.messageSubject.next(event.data);
    };

    this.socket.onclose = () => {
      console.log('Connexion WebSocket fermée.');
      setTimeout(() => this.connect(), 5000); // Reconnexion après 5 secondes
    };

    this.socket.onerror = (error) => {
      console.error('Erreur WebSocket :', error);
    };
  }

  // Écouter les messages du serveur
  public onMessage(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  // Envoyer un message au serveur
  public sendMessage(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket non connecté.');
    }
  }
}