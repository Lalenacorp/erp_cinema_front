import { useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export function useWebSocket(projectId: string, onMessage: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Session expirée');
        authService.logout();
        return;
      }

     
      wsRef.current = new WebSocket(`ws://13.38.119.12/ws/project/${projectId}/`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connecté');
        reconnectAttemptsRef.current = 0;
        
        
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'authentication',
            token: token
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', data);
          onMessage(data);
        } catch (error) {
          console.error('Erreur de parsing WebSocket:', error);
        }
      };

      wsRef.current.onclose = async (event) => {
        console.log('WebSocket déconnecté:', event.code, event.reason);
        
        if (event.code === 4001) {
          toast.error('Erreur d\'authentification WebSocket');
          return;
        }

        if (event.code === 1006) {
          try {
            const newTokens = await authService.refreshAccessToken();
            if (newTokens) {
              // Reconnecter avec le nouveau token
              setTimeout(connect, 1000);
              return;
            }
          } catch (error) {
            console.error('Erreur de rafraîchissement du token:', error);
          }
        }

        
        if (event.code !== 1000 && event.code !== 1001) {
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            console.log(`Tentative de reconnexion dans ${delay}ms (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(connect, delay);
          } else {
            toast.error('La connexion a été perdue. Veuillez rafraîchir la page.');
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

    } catch (error) {
      console.error('Erreur de création WebSocket:', error);
      toast.error('Erreur de connexion au serveur');
    }
  }, [projectId, onMessage]);

  useEffect(() => {
    if (projectId) {
      connect();
    }

    return () => {
      if (wsRef.current) {
      
        wsRef.current.close(1000, 'Fermeture normale');
        wsRef.current = null;
      }
    };
  }, [projectId, connect]);

  const send = useCallback((message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('La connexion n\'est pas disponible');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Erreur d\'envoi:', error);
      toast.error('Erreur d\'envoi du message');
      return false;
    }
  }, []);

  return { send, readyState: wsRef.current?.readyState };
}