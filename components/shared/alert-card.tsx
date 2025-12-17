/**
 * Shared UI Components - Alert Card
 * Displays individual alert information
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { IDSTheme } from '@/constants/ids-theme';
import { SeverityChip, SeverityLevel } from './severity-chip';
import { Alert } from '@/services/api';

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
  index?: number;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress, index = 0 }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'malware': '🦠',
      'exploit': '⚠️',
      'scan': '🔍',
      'brute-force': '🔨',
      'dos': '💥',
      'intrusion': '🚨',
      'suspicious': '👁️',
    };
    
    const key = category.toLowerCase();
    for (const [k, icon] of Object.entries(icons)) {
      if (key.includes(k)) return icon;
    }
    return '🔔';
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 200, delay: index * 50 }}
    >
      <TouchableOpacity
        style={[styles.card, IDSTheme.shadows.small]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.icon}>{getCategoryIcon(alert.category)}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.signature} numberOfLines={2}>
                {alert.signature}
              </Text>
              <Text style={styles.category}>{alert.category}</Text>
            </View>
          </View>
          <SeverityChip severity={alert.severity as SeverityLevel} size="small" />
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source:</Text>
            <Text style={styles.detailValue}>
              {alert.srcIp}:{alert.srcPort}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Destination:</Text>
            <Text style={styles.detailValue}>
              {alert.destIp}:{alert.destPort}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.protocol}>{alert.protocol.toUpperCase()}</Text>
          <Text style={styles.timestamp}>{formatTime(alert.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: IDSTheme.colors.primary,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: IDSTheme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: IDSTheme.spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: IDSTheme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  signature: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.text.primary,
    marginBottom: IDSTheme.spacing.xs / 2,
  },
  category: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.secondary,
  },
  details: {
    marginBottom: IDSTheme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: IDSTheme.spacing.xs / 2,
  },
  detailLabel: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
  detailValue: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.secondary,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: IDSTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: IDSTheme.colors.divider,
  },
  protocol: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.primary,
    fontSize: 10,
  },
  timestamp: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
    fontSize: 11,
  },
});
