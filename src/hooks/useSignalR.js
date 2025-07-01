import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr'; 
import {API_BASE_URL as API_URL} from '../config/api';
const SIGNALR_HUB_URL = `${API_URL.replace('/api','')}/chatHub`;

export const useSignalR = (userId, token, onReceiveMessage, onChatUpdated) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);

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
      console.log("Received message from SignalR:", message);
      onReceiveMessage(message);
    });

    newConnection.on("ChatUpdated", (chatUpdate) => {
      console.log("Chat update from SignalR:", chatUpdate);
      onChatUpdated(chatUpdate);
    });

    newConnection.onreconnected(connectionId => {
      console.log(`SignalR Reconnected: ${connectionId}`);
      setIsConnected(true);
      setError(null); 
    });

    newConnection.onreconnecting(error => {
      console.warn(`SignalR Reconnecting: ${error}`);
      setIsConnected(false); 
      setError("Reconnecting...");
    });

    newConnection.onclose(error => {
      console.error(`SignalR Connection closed: ${error}`);
      setIsConnected(false);
      setError("Connection closed. Attempting to reconnect...");
    });


    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log("SignalR Connected.");
        setIsConnected(true);
        setError(null);
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
  }, [userId, token, onReceiveMessage, onChatUpdated]); 

  return { isConnected, error };
};
