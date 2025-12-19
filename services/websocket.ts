/**
 * NetShield WebSocket Service
 * Real-time alert streaming from IDS backend via native WebSocket
 */

import { Alert } from './api';

// WebSocket URL - change to your server IP:port
const WS_URL = 'wss://ollie-unpersecuting-florencio.ngrok-free.dev/ws'; // Your FastAPI WebSocket endpoint

export type AlertCallback = (alert: Alert) => void;
export type DashboardUpdateCallback = (data: any) => void;
export type ConnectionCallback = (connected: boolean) => void;

interface WebSocketMessage {
  type: 'initial' | 'new_alert' | 'status_change' | 'clear' | 'keepalive';
  data?: any;
  alert?: any;
  is_running?: boolean;
  interface?: string;
  timestamp?: string;
  stats?: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = WS_URL;
  private alertCallbacks: Set<AlertCallback> = new Set();
  private dashboardCallbacks: Set<DashboardUpdateCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isIntentionalClose = false;

  connect(url: string = WS_URL) {
    this.url = url;
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isIntentionalClose = false;
    this.createWebSocket();
  }

  private createWebSocket() {
    try {
      console.log('Connecting to WebSocket:', this.url);
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnection(true);
        this.startPingInterval();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.notifyConnection(false);
        this.stopPingInterval();
        
        // Auto-reconnect if not intentionally closed
        if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          // Handle plain text messages (like 'pong' responses)
          if (typeof event.data === 'string' && event.data === 'pong') {
            // Ignore pong responses
            return;
          }
          
          // Parse JSON messages
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket message received:', message.type);
    
    switch (message.type) {
      case 'initial':
        // Initial dashboard data when first connected
        if (message.data) {
          this.notifyDashboardCallbacks(message.data);
        }
        break;
        
      case 'new_alert':
        // New alert received
        if (message.alert) {
          const alert = this.transformAlert(message.alert);
          this.notifyAlertCallbacks(alert);
          
          // Also notify dashboard callbacks with stats update
          if (message.stats) {
            this.notifyDashboardCallbacks({
              stats: message.stats,
              timestamp: message.timestamp,
            });
          }
        }
        break;
        
      case 'status_change':
        // IDS started or stopped
        this.notifyDashboardCallbacks({
          is_running: message.is_running,
          interface: message.interface,
          timestamp: message.timestamp,
        });
        break;
        
      case 'clear':
        // All alerts cleared
        this.notifyDashboardCallbacks({
          cleared: true,
          timestamp: message.timestamp,
        });
        break;
        
      case 'keepalive':
        // Server keepalive, just ignore
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Transform backend alert to frontend Alert format
   */
  private transformAlert(alert: any): Alert {
    return {
      id: this.generateAlertId(alert),
      timestamp: alert.timestamp,
      signature: alert.signature || 'Unknown Signature',
      category: alert.category || 'Unknown',
      severity: alert.severity_tag as 'high' | 'medium' | 'low',
      srcIp: alert.src_ip || '',
      srcPort: parseInt(alert.src_port) || 0,
      destIp: alert.dest_ip || '',
      destPort: parseInt(alert.dest_port) || 0,
      protocol: 'TCP',
      action: 'alert',
    };
  }

  /**
   * Generate unique ID for alert
   */
  private generateAlertId(alert: any): string {
    const random = Math.random().toString(36).substring(2, 9);
    return `${alert.timestamp}_${alert.src_ip}_${alert.src_port}_${alert.dest_ip}_${alert.dest_port}_${random}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Start sending ping messages every 25 seconds to keep connection alive
   */
  private startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 25000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.createWebSocket();
    }, delay);
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

  private notifyDashboardCallbacks(data: any) {
    this.dashboardCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in dashboard callback:', error);
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

  // Subscribe to dashboard updates (stats, status changes, etc.)
  onDashboardUpdate(callback: DashboardUpdateCallback) {
    this.dashboardCallbacks.add(callback);
    
    return () => {
      this.dashboardCallbacks.delete(callback);
    };
  }

  // Subscribe to connection status changes
  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback);
    
    // Immediately notify current status
    if (this.ws) {
      callback(this.ws.readyState === WebSocket.OPEN);
    }
    
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  disconnect() {
    this.isIntentionalClose = true;
    this.stopPingInterval();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Manually trigger reconnection
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect(this.url);
  }

  // Update WebSocket URL
  setUrl(url: string) {
    const wasConnected = this.isConnected();
    this.url = url;
    
    if (wasConnected) {
      this.reconnect();
    }
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
