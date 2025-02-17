import { authService } from './authService';

export class WebSocketService {
  public socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageCallbacks: ((data: any) => void)[] = [];

  constructor(private projectId: string) {}

  connect() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Correction de l'URL WebSocket
    this.socket = new WebSocket(`ws://13.38.119.12/ws/project/${this.projectId}/`);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      
      // Envoyer le token après la connexion
      if (this.socket && token) {
        this.socket.send(JSON.stringify({ token }));
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data); // Ajout de logs
        this.messageCallbacks.forEach(callback => callback(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      
      if (event.code === 4001) {
        console.error('Authentication failed. Not attempting to reconnect.');
        return;
      }
      
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      
      if (token && authService.isTokenExpired(token)) {
        this.refreshTokenAndReconnect();
      }
    };
  }

  private async refreshTokenAndReconnect() {
    try {
      const newTokens = await authService.refreshAccessToken();
      if (newTokens) {
        if (this.socket) {
          this.socket.close();
        }
        this.connect();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      authService.logout();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      window.dispatchEvent(new CustomEvent('websocket-max-retries-reached'));
    }
  }

  addMessageListener(callback: (data: any) => void) {
    this.messageCallbacks.push(callback);
  }

  removeMessageListener(callback: (data: any) => void) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.messageCallbacks = [];
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  send(message: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    try {
      // Ajout de logs pour le débogage
      console.log('Sending WebSocket message:', message);
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getReadyState(): number {
    if (!this.socket) return WebSocket.CLOSED;
    return this.socket.readyState;
  }
}