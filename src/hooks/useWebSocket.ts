import { useState, useEffect, useRef } from 'react';
import { WebSocketService } from '../services/webSocketService';
import type { ExpenseUpdateResponse } from '../types/expense';

export function useWebSocket(projectId: string, onMessage: (data: ExpenseUpdateResponse) => void) {
  const wsRef = useRef<WebSocketService | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  useEffect(() => {
    // Créer une nouvelle instance WebSocketService
    wsRef.current = new WebSocketService(projectId);
    
    // Ajouter le listener de messages
    wsRef.current.addMessageListener(onMessage);
    
    // Se connecter
    wsRef.current.connect();

    // Mettre à jour l'état de la connexion toutes les secondes
    const interval = setInterval(() => {
      if (wsRef.current) {
        setReadyState(wsRef.current.getReadyState());
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [projectId, onMessage]);

/*   const updateExpense = (subactivityId: number, amountSpent: number, name: string): boolean => {
    if (!wsRef.current) return false;

    return wsRef.current.updateExpense(subactivityId, amountSpent, name);
  }; */

 
  
  

  const deleteExpense = (expenseId: number): boolean => {
    if (!wsRef.current) return false;

    return wsRef.current.deleteExpense(expenseId);
  };

  return {
   
    deleteExpense,
    readyState,
    isConnected: readyState === WebSocket.OPEN
  };
}
