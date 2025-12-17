/**
 * Shared UI Components - Status Badge
 * Displays system or item status with color coding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IDSTheme } from '@/constants/ids-theme';

export type StatusType = 'secure' | 'warning' | 'critical' | 'disconnected';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label,
  size = 'medium',
}) => {
  const statusConfig = {
    secure: {
      color: IDSTheme.colors.success,
      text: label || 'SECURE',
      icon: '●',
    },
    warning: {
      color: IDSTheme.colors.warning,
      text: label || 'WARNING',
      icon: '●',
    },
    critical: {
      color: IDSTheme.colors.critical,
      text: label || 'CRITICAL',
      icon: '●',
    },
    disconnected: {
      color: IDSTheme.colors.text.disabled,
      text: label || 'OFFLINE',
      icon: '○',
    },
  };

  const config = statusConfig[status];
  const sizeStyles = size === 'small' ? smallStyles : size === 'large' ? largeStyles : mediumStyles;

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <Text style={[styles.icon, { color: config.color }, sizeStyles.icon]}>
        {config.icon}
      </Text>
      <Text style={[styles.text, { color: config.color }, sizeStyles.text]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: IDSTheme.spacing.xs,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

const smallStyles = StyleSheet.create({
  container: {
    paddingHorizontal: IDSTheme.spacing.sm,
    paddingVertical: IDSTheme.spacing.xs / 2,
  },
  icon: {
    fontSize: 8,
  },
  text: {
    fontSize: 10,
  },
});

const mediumStyles = StyleSheet.create({
  container: {
    paddingHorizontal: IDSTheme.spacing.md,
    paddingVertical: IDSTheme.spacing.xs,
  },
  icon: {
    fontSize: 10,
  },
  text: {
    fontSize: 12,
  },
});

const largeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: IDSTheme.spacing.lg,
    paddingVertical: IDSTheme.spacing.sm,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: 14,
  },
});
