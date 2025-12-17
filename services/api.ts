/**
 * NetShield API Service
 * Handles all REST API communications with the IDS backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Change to your server IP
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
  
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await this.client.get('/status');
    return response.data;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }

  async getAlertTimeline(minutes: number = 60): Promise<TimelineData[]> {
    const response = await this.client.get(`/alerts/timeline?minutes=${minutes}`);
    return response.data;
  }

  async getSeverityDistribution(): Promise<SeverityDistribution> {
    const response = await this.client.get('/alerts/severity-distribution');
    return response.data;
  }

  // ===== ALERTS ENDPOINTS =====
  
  async getAlerts(params?: AlertQueryParams): Promise<AlertsResponse> {
    const response = await this.client.get('/alerts', { params });
    return response.data;
  }

  async getAlertById(alertId: string): Promise<Alert> {
    const response = await this.client.get(`/alerts/${alertId}`);
    return response.data;
  }

  async getRecentAlerts(limit: number = 50): Promise<Alert[]> {
    const response = await this.client.get(`/alerts/recent?limit=${limit}`);
    return response.data;
  }

  // ===== VULNERABILITIES ENDPOINTS =====
  
  async getVulnerabilities(): Promise<Vulnerability[]> {
    const response = await this.client.get('/vulnerabilities');
    return response.data;
  }

  async getOpenPorts(): Promise<PortInfo[]> {
    const response = await this.client.get('/network/ports');
    return response.data;
  }

  async getServices(): Promise<ServiceInfo[]> {
    const response = await this.client.get('/network/services');
    return response.data;
  }

  // ===== AI INSIGHTS ENDPOINTS =====
  
  async getAIInsights(): Promise<AIInsight[]> {
    const response = await this.client.get('/ai/insights');
    return response.data;
  }

  async acknowledgeInsight(insightId: string): Promise<void> {
    await this.client.post(`/ai/insights/${insightId}/acknowledge`);
  }

  // ===== HEALTH CHECK =====
  
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const start = Date.now();
      const response = await this.client.get('/health');
      const latency = Date.now() - start;
      return {
        status: 'connected',
        latency,
        version: response.data.version,
      };
    } catch (error) {
      return {
        status: 'disconnected',
        latency: 0,
        error: (error as APIError).message,
      };
    }
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
}

export interface DashboardStats {
  totalAlerts: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  activeSessions: number;
  packetsAnalyzed: number;
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
}

// Export singleton instance
export const idsApi = new IDSApiService();
