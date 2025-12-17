/**
 * Vulnerabilities Screen
 * Displays open ports, services, and known vulnerabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MotiView } from 'moti';
import { IDSTheme } from '@/constants/ids-theme';
import { SeverityChip } from '@/components/shared/severity-chip';
import { idsApi, Vulnerability, PortInfo, ServiceInfo } from '@/services/api';

export default function VulnerabilitiesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [vulnData, portsData, servicesData] = await Promise.all([
        idsApi.getVulnerabilities(),
        idsApi.getOpenPorts(),
        idsApi.getServices(),
      ]);

      setVulnerabilities(vulnData);
      setPorts(portsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to load vulnerability data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
      case 'critical':
        return IDSTheme.colors.severity.high;
      case 'medium':
        return IDSTheme.colors.severity.medium;
      case 'low':
        return IDSTheme.colors.severity.low;
      default:
        return IDSTheme.colors.text.secondary;
    }
  };

  const renderVulnerability = (vuln: Vulnerability, index: number) => {
    const isExpanded = expandedItems.has(vuln.id);

    return (
      <MotiView
        key={vuln.id}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 200, delay: index * 50 }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleExpanded(vuln.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.vulnHeader}>
              <Text style={styles.vulnIcon}>🔓</Text>
              <View style={styles.vulnTitle}>
                <Text style={styles.cardTitle}>{vuln.title}</Text>
                {vuln.cveId && (
                  <Text style={styles.cveId}>{vuln.cveId}</Text>
                )}
              </View>
            </View>
            <SeverityChip severity={vuln.severity as any} size="small" />
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.description}>{vuln.description}</Text>
              
              {vuln.service && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Service:</Text>
                  <Text style={styles.detailValue}>{vuln.service}</Text>
                </View>
              )}
              
              {vuln.port && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Port:</Text>
                  <Text style={styles.detailValue}>{vuln.port}</Text>
                </View>
              )}

              <View style={[styles.statusBadge, { 
                backgroundColor: vuln.status === 'open' 
                  ? 'rgba(255, 61, 0, 0.15)' 
                  : 'rgba(0, 230, 118, 0.15)',
              }]}>
                <Text style={[styles.statusText, {
                  color: vuln.status === 'open'
                    ? IDSTheme.colors.error
                    : IDSTheme.colors.success,
                }]}>
                  {vuln.status.toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.expandIndicator}>
            {isExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </MotiView>
    );
  };

  const renderPort = (port: PortInfo, index: number) => {
    const riskColor = getRiskColor(port.risk);

    return (
      <MotiView
        key={`${port.port}-${port.protocol}`}
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 200, delay: index * 30 }}
        style={[styles.portCard, { borderLeftColor: riskColor }]}
      >
        <View style={styles.portHeader}>
          <Text style={styles.portNumber}>{port.port}</Text>
          <Text style={styles.portProtocol}>{port.protocol.toUpperCase()}</Text>
        </View>
        <Text style={styles.portService}>{port.service}</Text>
        <View style={styles.portFooter}>
          <Text style={[styles.portState, {
            color: port.state === 'open' 
              ? IDSTheme.colors.warning 
              : IDSTheme.colors.text.tertiary,
          }]}>
            {port.state.toUpperCase()}
          </Text>
          <Text style={[styles.portRisk, { color: riskColor }]}>
            {port.risk.toUpperCase()} RISK
          </Text>
        </View>
      </MotiView>
    );
  };

  const renderService = (service: ServiceInfo, index: number) => (
    <MotiView
      key={service.name}
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 200, delay: index * 40 }}
      style={styles.serviceCard}
    >
      <Text style={styles.serviceName}>{service.name}</Text>
      {service.version && (
        <Text style={styles.serviceVersion}>v{service.version}</Text>
      )}
      <View style={styles.serviceFooter}>
        <Text style={styles.servicePorts}>
          Ports: {service.ports.join(', ')}
        </Text>
        {service.vulnerabilities > 0 && (
          <View style={styles.vulnBadge}>
            <Text style={styles.vulnBadgeText}>
              {service.vulnerabilities} CVE
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadData}
            tintColor={IDSTheme.colors.primary}
            colors={[IDSTheme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vulnerabilities</Text>
          <Text style={styles.subtitle}>
            {vulnerabilities.length} vulnerabilities • {ports.length} open ports
          </Text>
        </View>

        {/* Vulnerabilities Section */}
        <Text style={styles.sectionTitle}>KNOWN VULNERABILITIES</Text>
        {vulnerabilities.length > 0 ? (
          vulnerabilities.map((vuln, index) => renderVulnerability(vuln, index))
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>No vulnerabilities detected</Text>
          </View>
        )}

        {/* Open Ports Section */}
        <Text style={styles.sectionTitle}>OPEN PORTS</Text>
        <View style={styles.portsGrid}>
          {ports.length > 0 ? (
            ports.map((port, index) => renderPort(port, index))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>🔒</Text>
              <Text style={styles.emptyText}>No open ports</Text>
            </View>
          )}
        </View>

        {/* Services Section */}
        <Text style={styles.sectionTitle}>SERVICES</Text>
        {services.length > 0 ? (
          services.map((service, index) => renderService(service, index))
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyIcon}>○</Text>
            <Text style={styles.emptyText}>No services detected</Text>
          </View>
        )}

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
  sectionTitle: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
    marginTop: IDSTheme.spacing.lg,
    marginBottom: IDSTheme.spacing.md,
  },
  card: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
    ...IDSTheme.shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vulnHeader: {
    flexDirection: 'row',
    flex: 1,
    marginRight: IDSTheme.spacing.md,
  },
  vulnIcon: {
    fontSize: 24,
    marginRight: IDSTheme.spacing.sm,
  },
  vulnTitle: {
    flex: 1,
  },
  cardTitle: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.text.primary,
    marginBottom: IDSTheme.spacing.xs / 2,
  },
  cveId: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.primary,
    fontFamily: 'monospace',
  },
  expandedContent: {
    marginTop: IDSTheme.spacing.md,
    paddingTop: IDSTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: IDSTheme.colors.divider,
  },
  description: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.md,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: IDSTheme.spacing.xs,
  },
  detailLabel: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
  detailValue: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.secondary,
    fontWeight: '600',
  },
  statusBadge: {
    marginTop: IDSTheme.spacing.sm,
    paddingVertical: IDSTheme.spacing.xs,
    paddingHorizontal: IDSTheme.spacing.md,
    borderRadius: IDSTheme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...IDSTheme.typography.label,
    fontSize: 10,
    fontWeight: '700',
  },
  expandIndicator: {
    position: 'absolute',
    bottom: IDSTheme.spacing.sm,
    right: IDSTheme.spacing.sm,
    fontSize: 10,
    color: IDSTheme.colors.text.tertiary,
  },
  portsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: IDSTheme.spacing.md,
  },
  portCard: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.sm,
    padding: IDSTheme.spacing.md,
    width: '47%',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  portHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: IDSTheme.spacing.xs,
  },
  portNumber: {
    ...IDSTheme.typography.h2,
    color: IDSTheme.colors.text.primary,
    marginRight: IDSTheme.spacing.xs,
  },
  portProtocol: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
  portService: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.sm,
  },
  portFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portState: {
    ...IDSTheme.typography.label,
    fontSize: 9,
  },
  portRisk: {
    ...IDSTheme.typography.label,
    fontSize: 9,
  },
  serviceCard: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
  },
  serviceName: {
    ...IDSTheme.typography.h3,
    color: IDSTheme.colors.text.primary,
    marginBottom: IDSTheme.spacing.xs / 2,
  },
  serviceVersion: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.sm,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePorts: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
  vulnBadge: {
    backgroundColor: 'rgba(255, 61, 0, 0.15)',
    paddingHorizontal: IDSTheme.spacing.sm,
    paddingVertical: IDSTheme.spacing.xs / 2,
    borderRadius: IDSTheme.borderRadius.sm,
  },
  vulnBadgeText: {
    ...IDSTheme.typography.label,
    fontSize: 10,
    color: IDSTheme.colors.severity.high,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: IDSTheme.spacing.xxl,
    opacity: 0.5,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: IDSTheme.spacing.sm,
  },
  emptyText: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.tertiary,
  },
  bottomSpacer: {
    height: IDSTheme.spacing.xl,
  },
});
