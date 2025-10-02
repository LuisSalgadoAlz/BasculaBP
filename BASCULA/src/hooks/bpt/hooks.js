import { useState, useEffect } from "react";
import { URLWEBSOCKET } from "../../constants/global";

export const useManifiestosSocket = () => {
    const DEFINE_URLWEBSOCKET = `${URLWEBSOCKET}/manifiestos`;
      const [manifiestos, setManifiestos] = useState([]);
      const [connectionStatus, setConnectionStatus] = useState('connecting');
      
      useEffect(() => {
        const socket = new WebSocket(DEFINE_URLWEBSOCKET); 
        
        socket.onopen = () => {
          console.log('WebSocket conectado');
          setConnectionStatus('connected');
        };
        
        socket.onmessage = (event) => {
          try {
            const newManifiestos = JSON.parse(event.data);
            if (Array.isArray(newManifiestos)) {
              setManifiestos(newManifiestos);
              setConnectionStatus('connected'); 
            }
          } catch (error) {
            console.error('Error parseando datos:', error);
            setConnectionStatus('error');
          }
        };
    
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
        };
    
        socket.onclose = () => {
          console.log('WebSocket cerrado');
          setConnectionStatus('closed');
        };
    
        return () => {
          socket.close();
        };
      }, [DEFINE_URLWEBSOCKET]);
    
      return {
        manifiestos,
        connectionStatus,
      };
}