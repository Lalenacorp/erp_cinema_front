import { authService } from './authService';
import toast from 'react-hot-toast';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageCallbacks: ((data: any) => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pingTimeout: NodeJS.Timeout | null = null;

  constructor(private projectId: string) {}

  async connect() {
    try {
      let token = authService.getToken();
      
      // Vérifier si le token est expiré
      if (!token || authService.isTokenExpired(token)) {
        const newTokens = await authService.refreshAccessToken();
        if (!newTokens) {
          throw new Error('Token non disponible');
        }
        token = newTokens.access;
      }

      // Fermer la connexion existante si elle existe
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      // Créer une nouvelle connexion avec le token dans l'URL
      this.socket = new WebSocket(`ws://13.38.119.12/ws/project/${this.projectId}/?token=${token}`);

      this.socket.onopen = () => {
        console.log('WebSocket connecté');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Gérer les pongs du serveur
          if (data.type === 'pong') {
            this.resetPingTimeout();
            return;
          }

          console.log('Message WebSocket reçu:', data);
          this.messageCallbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('Erreur de parsing WebSocket:', error);
        }
      };

      this.socket.onclose = async (event) => {
        console.log('WebSocket déconnecté:', event.code, event.reason);
        this.stopHeartbeat();
        
        if (event.code === 4001) {
          // Tenter de rafraîchir le token et de se reconnecter
          try {
            const newTokens = await authService.refreshAccessToken();
            if (newTokens) {
              setTimeout(() => this.connect(), 1000);
              return;
            }
          } catch (error) {
            console.error('Erreur de rafraîchissement du token:', error);
          }
          authService.logout();
          return;
        }
        
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

    } catch (error) {
      console.error('Erreur de création WebSocket:', error);
      toast.error('Erreur de connexion au serveur');
    }
  }

  private startHeartbeat() {
    // Envoyer un ping toutes les 30 secondes
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
        this.setPingTimeout();
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  private setPingTimeout() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }
    
    // Si pas de pong reçu dans les 5 secondes, fermer la connexion
    this.pingTimeout = setTimeout(() => {
      if (this.socket) {
        this.socket.close();
      }
    }, 5000);
  }

  private resetPingTimeout() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  private async refreshTokenAndReconnect() {
    try {
      const newTokens = await authService.refreshAccessToken();
      if (newTokens) {
        if (this.socket) {
          this.socket.close(1000, 'Token refreshed');
        }
        setTimeout(() => this.connect(), 1000);
      } else {
        console.error('Échec du rafraîchissement du token');
        authService.logout();
      }
    } catch (error) {
      console.error('Erreur de rafraîchissement du token:', error);
      authService.logout();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Tentative de reconnexion dans ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Nombre maximum de tentatives de reconnexion atteint');
      toast.error('Impossible de rétablir la connexion');
    }
  }

  addMessageListener(callback: (data: any) => void) {
    this.messageCallbacks.push(callback);
  }

  removeMessageListener(callback: (data: any) => void) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Fermeture normale');
      this.socket = null;
    }
    
    this.messageCallbacks = [];
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  send(message: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      toast.error('La connexion n\'est pas disponible');
      return false;
    }

    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Erreur d\'envoi:', error);
      toast.error('Erreur d\'envoi du message');
      return false;
    }
  }

  getReadyState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  updateExpense(subactivityId: number, amountSpent: number, name: string): boolean {
    return this.send({
      action: 'update_expense',
      subactivity_id: subactivityId,
      amount_spent: amountSpent,
      name: name
    });
  }

  deleteExpense(expenseId: number): boolean {
    return this.send({
      action: 'delete_expense',
      expense_id: expenseId
    });
  }
}