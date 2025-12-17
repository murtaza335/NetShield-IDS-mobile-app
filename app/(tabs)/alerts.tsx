/**
 * Alerts Screen
 * Real-time alert list with filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { IDSTheme } from '@/constants/ids-theme';
import { AlertCard } from '@/components/shared/alert-card';
import { SeverityChip, SeverityLevel } from '@/components/shared/severity-chip';
import { idsApi, Alert } from '@/services/api';
import { wsService } from '@/services/websocket';

type FilterType = 'all' | 'high' | 'medium' | 'low';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    loadAlerts();
    
    // Connect to WebSocket for real-time alerts
    wsService.connect();
    
    // Subscribe to new alerts
    const unsubscribeAlerts = wsService.onAlert((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });
    
    // Subscribe to connection status
    const unsubscribeConnection = wsService.onConnectionChange((connected) => {
      setWsConnected(connected);
    });

    return () => {
      unsubscribeAlerts();
      unsubscribeConnection();
    };
  }, []);

  useEffect(() => {
    applyFilter();
  }, [alerts, activeFilter]);

  const loadAlerts = async () => {
    setRefreshing(true);
    try {
      const data = await idsApi.getRecentAlerts(100);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilter = () => {
    if (activeFilter === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.severity === activeFilter));
    }
  };

  const handleAlertPress = (alert: Alert) => {
    router.push({
      pathname: '/alert-detail',
      params: { alertId: alert.id },
    });
  };

  const renderFilter = (filter: FilterType, label: string, count: number) => {
    const isActive = activeFilter === filter;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive,
        ]}
        onPress={() => setActiveFilter(filter)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterText,
            isActive && styles.filterTextActive,
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.filterBadge,
            isActive && styles.filterBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.filterBadgeText,
              isActive && styles.filterBadgeTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getCounts = () => {
    return {
      all: alerts.length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
    };
  };

  const counts = getCounts();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {wsConnected ? '● Live' : '○ Offline'} • {filteredAlerts.length} alerts
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filters}>
          {renderFilter('all', 'All', counts.all)}
          {renderFilter('high', 'High', counts.high)}
          {renderFilter('medium', 'Medium', counts.medium)}
          {renderFilter('low', 'Low', counts.low)}
        </View>
      </View>

      {/* Alert List */}
      <FlatList
        data={filteredAlerts}
        renderItem={({ item, index }) => (
          <AlertCard
            alert={item}
            onPress={() => handleAlertPress(item)}
            index={index}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadAlerts}
            tintColor={IDSTheme.colors.primary}
            colors={[IDSTheme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>No alerts found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter !== 'all' 
                ? `No ${activeFilter} severity alerts` 
                : 'All clear!'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IDSTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: IDSTheme.spacing.md,
    paddingTop: IDSTheme.spacing.lg,
    backgroundColor: IDSTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: IDSTheme.colors.border,
  },
  title: {
    ...IDSTheme.typography.h1,
    color: IDSTheme.colors.text.primary,
  },
  subtitle: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
    marginTop: IDSTheme.spacing.xs / 2,
  },
  filtersContainer: {
    backgroundColor: IDSTheme.colors.surface,
    paddingHorizontal: IDSTheme.spacing.md,
    paddingBottom: IDSTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: IDSTheme.colors.border,
  },
  filters: {
    flexDirection: 'row',
    gap: IDSTheme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: IDSTheme.colors.surfaceElevated,
    borderRadius: IDSTheme.borderRadius.sm,
    paddingVertical: IDSTheme.spacing.sm,
    paddingHorizontal: IDSTheme.spacing.sm,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
    gap: IDSTheme.spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: IDSTheme.colors.primary,
    borderColor: IDSTheme.colors.primary,
  },
  filterText: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
    fontSize: 11,
  },
  filterTextActive: {
    color: IDSTheme.colors.background,
  },
  filterBadge: {
    backgroundColor: IDSTheme.colors.surfaceHover,
    borderRadius: IDSTheme.borderRadius.full,
    paddingHorizontal: IDSTheme.spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: IDSTheme.colors.text.primary,
  },
  filterBadgeTextActive: {
    color: IDSTheme.colors.text.primary,
  },
  listContent: {
    padding: IDSTheme.spacing.md,
    paddingBottom: IDSTheme.spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: IDSTheme.spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: IDSTheme.spacing.md,
    opacity: 0.3,
  },
  emptyText: {
    ...IDSTheme.typography.h3,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.xs,
  },
  emptySubtext: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
});
