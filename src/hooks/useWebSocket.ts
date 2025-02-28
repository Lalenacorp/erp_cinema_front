import { useState, useEffect, useCallback, useRef } from 'react';
import { ExpenseUpdateResponse } from '../types/expense';
import toast from 'react-hot-toast';

export const useWebSocket = (projectId: string, onUpdate: (data: ExpenseUpdateResponse) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const pingTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const PING_INTERVAL = 30000; // Envoyer un ping toutes les 30 secondes
  const PING_TIMEOUT = 5000; // Attendre 5 secondes pour un pong
  const RECONNECT_DELAY = 1000; // Tenter de se reconnecter après 1 seconde

  const connect = useCallback(() => {
    // Nettoyer les intervalles existants
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    // Fermer la connexion existante si elle existe
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = localStorage.getItem('auth_token');
    const ws = new WebSocket(`ws://13.38.119.12/ws/project/${projectId}/?token=${token}`);

    const startPingInterval = () => {
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
          
          // Définir un timeout pour la réponse pong
          pingTimeoutRef.current = setTimeout(() => {
            console.log('Pas de pong reçu, reconnexion...');
            ws.close();
          }, PING_TIMEOUT);
        }
      }, PING_INTERVAL);
    };

    ws.onopen = () => {
      console.log('✅ WebSocket connecté');
      setIsConnected(true);
      startPingInterval();
    };

    ws.onclose = () => {
      console.log('🔒 WebSocket fermé, tentative de reconnexion...');
      setIsConnected(false);
      
      // Nettoyer les intervalles
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
      
      // Tenter de se reconnecter immédiatement
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Tentative de reconnexion...');
        connect();
      }, RECONNECT_DELAY);
    };

    ws.onerror = (error) => {
      console.error('❌ Erreur WebSocket:', error);
      // Ne pas fermer ici, laisser onclose gérer la reconnexion
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Gérer les messages de type pong
        if (data.type === 'pong') {
          if (pingTimeoutRef.current) {
            clearTimeout(pingTimeoutRef.current);
          }
          return;
        }

        // Gérer les autres messages
        onUpdate(data);
      } catch (error) {
        console.error('Erreur lors du traitement du message:', error);
      }
    };

    wsRef.current = ws;

    // Garder la connexion active même si l'onglet est en arrière-plan
    window.addEventListener('beforeunload', () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    return ws;
  }, [projectId, onUpdate]);

  useEffect(() => {
    const ws = connect();

    return () => {
      // Nettoyage lors du démontage du composant
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    
    // Si la connexion est fermée, tenter de se reconnecter
    connect();
    toast.error('Tentative de reconnexion au serveur...');
    return false;
  }, [connect]);

  const deleteExpense = useCallback((expenseId: number) => {
    return sendMessage({
      action: 'delete_expense',
      expense_id: expenseId
    });
  }, [sendMessage]);

  return {
    isConnected,
    sendMessage,
    deleteExpense,
    reconnect: connect
  };
};