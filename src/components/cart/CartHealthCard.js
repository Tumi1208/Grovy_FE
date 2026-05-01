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
  fruit: 'fruit',
  vegetable: 'vegetables',
  protein: 'protein',
  pantry: 'pantry basics',
  beverageOrDairy: 'drinks or dairy',
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

function CartHealthCard({ items }) {
  const cartItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (!cartItems.length) {
    return null;
  }

  const health = CalculateCartHealth(cartItems);
  const positiveMessage = getPositiveMessage(health.presentGroups);
  const suggestions = getVisibleSuggestions(
    health.missingGroups,
    health.score,
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Cart Health Check</Text>
          <View style={styles.labelPill}>
            <Text style={styles.labelText}>{health.label}</Text>
          </View>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>
            {health.score}
            <Text style={styles.scoreSuffix}>/100</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.positiveText}>{positiveMessage}</Text>

      {suggestions.length ? (
        <View style={styles.suggestionSection}>
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
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#D5E1D0',
    padding: 16,
    marginBottom: 16,
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
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
  },
  labelPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: UI_RADIUS.round,
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
    minWidth: 86,
    borderRadius: 18,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: '#D5E1D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
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
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.bodyStrong,
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
    borderRadius: UI_RADIUS.round,
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
