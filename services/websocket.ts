/**
 * NetShield WebSocket Service
 * Real-time alert streaming from IDS backend
 */

import { io, Socket } from 'socket.io-client';
import { Alert } from './api';

const WS_URL = 'http://192.168.1.100:5000'; // Change to your server IP

export type AlertCallback = (alert: Alert) => void;
export type ConnectionCallback = (connected: boolean) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private alertCallbacks: Set<AlertCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string = WS_URL) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.notifyConnection(true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.notifyConnection(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.notifyConnection(false);
      }
    });

    // Listen for new alerts
    this.socket.on('new_alert', (alert: Alert) => {
      console.log('New alert received:', alert.id);
      this.notifyAlertCallbacks(alert);
    });

    // Listen for system updates
    this.socket.on('system_update', (data: any) => {
      console.log('System update:', data);
      // Can emit this to another set of callbacks if needed
    });
  }

  private notifyAlertCallbacks(alert: Alert) {
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  private notifyConnection(connected: boolean) {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  // Subscribe to real-time alerts
  onAlert(callback: AlertCallback) {
    this.alertCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.alertCallbacks.delete(callback);
    };
  }

  // Subscribe to connection status changes
  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback);
    
    // Immediately notify current status
    if (this.socket) {
      callback(this.socket.connected);
    }
    
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Manually trigger reconnection
  reconnect() {
    if (this.socket && !this.socket.connected) {
      this.reconnectAttempts = 0;
      this.socket.connect();
    }
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
