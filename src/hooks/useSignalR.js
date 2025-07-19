import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr'; 
import { API_BASE_URL } from '../config/api';
const SIGNALR_HUB_URL = `${API_BASE_URL.replace('/api','')}/chatHub`;

export const useSignalR = (userId, token, onReceiveMessage, onChatUpdated) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);

  const onReceiveMessageRef = useRef(onReceiveMessage);
  const onChatUpdatedRef = useRef(onChatUpdated);

  useEffect(() => {
      onReceiveMessageRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
      onChatUpdatedRef.current = onChatUpdated;
  }, [onChatUpdated]);

  useEffect(() => {
    if (!userId || !token) {
      console.warn("SignalR: userId or token not available, skipping connection.");
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_HUB_URL)
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.elapsedMilliseconds < 60000) {
                return [0, 2000, 10000, 30000][retryContext.previousRetryCount];
            }
            return null;
            }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connectionRef.current = newConnection;

    newConnection.on("ReceiveMessage", (message) => {
      //console.log("Received message from SignalR:", message);
      //onReceiveMessage(message);
      onReceiveMessageRef.current(message);
    });

    newConnection.on("ChatUpdated", (chatUpdate) => {
      console.log("Chat update from SignalR:", chatUpdate);
      //onChatUpdated(chatUpdate);
    });

    newConnection.on("ChatOpenedConfirmation", (chatId) => {
        //console.log(`Hub confirmed agent opened chat: ${chatId}`);
    });

    newConnection.on("ChatClosedConfirmation", () => {
        //console.log(`Hub confirmed agent closed chat.`);
    });

    newConnection.on("Connected", (message) => {
        console.log(message);
    });

    newConnection.onreconnected(connectionId => {
      console.log(`SignalR Reconnected: ${connectionId}`);
      setIsConnected(true);
      setError(null); 
      if (userId && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
          connectionRef.current.invoke("ConnectToService", userId, "chat")
              .catch(err => console.error("Error re-registering agent on reconnect:", err));
      }
    });

    newConnection.onreconnecting(error => {
      console.warn(`SignalR Reconnecting: ${error}`);
      setIsConnected(false); 
      setError("Reconnecting...");
    });

    newConnection.onclose(error => {
      console.warn(`SignalR Connection closed: ${error}`);
      setIsConnected(false);
      setError("Connection closed. Attempting to reconnect...");
    });

    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log("SignalR Connected.");
        setIsConnected(true);
        setError(null);
        await newConnection.invoke("ConnectToService", userId, "chat");
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        setError("Failed to connect to real-time updates. " + (err.message || "Please refresh."));
        setIsConnected(false);
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
        console.log("SignalR Disconnecting...");
        connectionRef.current.stop();
      }
      connectionRef.current = null;
    };
  }, [userId, token]); 

  const agentOpenedChat = useCallback(async (chatId, agentId) => {
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
          try {
              await connectionRef.current.invoke("AgentJoinedChat", chatId, agentId);
          } catch (err) {
              console.error(`[SignalR] Error invoking AgentJoinedChat for chat ${chatId}:`, err);
          }
      } else {
          console.warn("SignalR connection not active, cannot invoke AgentJoinedChat.");
      }
  }, []);

  const agentClosedChat = useCallback(async (agentId, chatId) => {
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
          try {
            await connectionRef.current.invoke("AgentLeftChat", agentId, chatId);
          } catch (err) {
              console.error("Error invoking AgentLeftChat:", err);
          }
      } else {
          console.warn("SignalR connection not active, cannot invoke AgentLeftChat.");
      }
  }, []);

  return { isConnected, error, agentOpenedChat, agentClosedChat };
};
