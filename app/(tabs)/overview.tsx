/**
 * Overview Screen
 * Main dashboard with system status and key metrics
 */

import { MetricCard } from '@/components/shared/metric-card';
import { StatusBadge, StatusType } from '@/components/shared/status-badge';
import { IDSTheme } from '@/constants/ids-theme';
import { DashboardStats, idsApi, SystemStatus, TimelineData } from '@/services/api';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setRefreshing(true);
    
    try {
      const [statusData, statsData, timelineData] = await Promise.all([
        idsApi.getSystemStatus(),
        idsApi.getDashboardStats(),
        idsApi.getAlertTimeline(60),
      ]);

      setSystemStatus(statusData);
      setStats(statsData);
      setTimeline(timelineData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load overview data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRiskScoreColor = (score: number): string => {
    if (score >= 70) return IDSTheme.colors.critical;
    if (score >= 40) return IDSTheme.colors.warning;
    return IDSTheme.colors.success;
  };

  const renderRiskScore = () => {
    if (!systemStatus) return null;
    
    const score = systemStatus.riskScore;
    const color = getRiskScoreColor(score);
    const circumference = 2 * Math.PI * 60;
    const progress = (score / 100) * circumference;

    return (
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'timing', duration: 300, delay: 100 }}
        style={styles.riskScoreCard}
      >
        <Text style={styles.riskScoreLabel}>RISK SCORE</Text>
        <View style={styles.circularProgress}>
          <Text style={[styles.riskScoreValue, { color }]}>
            {score}
          </Text>
          <Text style={styles.riskScoreMax}>/100</Text>
        </View>
        <StatusBadge 
          status={systemStatus.status as StatusType} 
          size="medium"
        />
      </MotiView>
    );
  };

  const renderTimeline = () => {
    if (timeline.length === 0) return null;

    const labels = timeline.map((_, i) => 
      i % 10 === 0 ? `${60 - i}m` : ''
    ).reverse();
    
    const data = timeline.map(t => t.count).reverse();

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>ALERTS TIMELINE (60 MIN)</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data }],
          }}
          width={SCREEN_WIDTH - IDSTheme.spacing.md * 2}
          height={180}
          chartConfig={{
            backgroundColor: IDSTheme.colors.surface,
            backgroundGradientFrom: IDSTheme.colors.surface,
            backgroundGradientTo: IDSTheme.colors.surfaceElevated,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 217, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(176, 190, 197, ${opacity})`,
            style: { borderRadius: IDSTheme.borderRadius.md },
            propsForDots: {
              r: '0',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: IDSTheme.colors.border,
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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
          <Text style={styles.title}>NetShield IDS</Text>
          <Text style={styles.subtitle}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Text>
        </View>

        {/* Risk Score */}
        {renderRiskScore()}

        {/* Alert Metrics */}
        {stats && (
          <View style={styles.metricsGrid}>
            <View style={styles.metricRow}>
              <View style={styles.metricHalf}>
                <MetricCard
                  label="TOTAL ALERTS"
                  value={stats.totalAlerts}
                  icon="🔔"
                  accentColor={IDSTheme.colors.primary}
                  delay={150}
                />
              </View>
              <View style={styles.metricHalf}>
                <MetricCard
                  label="HIGH SEVERITY"
                  value={stats.highSeverity}
                  icon="🚨"
                  accentColor={IDSTheme.colors.severity.high}
                  delay={200}
                />
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricHalf}>
                <MetricCard
                  label="MEDIUM"
                  value={stats.mediumSeverity}
                  icon="⚠️"
                  accentColor={IDSTheme.colors.severity.medium}
                  delay={250}
                />
              </View>
              <View style={styles.metricHalf}>
                <MetricCard
                  label="LOW"
                  value={stats.lowSeverity}
                  icon="ℹ️"
                  accentColor={IDSTheme.colors.severity.low}
                  delay={300}
                />
              </View>
            </View>

            <MetricCard
              label="TOTAL ALERTS"
              value={stats.totalAlerts.toLocaleString()}
              icon="📊"
              accentColor={IDSTheme.colors.text.secondary}
              delay={350}
            />
          </View>
        )}

        {/* Timeline Chart */}
        {renderTimeline()}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IDSTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: IDSTheme.spacing.md,
    paddingTop: IDSTheme.spacing.xl,
    paddingBottom: IDSTheme.spacing.xxl,
  },
  header: {
    marginBottom: IDSTheme.spacing.xl,
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
  riskScoreCard: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.lg,
    padding: IDSTheme.spacing.lg,
    marginBottom: IDSTheme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
    ...IDSTheme.shadows.medium,
  },
  riskScoreLabel: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.md,
  },
  circularProgress: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: IDSTheme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: IDSTheme.spacing.md,
    borderWidth: 8,
    borderColor: IDSTheme.colors.border,
  },
  riskScoreValue: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  riskScoreMax: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
  metricsGrid: {
    marginBottom: IDSTheme.spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: IDSTheme.spacing.md,
    gap: IDSTheme.spacing.md,
  },
  metricHalf: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.lg,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
    ...IDSTheme.shadows.small,
  },
  chartTitle: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.text.secondary,
    marginBottom: IDSTheme.spacing.md,
  },
  chart: {
    borderRadius: IDSTheme.borderRadius.sm,
    marginVertical: IDSTheme.spacing.sm,
  },
  bottomSpacer: {
    height: IDSTheme.spacing.xl,
  },
});
