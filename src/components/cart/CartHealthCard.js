import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { CalculateCartHealth } from '../../utils/smartShoppingHelpers';

const GROUP_LABELS = Object.freeze({
  fruit: 'Fruit',
  vegetable: 'Vegetables',
  protein: 'Protein',
  pantry: 'Pantry basics',
  beverageOrDairy: 'Drinks or dairy',
});

const GROUP_SUGGESTIONS = Object.freeze({
  fruit: 'Add fruit for quick snacks.',
  vegetable: 'Add vegetables for more cooking variety.',
  protein: 'Add eggs, chicken, or beef for protein.',
  pantry: 'Add pantry basics like rice or noodles.',
  beverageOrDairy: 'Add juice or dairy for easy pairings.',
});

function formatList(items = []) {
  if (!items.length) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function getPositiveMessage(presentGroups = []) {
  const visibleGroups = presentGroups
    .map(group => GROUP_LABELS[group])
    .filter(Boolean)
    .slice(0, 3);

  if (!visibleGroups.length) {
    return 'Start with a few staples to build variety.';
  }

  return `You have ${formatList(visibleGroups)}.`;
}

function getVisibleSuggestions(missingGroups = [], score = 0) {
  const maxSuggestions = score >= 80 ? 1 : 2;

  return missingGroups
    .map(group => GROUP_SUGGESTIONS[group])
    .filter(Boolean)
    .slice(0, maxSuggestions);
}

function getAssistantMessage(health) {
  if (health.score >= 80) {
    return 'Balanced basket. Grovy likes the mix you already have.';
  }

  if (health.score >= 50) {
    return 'Good start. One or two more categories will make this basket more complete.';
  }

  return 'Needs variety. Add a couple of essentials and Grovy can help round this out.';
}

function getVisiblePositives(positives = []) {
  return positives.filter(Boolean).slice(0, 2);
}

function CartHealthCard({ items }) {
  const cartItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (!cartItems.length) {
    return null;
  }

  const health = CalculateCartHealth(cartItems);
  const positiveMessage = getPositiveMessage(health.presentGroups);
  const suggestions = getVisibleSuggestions(health.missingGroups, health.score);
  const visiblePositives = getVisiblePositives(health.positives);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Grovy assistant</Text>
          <Text style={styles.title}>Cart Health Check</Text>
          <Text style={styles.summaryText}>{getAssistantMessage(health)}</Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreCaption}>Score</Text>
          <Text style={styles.scoreValue}>
            {health.score}
            <Text style={styles.scoreSuffix}>/100</Text>
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.max(8, health.score)}%` },
          ]}
        />
      </View>

      <View style={styles.labelRow}>
        <View style={styles.labelPill}>
          <Text style={styles.labelText}>{health.label}</Text>
        </View>
        <Text style={styles.positiveText}>{positiveMessage}</Text>
      </View>

      {visiblePositives.length ? (
        <View style={styles.positiveSection}>
          <Text style={styles.sectionLabel}>Looking good</Text>
          {visiblePositives.map(positive => (
            <View key={positive} style={styles.positiveRow}>
              <View style={styles.positiveDot} />
              <Text style={styles.positiveRowText}>{positive}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {suggestions.length ? (
        <View style={styles.suggestionSection}>
          <Text style={styles.sectionLabel}>Try next</Text>
          {suggestions.map(suggestion => (
            <View key={suggestion} style={styles.suggestionRow}>
              <View style={styles.suggestionDot} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: UI_COLORS.successSoft,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: '#D5E1D0',
    padding: 18,
    marginBottom: 18,
    ...UI_SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginBottom: 6,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
  },
  summaryText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  progressTrack: {
    height: 10,
    borderRadius: UI_RADIUS.pill,
    backgroundColor: 'rgba(79, 122, 74, 0.12)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: UI_RADIUS.pill,
    backgroundColor: UI_COLORS.accentGreen,
  },
  labelRow: {
    marginBottom: 12,
  },
  labelPill: {
    alignSelf: 'flex-start',
    borderRadius: UI_RADIUS.pill,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: '#D5E1D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  labelText: {
    color: UI_COLORS.successText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  scoreBadge: {
    minWidth: 92,
    borderRadius: 20,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: '#D5E1D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  scoreCaption: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 4,
  },
  scoreValue: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  scoreSuffix: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  positiveText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 8,
  },
  sectionLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 8,
  },
  positiveSection: {
    marginBottom: 10,
  },
  positiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  positiveDot: {
    width: 6,
    height: 6,
    borderRadius: UI_RADIUS.pill,
    backgroundColor: UI_COLORS.accentGreen,
    marginTop: 8,
    marginRight: 8,
  },
  positiveRowText: {
    flex: 1,
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  suggestionSection: {
    marginTop: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: UI_RADIUS.pill,
    backgroundColor: UI_COLORS.accentGreen,
    marginTop: 8,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
});

export default CartHealthCard;
