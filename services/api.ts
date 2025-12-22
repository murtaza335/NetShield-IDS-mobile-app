/**
 * NetShield API Service
 * Handles all REST API communications with the IDS backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = 'https://ollie-unpersecuting-florencio.ngrok-free.dev'; // Your FastAPI server
const API_TIMEOUT = 10000;

// Storage keys
const STORAGE_KEYS = {
  API_URL: '@netshield_api_url',
  AUTH_TOKEN: '@netshield_auth_token',
};

class IDSApiService {
  private client: AxiosInstance;
  private baseURL: string = API_BASE_URL;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.message);
        return Promise.reject(this.normalizeError(error));
      }
    );

    this.loadStoredConfig();
  }

  private async loadStoredConfig() {
    try {
      const storedUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
      if (storedUrl) {
        this.setBaseURL(storedUrl);
      }
    } catch (error) {
      console.error('Failed to load API config:', error);
    }
  }

  private normalizeError(error: AxiosError): APIError {
    if (error.response) {
      const data = error.response.data as any;
      return {
        message: data?.message || error.message,
        status: error.response.status,
        code: error.code,
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    }
    return {
      message: error.message,
      status: 0,
      code: 'UNKNOWN_ERROR',
    };
  }

  async setBaseURL(url: string) {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
    await AsyncStorage.setItem(STORAGE_KEYS.API_URL, url);
  }

  // ===== OVERVIEW / DASHBOARD ENDPOINTS =====
  
  /**
   * Get complete dashboard data (stats, timeline, system status)
   * Maps to: GET /api/dashboard
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await this.client.get('/api/dashboard');
    return this.transformDashboardData(response.data);
  }

  /**
   * Get system status and info
   * Maps to: GET /api/system
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await this.client.get('/api/system');
    return {
      running: response.data.is_running || false,
      status: response.data.is_running ? 'secure' : 'warning',
      riskScore: 0, // Calculate based on alert stats if needed
      lastUpdate: response.data.timestamp || new Date().toISOString(),
      interface: response.data.interface || '',
      uptime: response.data.uptime_seconds || 0,
      connectedClients: response.data.connected_clients || 0,
      ngrokUrl: response.data.ngrok_url || null,
    };
  }

  /**
   * Get dashboard statistics
   * Maps to: GET /api/stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/api/stats');
    const stats = response.data.stats || { total: 0, high: 0, medium: 0, low: 0 };
    return {
      totalAlerts: stats.total || 0,
      highSeverity: stats.high || 0,
      mediumSeverity: stats.medium || 0,
      lowSeverity: stats.low || 0,
      categoryStats: response.data.category_stats || {},
      alertsTimeline: response.data.alerts_timeline || [],
    };
  }

  /**
   * Transform backend dashboard data to frontend format
   */
  private transformDashboardData(data: any): DashboardData {
    const stats = data.stats || { total: 0, high: 0, medium: 0, low: 0 };
    return {
      stats: {
        totalAlerts: stats.total || 0,
        highSeverity: stats.high || 0,
        mediumSeverity: stats.medium || 0,
        lowSeverity: stats.low || 0,
      },
      alertsTimeline: data.alerts_timeline || [],
      categoryStats: data.category_stats || {},
      isRunning: data.is_running || false,
      status: data.status || 'Unknown',
      interface: data.interface || '',
      uptimeSeconds: data.uptime_seconds || null,
      timestamp: data.timestamp || new Date().toISOString(),
      ngrokUrl: data.ngrok_url || null,
    };
  }

  async getAlertTimeline(minutes: number = 60): Promise<TimelineData[]> {
    // Use dashboard stats endpoint and extract timeline
    const response = await this.client.get('/api/stats');
    const timeline = response.data.alerts_timeline || [];
    
    // Transform to TimelineData format
    return timeline.map((count: number, index: number) => ({
      timestamp: new Date(Date.now() - (timeline.length - index) * 60000).toISOString(),
      count: count,
    }));
  }

  async getSeverityDistribution(): Promise<SeverityDistribution> {
    const response = await this.client.get('/api/stats');
    const stats = response.data.stats || { high: 0, medium: 0, low: 0 };
    return {
      high: stats.high || 0,
      medium: stats.medium || 0,
      low: stats.low || 0,
    };
  }

  // ===== ALERTS ENDPOINTS =====
  
  /**
   * Get alerts with filtering and pagination
   * Maps to: GET /api/alerts?limit=100&severity=high&offset=0
   */
  async getAlerts(params?: AlertQueryParams): Promise<AlertsResponse> {
    const response = await this.client.get('/api/alerts', { 
      params: {
        limit: params?.limit || 100,
        severity: params?.severity,
        offset: params?.offset || 0,
      }
    });
    
    // Transform backend alerts to frontend format
    const alerts = response.data.alerts.map((alert: any) => this.transformAlert(alert));
    
    return {
      alerts,
      total: response.data.total,
      page: Math.floor((params?.offset || 0) / (params?.limit || 100)) + 1,
      pageSize: params?.limit || 100,
    };
  }

  /**
   * Get alert by ID (search through recent alerts)
   */
  async getAlertById(alertId: string): Promise<Alert | null> {
    const response = await this.client.get('/api/alerts', { params: { limit: 1000 } });
    const alert = response.data.alerts.find((a: any) => 
      this.generateAlertId(a) === alertId
    );
    return alert ? this.transformAlert(alert) : null;
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 50): Promise<Alert[]> {
    const response = await this.client.get('/api/alerts', { params: { limit } });
    return response.data.alerts.map((alert: any) => this.transformAlert(alert));
  }

  /**
   * Clear all alerts
   * Maps to: POST /api/clear
   */
  async clearAlerts(): Promise<void> {
    await this.client.post('/api/clear');
  }

  /**
   * Transform backend alert format to frontend Alert type
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
      protocol: 'TCP', // Backend doesn't provide this, default to TCP
      action: 'alert',
    };
  }

  /**
   * Generate unique ID for alert (backend doesn't provide IDs)
   */
  private generateAlertId(alert: any): string {
    // Create a deterministic ID based on alert properties
    return `${alert.timestamp}_${alert.src_ip}_${alert.src_port}_${alert.dest_ip}_${alert.dest_port}_${alert.signature}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // ===== VULNERABILITIES ENDPOINTS =====
  // Note: Backend doesn't provide these endpoints yet
  // These are placeholder methods that return empty data
  
  async getVulnerabilities(): Promise<Vulnerability[]> {
    // TODO: Implement when backend adds this endpoint
    console.warn('Vulnerabilities endpoint not implemented in backend');
    return [];
  }

  async getOpenPorts(): Promise<PortInfo[]> {
    // TODO: Implement when backend adds this endpoint
    console.warn('Open ports endpoint not implemented in backend');
    return [];
  }

  async getServices(): Promise<ServiceInfo[]> {
    // TODO: Implement when backend adds this endpoint
    console.warn('Services endpoint not implemented in backend');
    return [];
  }

  // ===== AI INSIGHTS ENDPOINTS =====
  // Note: Backend doesn't provide these endpoints yet
  
  async getAIInsights(): Promise<AIInsight[]> {
    // TODO: Implement when backend adds this endpoint
    console.warn('AI Insights endpoint not implemented in backend');
    return [];
  }

  async acknowledgeInsight(insightId: string): Promise<void> {
    // TODO: Implement when backend adds this endpoint
    console.warn('Acknowledge insight endpoint not implemented in backend');
  }

  // ===== HEALTH CHECK =====
  
  /**
   * Health check endpoint
   * Maps to: GET /api/health
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const start = Date.now();
      const response = await this.client.get('/api/health');
      const latency = Date.now() - start;
      return {
        status: response.data.status === 'healthy' ? 'connected' : 'disconnected',
        latency,
        isRunning: response.data.is_running,
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      return {
        status: 'disconnected',
        latency: 0,
        error: (error as APIError).message,
      };
    }
  }

  /**
   * Get API root info
   * Maps to: GET /
   */
  async getApiInfo(): Promise<any> {
    const response = await this.client.get('/');
    return response.data;
  }
}

// ===== TYPE DEFINITIONS =====

export interface APIError {
  message: string;
  status: number;
  code?: string;
}

export interface SystemStatus {
  running: boolean;
  status: 'secure' | 'warning' | 'critical';
  riskScore: number;
  lastUpdate: string;
  suricataVersion?: string;
  interface?: string;
  uptime?: number;
  connectedClients?: number;
  ngrokUrl?: string | null;
}

export interface DashboardStats {
  totalAlerts: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  categoryStats?: { [key: string]: number };
  alertsTimeline?: number[];
}

export interface DashboardData {
  stats: {
    totalAlerts: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
  };
  alertsTimeline: number[];
  categoryStats: { [key: string]: number };
  isRunning: boolean;
  status: string;
  interface: string;
  uptimeSeconds: number | null;
  timestamp: string;
  ngrokUrl: string | null;
}

export interface TimelineData {
  timestamp: string;
  count: number;
  severity?: 'high' | 'medium' | 'low';
}

export interface SeverityDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface Alert {
  id: string;
  timestamp: string;
  signature: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  srcIp: string;
  srcPort: number;
  destIp: string;
  destPort: number;
  protocol: string;
  action?: string;
  payload?: string;
}

export interface AlertQueryParams {
  severity?: string;
  category?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Vulnerability {
  id: string;
  cveId?: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  port?: number;
  service?: string;
  status: 'open' | 'mitigated';
}

export interface PortInfo {
  port: number;
  protocol: string;
  service: string;
  state: 'open' | 'closed' | 'filtered';
  risk: 'high' | 'medium' | 'low';
}

export interface ServiceInfo {
  name: string;
  version?: string;
  ports: number[];
  vulnerabilities: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  relatedAlerts: string[];
  acknowledged: boolean;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: 'connected' | 'disconnected';
  latency: number;
  version?: string;
  error?: string;
  isRunning?: boolean;
  timestamp?: string;
}

// Export singleton instance
export const idsApi = new IDSApiService();
