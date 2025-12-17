/**
 * Shared UI Components - Metric Card
 * Displays KPI metrics with optional trend indicators
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { IDSTheme } from '@/constants/ids-theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  accentColor?: string;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  accentColor = IDSTheme.colors.primary,
  delay = 0,
}) => {
  const trendColor = trend === 'up' 
    ? IDSTheme.colors.error 
    : trend === 'down' 
    ? IDSTheme.colors.success 
    : IDSTheme.colors.text.secondary;

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 250, delay }}
      style={[styles.card, IDSTheme.shadows.medium]}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
      
      <Text style={[styles.value, { color: accentColor }]}>
        {value}
      </Text>
      
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, { color: trendColor }]}>
            {trendIcon} {trendValue}
          </Text>
        </View>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: IDSTheme.spacing.sm,
  },
  label: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
  },
  icon: {
    fontSize: 20,
  },
  value: {
    ...IDSTheme.typography.display,
    marginBottom: IDSTheme.spacing.xs,
  },
  trendContainer: {
    marginTop: IDSTheme.spacing.xs,
  },
  trend: {
    ...IDSTheme.typography.caption,
    fontWeight: '600',
  },
});
