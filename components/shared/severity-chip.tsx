/**
 * Shared UI Components - Severity Chip
 * Displays alert severity levels
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IDSTheme } from '@/constants/ids-theme';

export type SeverityLevel = 'high' | 'medium' | 'low' | 'info';

interface SeverityChipProps {
  severity: SeverityLevel;
  size?: 'small' | 'medium';
}

export const SeverityChip: React.FC<SeverityChipProps> = ({ 
  severity, 
  size = 'medium' 
}) => {
  const severityConfig = {
    high: {
      color: IDSTheme.colors.severity.high,
      label: 'HIGH',
      backgroundColor: 'rgba(255, 61, 0, 0.15)',
    },
    medium: {
      color: IDSTheme.colors.severity.medium,
      label: 'MEDIUM',
      backgroundColor: 'rgba(255, 179, 0, 0.15)',
    },
    low: {
      color: IDSTheme.colors.severity.low,
      label: 'LOW',
      backgroundColor: 'rgba(0, 230, 118, 0.15)',
    },
    info: {
      color: IDSTheme.colors.severity.info,
      label: 'INFO',
      backgroundColor: 'rgba(0, 217, 255, 0.15)',
    },
  };

  const config = severityConfig[severity];
  const sizeStyles = size === 'small' ? smallStyles : mediumStyles;

  return (
    <View 
      style={[
        styles.chip, 
        sizeStyles.chip,
        { 
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
        }
      ]}
    >
      <Text style={[styles.text, sizeStyles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: IDSTheme.borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

const smallStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: IDSTheme.spacing.sm,
    paddingVertical: IDSTheme.spacing.xs / 2,
  },
  text: {
    fontSize: 10,
  },
});

const mediumStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: IDSTheme.spacing.md,
    paddingVertical: IDSTheme.spacing.xs,
  },
  text: {
    fontSize: 12,
  },
});
