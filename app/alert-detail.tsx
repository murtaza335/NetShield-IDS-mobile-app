/**
 * Alert Detail Screen
 * Detailed view of a single alert with AI mitigation advice
 */

import { SeverityChip, SeverityLevel } from '@/components/shared/severity-chip';
import { IDSTheme } from '@/constants/ids-theme';
import { Alert, idsApi } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AlertDetailScreen() {
  const { alertId } = useLocalSearchParams();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertDetail();
  }, [alertId]);

  const loadAlertDetail = async () => {
    if (!alertId || typeof alertId !== 'string') return;
    
    setLoading(true);
    try {
      const data = await idsApi.getAlertById(alertId);
      setAlert(data);
    } catch (error) {
      console.error('Failed to load alert detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderDetailRow = (label: string, value: string | number, monospace = false) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, monospace && styles.monospace]}>
        {value}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={IDSTheme.colors.primary} />
        <Text style={styles.loadingText}>Loading alert details...</Text>
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Alert not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Alert Details</Text>
          <SeverityChip severity={alert.severity as SeverityLevel} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Signature Card */}
        <View style={styles.signatureCard}>
          <Text style={styles.signatureLabel}>SIGNATURE</Text>
          <Text style={styles.signatureText}>{alert.signature}</Text>
        </View>

        {/* Main Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attack Information</Text>
          {renderDetailRow('Category', alert.category)}
          {renderDetailRow('Protocol', alert.protocol.toUpperCase())}
          {alert.action && renderDetailRow('Action', alert.action.toUpperCase())}
          {renderDetailRow('Timestamp', formatTimestamp(alert.timestamp))}
        </View>

        {/* Network Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Network Details</Text>
          
          <View style={styles.networkSection}>
            <Text style={styles.networkLabel}>SOURCE</Text>
            {renderDetailRow('IP Address', alert.srcIp, true)}
            {renderDetailRow('Port', alert.srcPort, true)}
          </View>

          <View style={styles.divider} />

          <View style={styles.networkSection}>
            <Text style={styles.networkLabel}>DESTINATION</Text>
            {renderDetailRow('IP Address', alert.destIp, true)}
            {renderDetailRow('Port', alert.destPort, true)}
          </View>
        </View>

        {/* Payload (if available) */}
        {alert.payload && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payload</Text>
            <View style={styles.payloadContainer}>
              <Text style={styles.payloadText}>{alert.payload}</Text>
            </View>
          </View>
        )}

        {/* AI Mitigation Advice */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>🤖</Text>
            <Text style={styles.aiTitle}>AI Mitigation Advice</Text>
          </View>
          <Text style={styles.aiAdvice}>
            Based on the signature "{alert.signature}", this appears to be a {alert.category} attack.
            {'\n\n'}
            <Text style={styles.aiAdviceBold}>Recommended Actions:</Text>
            {'\n'}• Monitor traffic from source IP {alert.srcIp}
            {'\n'}• Consider blocking port {alert.destPort} if suspicious activity continues
            {'\n'}• Review firewall rules for {alert.protocol.toUpperCase()} traffic
            {'\n'}• Check logs for similar patterns from this source
          </Text>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IDSTheme.colors.background,
  },
  loadingText: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.secondary,
    marginTop: IDSTheme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IDSTheme.colors.background,
    padding: IDSTheme.spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: IDSTheme.spacing.md,
  },
  errorText: {
    ...IDSTheme.typography.h2,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: IDSTheme.spacing.md,
    backgroundColor: IDSTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: IDSTheme.colors.border,
  },
  backButton: {
    padding: IDSTheme.spacing.sm,
    marginRight: IDSTheme.spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: IDSTheme.colors.primary,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...IDSTheme.typography.h2,
    color: IDSTheme.colors.text.primary,
  },
  content: {
    padding: IDSTheme.spacing.md,
  },
  signatureCard: {
    backgroundColor: IDSTheme.colors.surfaceElevated,
    borderRadius: IDSTheme.borderRadius.lg,
    padding: IDSTheme.spacing.lg,
    marginBottom: IDSTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: IDSTheme.colors.primary,
    ...IDSTheme.shadows.medium,
  },
  signatureLabel: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.primary,
    marginBottom: IDSTheme.spacing.sm,
  },
  signatureText: {
    ...IDSTheme.typography.h3,
    color: IDSTheme.colors.text.primary,
    lineHeight: 28,
  },
  card: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  cardTitle: {
    ...IDSTheme.typography.h3,
    color: IDSTheme.colors.text.primary,
    marginBottom: IDSTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: IDSTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: IDSTheme.colors.divider,
  },
  detailLabel: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.tertiary,
  },
  detailValue: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.text.primary,
  },
  monospace: {
    fontFamily: 'monospace',
    color: IDSTheme.colors.primary,
  },
  networkSection: {
    marginVertical: IDSTheme.spacing.sm,
  },
  networkLabel: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.sm,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: IDSTheme.colors.divider,
    marginVertical: IDSTheme.spacing.sm,
  },
  payloadContainer: {
    backgroundColor: IDSTheme.colors.surfaceElevated,
    borderRadius: IDSTheme.borderRadius.sm,
    padding: IDSTheme.spacing.md,
  },
  payloadText: {
    ...IDSTheme.typography.caption,
    fontFamily: 'monospace',
    color: IDSTheme.colors.text.secondary,
    lineHeight: 18,
  },
  aiCard: {
    backgroundColor: `${IDSTheme.colors.primary}10`,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.lg,
    marginBottom: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: `${IDSTheme.colors.primary}30`,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IDSTheme.spacing.md,
  },
  aiIcon: {
    fontSize: 24,
    marginRight: IDSTheme.spacing.sm,
  },
  aiTitle: {
    ...IDSTheme.typography.h3,
    color: IDSTheme.colors.primary,
  },
  aiAdvice: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.secondary,
    lineHeight: 24,
  },
  aiAdviceBold: {
    fontWeight: '700',
    color: IDSTheme.colors.text.primary,
  },
  backButtonText: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.primary,
  },
  bottomSpacer: {
    height: IDSTheme.spacing.xl,
  },
});
