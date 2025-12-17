/**
 * Settings Screen
 * App configuration, connection status, and controls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IDSTheme } from '@/constants/ids-theme';
import { StatusBadge, StatusType } from '@/components/shared/status-badge';
import { idsApi, HealthCheckResponse } from '@/services/api';
import { wsService } from '@/services/websocket';

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadSettings();
    checkHealth();

    const unsubscribe = wsService.onConnectionChange((connected) => {
      setWsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  const loadSettings = async () => {
    try {
      const savedApiUrl = await AsyncStorage.getItem('@netshield_api_url');
      const savedWsUrl = await AsyncStorage.getItem('@netshield_ws_url');
      const savedAutoRefresh = await AsyncStorage.getItem('@netshield_auto_refresh');
      const savedInterval = await AsyncStorage.getItem('@netshield_refresh_interval');

      if (savedApiUrl) setApiUrl(savedApiUrl);
      if (savedWsUrl) setWsUrl(savedWsUrl);
      if (savedAutoRefresh) setAutoRefresh(savedAutoRefresh === 'true');
      if (savedInterval) setRefreshInterval(parseInt(savedInterval, 10));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkHealth = async () => {
    setChecking(true);
    try {
      const health = await idsApi.healthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSaveApiUrl = async () => {
    try {
      await AsyncStorage.setItem('@netshield_api_url', apiUrl);
      await idsApi.setBaseURL(apiUrl);
      Alert.alert('Success', 'API URL updated successfully');
      checkHealth();
    } catch (error) {
      Alert.alert('Error', 'Failed to save API URL');
    }
  };

  const handleSaveWsUrl = async () => {
    try {
      await AsyncStorage.setItem('@netshield_ws_url', wsUrl);
      wsService.disconnect();
      wsService.connect(wsUrl);
      Alert.alert('Success', 'WebSocket URL updated. Reconnecting...');
    } catch (error) {
      Alert.alert('Error', 'Failed to save WebSocket URL');
    }
  };

  const handleToggleAutoRefresh = async (value: boolean) => {
    setAutoRefresh(value);
    await AsyncStorage.setItem('@netshield_auto_refresh', value.toString());
  };

  const handleChangeInterval = async (value: number) => {
    setRefreshInterval(value);
    await AsyncStorage.setItem('@netshield_refresh_interval', value.toString());
  };

  const handleReconnectWs = () => {
    wsService.reconnect();
    Alert.alert('Info', 'Attempting to reconnect WebSocket...');
  };

  const getConnectionStatus = (): StatusType => {
    if (!healthStatus) return 'disconnected';
    if (healthStatus.status === 'connected' && healthStatus.latency < 500) return 'secure';
    if (healthStatus.status === 'connected' && healthStatus.latency < 1000) return 'warning';
    return 'critical';
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configuration & Status</Text>
        </View>

        {/* Connection Status */}
        {renderSection('CONNECTION STATUS', (
          <>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>API Server</Text>
                <StatusBadge status={getConnectionStatus()} size="small" />
              </View>
              {healthStatus && healthStatus.status === 'connected' && (
                <View style={styles.statusDetail}>
                  <Text style={styles.statusDetailText}>
                    Latency: {healthStatus.latency}ms
                  </Text>
                  {healthStatus.version && (
                    <Text style={styles.statusDetailText}>
                      Version: {healthStatus.version}
                    </Text>
                  )}
                </View>
              )}
              {healthStatus && healthStatus.error && (
                <Text style={styles.errorText}>{healthStatus.error}</Text>
              )}
              <TouchableOpacity
                style={styles.testButton}
                onPress={checkHealth}
                disabled={checking}
              >
                <Text style={styles.testButtonText}>
                  {checking ? 'Testing...' : 'Test Connection'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>WebSocket</Text>
                <StatusBadge 
                  status={wsConnected ? 'secure' : 'disconnected'} 
                  label={wsConnected ? 'CONNECTED' : 'OFFLINE'}
                  size="small" 
                />
              </View>
              {!wsConnected && (
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleReconnectWs}
                >
                  <Text style={styles.testButtonText}>Reconnect</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ))}

        {/* API Configuration */}
        {renderSection('API CONFIGURATION', (
          <>
            <Text style={styles.inputLabel}>API Base URL</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://192.168.1.100:5000/api"
              placeholderTextColor={IDSTheme.colors.text.disabled}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveApiUrl}>
              <Text style={styles.saveButtonText}>Save API URL</Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { marginTop: IDSTheme.spacing.md }]}>
              WebSocket URL
            </Text>
            <TextInput
              style={styles.input}
              value={wsUrl}
              onChangeText={setWsUrl}
              placeholder="http://192.168.1.100:5000"
              placeholderTextColor={IDSTheme.colors.text.disabled}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveWsUrl}>
              <Text style={styles.saveButtonText}>Save WebSocket URL</Text>
            </TouchableOpacity>
          </>
        ))}

        {/* Refresh Settings */}
        {renderSection('REFRESH SETTINGS', (
          <>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto-refresh</Text>
              <Switch
                value={autoRefresh}
                onValueChange={handleToggleAutoRefresh}
                trackColor={{
                  false: IDSTheme.colors.border,
                  true: IDSTheme.colors.primary,
                }}
                thumbColor={IDSTheme.colors.text.primary}
              />
            </View>

            {autoRefresh && (
              <View style={styles.intervalContainer}>
                <Text style={styles.inputLabel}>Refresh Interval (seconds)</Text>
                <View style={styles.intervalButtons}>
                  {[10, 30, 60, 120].map((interval) => (
                    <TouchableOpacity
                      key={interval}
                      style={[
                        styles.intervalButton,
                        refreshInterval === interval && styles.intervalButtonActive,
                      ]}
                      onPress={() => handleChangeInterval(interval)}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          refreshInterval === interval && styles.intervalButtonTextActive,
                        ]}
                      >
                        {interval}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        ))}

        {/* App Info */}
        {renderSection('APPLICATION INFO', (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Name</Text>
              <Text style={styles.infoValue}>NetShield Mobile</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mode</Text>
              <Text style={styles.infoValue}>Read-Only Dashboard</Text>
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IDSTheme.colors.background,
  },
  content: {
    padding: IDSTheme.spacing.md,
  },
  header: {
    marginBottom: IDSTheme.spacing.lg,
  },
  title: {
    ...IDSTheme.typography.display,
    color: IDSTheme.colors.text.primary,
    marginBottom: IDSTheme.spacing.xs,
  },
  subtitle: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
  section: {
    marginBottom: IDSTheme.spacing.xl,
  },
  sectionTitle: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.md,
  },
  statusCard: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: IDSTheme.spacing.sm,
  },
  statusLabel: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.text.primary,
  },
  statusDetail: {
    marginBottom: IDSTheme.spacing.sm,
  },
  statusDetailText: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.xs / 2,
  },
  errorText: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.error,
    marginBottom: IDSTheme.spacing.sm,
  },
  testButton: {
    backgroundColor: IDSTheme.colors.surfaceElevated,
    borderRadius: IDSTheme.borderRadius.sm,
    paddingVertical: IDSTheme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  testButtonText: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.primary,
    fontSize: 14,
  },
  inputLabel: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.xs,
  },
  input: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.sm,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
    color: IDSTheme.colors.text.primary,
    ...IDSTheme.typography.body,
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: IDSTheme.colors.primary,
    borderRadius: IDSTheme.borderRadius.sm,
    paddingVertical: IDSTheme.spacing.md,
    alignItems: 'center',
    ...IDSTheme.shadows.small,
  },
  saveButtonText: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.background,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  settingLabel: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.text.primary,
  },
  intervalContainer: {
    marginTop: IDSTheme.spacing.md,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: IDSTheme.spacing.sm,
  },
  intervalButton: {
    flex: 1,
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.sm,
    paddingVertical: IDSTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  intervalButtonActive: {
    backgroundColor: IDSTheme.colors.primary,
    borderColor: IDSTheme.colors.primary,
  },
  intervalButtonText: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.text.secondary,
    fontSize: 14,
  },
  intervalButtonTextActive: {
    color: IDSTheme.colors.background,
  },
  infoCard: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: IDSTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: IDSTheme.colors.divider,
  },
  infoLabel: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.tertiary,
  },
  infoValue: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.text.primary,
  },
  bottomSpacer: {
    height: IDSTheme.spacing.xl,
  },
});
