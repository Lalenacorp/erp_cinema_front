import React, { useState, useEffect, useRef } from 'react';
import { expenseService } from '../services/expenseService';
import type { Expense, ExpenseUpdateResponse } from '../types/expense';
import { formatCurrency } from '../utils/formatters';
import { Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

interface ExpenseListProps {
  projectId: string;
  onExpenseUpdate: (data: ExpenseUpdateResponse) => void;
}

export function ExpenseList({ projectId, onExpenseUpdate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    loadExpenses();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Fermeture normale');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [projectId]);

  const connectWebSocket = () => {
    const token = authService.getToken();
    if (!token) {
      setError('Non authentifié');
      return;
    }

    try {
      // Utiliser wss:// pour une connexion sécurisée
      wsRef.current = new WebSocket(`wss://13.38.119.12/ws/project/${projectId}/`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connecté');
        reconnectAttemptsRef.current = 0;
        
        // Envoyer le token immédiatement après la connexion
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
          
          if (data.error) {
            toast.error(data.error);
            return;
          }
          
          onExpenseUpdate(data);
          loadExpenses(); // Recharger les dépenses après une mise à jour
        } catch (error) {
          console.error('Erreur de parsing WebSocket:', error);
        }
      };

      wsRef.current.onclose = async (event) => {
        console.log('WebSocket déconnecté:', event.code, event.reason);
        
        if (event.code === 4001) {
          setError('Erreur d\'authentification WebSocket');
          return;
        }

        // Tenter de rafraîchir le token si la connexion est perdue
        if (event.code === 1006) {
          try {
            const newTokens = await authService.refreshAccessToken();
            if (newTokens) {
              // Reconnecter avec le nouveau token
              setTimeout(connectWebSocket, 1000);
              return;
            }
          } catch (error) {
            console.error('Erreur de rafraîchissement du token:', error);
          }
        }

        // Tenter de se reconnecter si ce n'est pas une fermeture normale
        if (event.code !== 1000 && event.code !== 1001) {
          attemptReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        
        // Vérifier si le token est expiré
        if (token && authService.isTokenExpired(token)) {
          refreshTokenAndReconnect();
        }
      };
    } catch (error) {
      console.error('Erreur de création WebSocket:', error);
      setError('Erreur de connexion WebSocket');
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttemptsRef.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      
      console.log(`Planification de la reconnexion dans ${delay}ms`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Tentative de reconnexion (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
        connectWebSocket();
      }, delay);
    } else {
      setError('Impossible de rétablir la connexion');
      toast.error('La connexion a été perdue. Veuillez rafraîchir la page.');
    }
  };

  const refreshTokenAndReconnect = async () => {
    try {
      const newTokens = await authService.refreshAccessToken();
      if (newTokens) {
        if (wsRef.current) {
          wsRef.current.close(1000, 'Rafraîchissement du token');
        }
        setTimeout(connectWebSocket, 1000);
      } else {
        setError('Session expirée');
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        authService.logout();
      }
    } catch (error) {
      console.error('Erreur de rafraîchissement du token:', error);
      setError('Erreur d\'authentification');
      authService.logout();
    }
  };

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await expenseService.listExpenses(projectId);
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des dépenses');
      toast.error('Erreur lors du chargement des dépenses');
    } finally {
      setIsLoading(false);
    }
  };

  const sendWebSocketMessage = (message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('La connexion n\'est pas disponible');
      return false;
    }

    try {
      console.log('Envoi du message:', message);
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Erreur d\'envoi:', error);
      toast.error('Erreur d\'envoi du message');
      return false;
    }
  };

  const handleUpdateExpense = (subactivityId: number, amount: number) => {
    const message = {
      action: 'update_expense',
      subactivity_id: subactivityId,
      amount_spent: amount
    };

    if (sendWebSocketMessage(message)) {
      console.log('Message de mise à jour envoyé');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Aucune dépense enregistrée
        </p>
      ) : (
        expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{formatCurrency(parseFloat(expense.amount))}</p>
                <p className="text-sm text-gray-500">
                  {new Date(expense.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateExpense(expense.subactivity, parseFloat(expense.amount))}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier la dépense"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}