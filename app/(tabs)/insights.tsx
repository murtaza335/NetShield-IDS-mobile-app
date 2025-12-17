/**
 * Insights (AI) Screen
 * AI-generated security recommendations and analysis
 */

import { IDSTheme } from '@/constants/ids-theme';
import { AIInsight, idsApi } from '@/services/api';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function InsightsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setRefreshing(true);
    try {
      const data = await idsApi.getAIInsights();
      setInsights(data);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledge = async (insightId: string) => {
    try {
      await idsApi.acknowledgeInsight(insightId);
      setInsights(prev =>
        prev.map(insight =>
          insight.id === insightId
            ? { ...insight, acknowledged: true }
            : insight
        )
      );
    } catch (error) {
      console.error('Failed to acknowledge insight:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return IDSTheme.colors.critical;
      case 'high':
        return IDSTheme.colors.severity.high;
      case 'medium':
        return IDSTheme.colors.severity.medium;
      case 'low':
        return IDSTheme.colors.severity.low;
      default:
        return IDSTheme.colors.text.secondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return 'ℹ️';
      case 'low':
        return '💡';
      default:
        return '📌';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderInsight = (insight: AIInsight, index: number) => {
    const priorityColor = getPriorityColor(insight.priority);
    const priorityIcon = getPriorityIcon(insight.priority);

    return (
      <MotiView
        key={insight.id}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 250, delay: index * 80 }}
        style={[
          styles.insightCard,
          insight.acknowledged && styles.insightCardAcknowledged,
          { borderLeftColor: priorityColor },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.icon}>{priorityIcon}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{insight.title}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(insight.timestamp)}</Text>
            </View>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {insight.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{insight.description}</Text>

        {/* Recommendation */}
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationLabel}>💡 RECOMMENDATION</Text>
          <Text style={styles.recommendationText}>{insight.recommendation}</Text>
        </View>

        {/* Related Alerts */}
        {insight.relatedAlerts.length > 0 && (
          <View style={styles.relatedAlerts}>
            <Text style={styles.relatedLabel}>
              Related to {insight.relatedAlerts.length} alert{insight.relatedAlerts.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Acknowledge Button */}
        {!insight.acknowledged ? (
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={() => handleAcknowledge(insight.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.acknowledgedBadge}>
            <Text style={styles.acknowledgedText}>✓ Acknowledged</Text>
          </View>
        )}
      </MotiView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadInsights}
            tintColor={IDSTheme.colors.primary}
            colors={[IDSTheme.colors.primary]}
          />
        }
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>AI Insights</Text>
          <Text style={styles.pageSubtitle}>
            {insights.length} recommendation{insights.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>🤖</Text>
          <Text style={styles.infoBannerText}>
            AI-powered security analysis based on detected patterns and threat intelligence
          </Text>
        </View>

        {/* Insights List */}
        {insights.length > 0 ? (
          insights.map((insight, index) => renderInsight(insight, index))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>No insights available</Text>
            <Text style={styles.emptySubtext}>
              AI analysis will appear here when patterns are detected
            </Text>
          </View>
        )}

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
  content: {
    padding: IDSTheme.spacing.md,
    paddingTop: IDSTheme.spacing.xl,
    paddingBottom: IDSTheme.spacing.xxl,
  },
  pageHeader: {
    marginBottom: IDSTheme.spacing.lg,
  },
  pageTitle: {
    ...IDSTheme.typography.display,
    color: IDSTheme.colors.text.primary,
    marginBottom: IDSTheme.spacing.xs,
  },
  pageSubtitle: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: `${IDSTheme.colors.primary}15`,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.lg,
    borderWidth: 1,
    borderColor: `${IDSTheme.colors.primary}30`,
  },
  infoBannerIcon: {
    fontSize: 20,
    marginRight: IDSTheme.spacing.sm,
  },
  infoBannerText: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  insightCard: {
    backgroundColor: IDSTheme.colors.surface,
    borderRadius: IDSTheme.borderRadius.md,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: IDSTheme.colors.border,
    ...IDSTheme.shadows.small,
  },
  insightCardAcknowledged: {
    opacity: 0.6,
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
    fontSize: 28,
    marginRight: IDSTheme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...IDSTheme.typography.h3,
    color: IDSTheme.colors.text.primary,
    marginBottom: IDSTheme.spacing.xs / 2,
  },
  timestamp: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
    fontSize: 11,
  },
  priorityBadge: {
    paddingHorizontal: IDSTheme.spacing.sm,
    paddingVertical: IDSTheme.spacing.xs / 2,
    borderRadius: IDSTheme.borderRadius.sm,
  },
  priorityText: {
    ...IDSTheme.typography.label,
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: IDSTheme.spacing.md,
  },
  recommendationBox: {
    backgroundColor: IDSTheme.colors.surfaceElevated,
    borderRadius: IDSTheme.borderRadius.sm,
    padding: IDSTheme.spacing.md,
    marginBottom: IDSTheme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: IDSTheme.colors.primary,
  },
  recommendationLabel: {
    ...IDSTheme.typography.label,
    color: IDSTheme.colors.primary,
    marginBottom: IDSTheme.spacing.xs,
    fontSize: 10,
  },
  recommendationText: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.text.primary,
    lineHeight: 22,
  },
  relatedAlerts: {
    marginBottom: IDSTheme.spacing.md,
  },
  relatedLabel: {
    ...IDSTheme.typography.caption,
    color: IDSTheme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  acknowledgeButton: {
    backgroundColor: IDSTheme.colors.primary,
    borderRadius: IDSTheme.borderRadius.sm,
    paddingVertical: IDSTheme.spacing.sm,
    alignItems: 'center',
    ...IDSTheme.shadows.small,
  },
  acknowledgeButtonText: {
    ...IDSTheme.typography.bodyBold,
    color: IDSTheme.colors.background,
  },
  acknowledgedBadge: {
    backgroundColor: IDSTheme.colors.surfaceElevated,
    borderRadius: IDSTheme.borderRadius.sm,
    paddingVertical: IDSTheme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IDSTheme.colors.success,
  },
  acknowledgedText: {
    ...IDSTheme.typography.body,
    color: IDSTheme.colors.success,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
    paddingHorizontal: IDSTheme.spacing.xl,
  },
  bottomSpacer: {
    height: IDSTheme.spacing.xxl,
  },
});
