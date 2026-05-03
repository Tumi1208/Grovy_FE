import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import ScalePressable from '../ScalePressable';
import { getProductImage } from '../../constants/productImages';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_SPACING,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { formatCurrency } from '../../utils/formatCurrency';

const SMART_RAIL_GAP = 14;

const COLLECTION_VARIANTS = Object.freeze({
  basket: {
    cardBackground: '#F3EBDD',
    cardBorder: '#E4D7C7',
    badgeBackground: '#E7F0E4',
    badgeText: UI_COLORS.accentGreen,
    previewBackground: '#FFFFFF',
    previewBorder: '#E5D9CC',
    emptyPreviewBackground: '#ECE4D8',
  },
  recipe: {
    cardBackground: '#F6EEE5',
    cardBorder: '#E5DACE',
    badgeBackground: '#FCEADF',
    badgeText: UI_COLORS.accentRed,
    previewBackground: '#FFF8F1',
    previewBorder: '#E8DCCF',
    emptyPreviewBackground: '#F1E4D6',
  },
});

function SmartRailSpacer() {
  return <View style={styles.railSpacer} />;
}

function getCollectionVariant(variant) {
  return COLLECTION_VARIANTS[variant] || COLLECTION_VARIANTS.basket;
}

function getItemCountLabel(count) {
  if (!count) {
    return 'No match';
  }

  return `${count} item${count === 1 ? '' : 's'}`;
}

function getCollectionHint(collection) {
  if (collection.missingCount > 0) {
    return `${collection.missingCount} missing item${
      collection.missingCount === 1 ? '' : 's'
    } skipped safely`;
  }

  if (collection.unavailableCount > 0) {
    return `${collection.unavailableCount} out of stock item${
      collection.unavailableCount === 1 ? '' : 's'
    } skipped at add time`;
  }

  if (collection.addableCount > 0) {
    return 'Ready to add in one tap';
  }

  return 'Waiting for matching products';
}

function getCollectionEyebrow(variant) {
  return variant === 'recipe' ? 'Recipe to cart' : 'Smart basket';
}

function getCollectionAvailabilitySummary(collection) {
  const totalCount = Number(collection?.itemCount) || 0;
  const addableCount = Number(collection?.addableCount) || 0;

  if (!totalCount) {
    return 'Matching groceries will appear here as the catalog refreshes.';
  }

  if (addableCount >= totalCount) {
    return 'All ingredients are ready for one-tap add.';
  }

  return `${addableCount} of ${totalCount} groceries are ready right now.`;
}

function getBudgetHint(budget, estimatedTotal) {
  const normalizedBudget = Number(budget);
  const normalizedTotal = Number(estimatedTotal);

  if (!Number.isFinite(normalizedBudget) || normalizedBudget <= 0) {
    return '';
  }

  if (!Number.isFinite(normalizedTotal) || normalizedTotal <= 0) {
    return 'No matching products are available right now.';
  }

  const remainingBudget = Math.max(0, normalizedBudget - normalizedTotal);

  if (remainingBudget < 0.25) {
    return 'Right on budget.';
  }

  return `${formatCurrency(remainingBudget)} left in the budget.`;
}

function getCollectionTags(collection = {}) {
  return Array.isArray(collection.tags)
    ? collection.tags.filter(Boolean).slice(0, 3)
    : [];
}

function PreviewStack({ products = [], variant = 'basket' }) {
  const previewProducts = products.slice(0, 3);
  const variantStyles = getCollectionVariant(variant);

  if (!previewProducts.length) {
    return (
      <View
        style={[
          styles.previewPlaceholder,
          { backgroundColor: variantStyles.emptyPreviewBackground },
        ]}
      >
        <Text style={styles.previewPlaceholderLabel}>Soon</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewStack}>
      {previewProducts.map((product, index) => (
        <View
          key={product.id || `${product.name}-${index}`}
          style={[
            styles.previewBubble,
            index === 0 ? null : styles.previewBubbleOffset,
            {
              backgroundColor: variantStyles.previewBackground,
              borderColor: variantStyles.previewBorder,
              zIndex: previewProducts.length - index,
            },
          ]}
        >
          <Image
            resizeMode="contain"
            source={getProductImage(product.imageKey)}
            style={styles.previewImage}
          />
        </View>
      ))}
    </View>
  );
}

function CollectionActionButton({ disabled, label, onPress }) {
  return (
    <ScalePressable
      android_ripple={{ color: '#3C6240' }}
      disabled={disabled}
      onPress={onPress}
      pressScale={0.985}
      style={({ pressed }) => [
        styles.actionButton,
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && styles.actionButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.actionButtonLabel,
          disabled && styles.actionButtonLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </ScalePressable>
  );
}

function SmartCollectionCard({
  actionLabel,
  cardWidth,
  collection,
  onActionPress,
  onPress,
  variant = 'basket',
}) {
  const variantStyles = getCollectionVariant(variant);
  const hasAddableProducts = collection.addableCount > 0;

  return (
    <ScalePressable
      android_ripple={{ color: '#EFE5D8' }}
      disabled={!collection.previewProducts?.length}
      onPress={() => onPress?.(collection)}
      pressScale={0.988}
      style={({ pressed }) => [
        styles.collectionCard,
        {
          width: cardWidth,
          backgroundColor: variantStyles.cardBackground,
          borderColor: variantStyles.cardBorder,
        },
        pressed && styles.collectionCardPressed,
      ]}
    >
      <View
        style={[
          styles.collectionPreviewPanel,
          { borderColor: variantStyles.previewBorder },
        ]}
      >
        <View style={styles.collectionTopRow}>
          <View
            style={[
              styles.collectionEyebrowBadge,
              { backgroundColor: variantStyles.badgeBackground },
            ]}
          >
            <Text
              style={[
                styles.collectionEyebrowBadgeLabel,
                { color: variantStyles.badgeText },
              ]}
            >
              {getCollectionEyebrow(variant)}
            </Text>
          </View>

          <View
            style={[
              styles.collectionBadge,
              { backgroundColor: variantStyles.previewBackground },
            ]}
          >
            <Text
              style={[
                styles.collectionBadgeLabel,
                { color: variantStyles.badgeText },
              ]}
            >
              {getItemCountLabel(collection.itemCount)}
            </Text>
          </View>
        </View>

        <View style={styles.collectionPreviewContent}>
          <PreviewStack
            products={collection.previewProducts}
            variant={variant}
          />
          <View style={styles.collectionPreviewSummary}>
            <Text style={styles.collectionPreviewSummaryLabel}>Grovy note</Text>
            <Text
              numberOfLines={2}
              style={styles.collectionPreviewSummaryValue}
            >
              {getCollectionAvailabilitySummary(collection)}
            </Text>
          </View>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.collectionTitle}>
        {collection.title}
      </Text>
      <Text numberOfLines={2} style={styles.collectionSubtitle}>
        {collection.subtitle}
      </Text>

      {getCollectionTags(collection).length ? (
        <View style={styles.collectionTagRow}>
          {getCollectionTags(collection).map(tag => (
            <View key={tag} style={styles.collectionTag}>
              <Text style={styles.collectionTagLabel}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.collectionMetricsRow}>
        <View style={styles.collectionMetricCard}>
          <Text style={styles.collectionMetricLabel}>Est. total</Text>
          <Text style={styles.collectionMetricValue}>
            {formatCurrency(collection.estimatedTotal)}
          </Text>
        </View>
        <View style={styles.collectionMetricCard}>
          <Text style={styles.collectionMetricLabel}>Ready</Text>
          <Text style={styles.collectionMetricValue}>
            {collection.addableCount}
          </Text>
        </View>
      </View>

      <View style={styles.collectionHintCard}>
        <Text style={styles.collectionHintEyebrow}>Why it helps</Text>
        <Text numberOfLines={2} style={styles.collectionHint}>
          {getCollectionHint(collection)}
        </Text>
      </View>

      <CollectionActionButton
        disabled={!hasAddableProducts}
        label={hasAddableProducts ? actionLabel : 'Unavailable'}
        onPress={event => {
          event.stopPropagation();
          onActionPress?.(collection);
        }}
      />
    </ScalePressable>
  );
}

export function HomeSmartCollectionRow({
  actionLabel,
  cardWidth,
  items,
  onActionPress,
  onPress,
  variant = 'basket',
}) {
  if (!items.length) {
    return null;
  }

  return (
    <FlatList
      bounces={false}
      horizontal
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.railContent}
      data={items}
      decelerationRate="fast"
      disableIntervalMomentum
      ItemSeparatorComponent={SmartRailSpacer}
      keyExtractor={item => item.id}
      nestedScrollEnabled
      snapToAlignment="start"
      snapToInterval={cardWidth + SMART_RAIL_GAP}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <SmartCollectionCard
          actionLabel={actionLabel}
          cardWidth={cardWidth}
          collection={item}
          onActionPress={onActionPress}
          onPress={onPress}
          variant={variant}
        />
      )}
    />
  );
}

export function HomeBudgetModePanel({
  budgetPresets,
  onAddSuggestion,
  onOpenProduct,
  onSelectPreset,
  selectedPreset,
  suggestion,
}) {
  const hasSuggestion = suggestion.products.length > 0;
  const previewProducts = hasSuggestion ? suggestion.products.slice(0, 5) : [];
  const hiddenProductCount = hasSuggestion
    ? Math.max(0, suggestion.products.length - previewProducts.length)
    : 0;
  const selectedBudget = Number(selectedPreset?.budget) || 0;
  const remainingBudget = hasSuggestion
    ? Math.max(0, selectedBudget - suggestion.estimatedTotal)
    : selectedBudget;

  return (
    <View style={styles.budgetPanel}>
      <View style={styles.budgetIntro}>
        <Text style={styles.budgetIntroEyebrow}>Grovy assistant</Text>
        <Text style={styles.budgetIntroTitle}>Build around your budget</Text>
        <Text style={styles.budgetIntroSubtitle}>
          Choose a limit and Grovy will assemble a practical grocery mix.
        </Text>
      </View>

      <View style={styles.budgetPresetRow}>
        {budgetPresets.map(preset => {
          const isActive = preset.id === selectedPreset?.id;

          return (
            <ScalePressable
              key={preset.id}
              android_ripple={{ color: '#DCE8D9' }}
              onPress={() => onSelectPreset?.(preset)}
              pressScale={0.985}
              style={({ pressed }) => [
                styles.budgetPresetChip,
                isActive && styles.budgetPresetChipActive,
                pressed && styles.budgetPresetChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.budgetPresetChipAmount,
                  isActive && styles.budgetPresetChipAmountActive,
                ]}
              >
                {formatCurrency(preset.budget)}
              </Text>
              <Text
                style={[
                  styles.budgetPresetChipLabel,
                  isActive && styles.budgetPresetChipLabelActive,
                ]}
              >
                {preset.label}
              </Text>
            </ScalePressable>
          );
        })}
      </View>

      <View style={styles.budgetPresetSummaryCard}>
        <View style={styles.budgetPresetSummaryCopy}>
          <Text style={styles.budgetPresetSummaryEyebrow}>Selected mode</Text>
          <Text style={styles.budgetPresetSummaryTitle}>
            {selectedPreset?.label || 'Budget basket'}
          </Text>
          <Text style={styles.budgetPresetSummarySubtitle}>
            {selectedPreset?.description ||
              'Let Grovy balance your essentials within a budget.'}
          </Text>
        </View>

        <View style={styles.budgetPresetSummaryPill}>
          <Text style={styles.budgetPresetSummaryPillLabel}>Cap</Text>
          <Text style={styles.budgetPresetSummaryPillValue}>
            {formatCurrency(selectedBudget)}
          </Text>
        </View>
      </View>

      <View style={styles.budgetResultCard}>
        <View style={styles.budgetResultHeader}>
          <View style={styles.budgetResultCopy}>
            <Text style={styles.budgetResultTitle}>
              {selectedPreset?.label || 'Budget basket'}
            </Text>
            <Text style={styles.budgetResultSubtitle}>
              {hasSuggestion
                ? `${selectedPreset?.description || 'Practical essentials'} ${
                    suggestion.products.length
                  } item${
                    suggestion.products.length === 1 ? '' : 's'
                  } selected.`
                : 'No matching basket is available right now.'}
            </Text>
          </View>

          <View style={styles.budgetTotalPill}>
            <Text style={styles.budgetTotalCaption}>Estimated</Text>
            <Text style={styles.budgetTotalLabel}>
              {formatCurrency(suggestion.estimatedTotal)}
            </Text>
          </View>
        </View>

        <View style={styles.budgetMetricRow}>
          <View style={styles.budgetMetricCard}>
            <Text style={styles.budgetMetricLabel}>Budget cap</Text>
            <Text style={styles.budgetMetricValue}>
              {formatCurrency(selectedBudget)}
            </Text>
          </View>
          <View style={styles.budgetMetricCard}>
            <Text style={styles.budgetMetricLabel}>Items picked</Text>
            <Text style={styles.budgetMetricValue}>
              {suggestion.products.length}
            </Text>
          </View>
          <View style={styles.budgetMetricCard}>
            <Text style={styles.budgetMetricLabel}>Left to spend</Text>
            <Text style={styles.budgetMetricValue}>
              {formatCurrency(remainingBudget)}
            </Text>
          </View>
        </View>

        <View style={styles.budgetProductWrap}>
          {hasSuggestion ? (
            <>
              {previewProducts.map(product => (
                <ScalePressable
                  key={product.id}
                  android_ripple={{ color: '#EEE6DD' }}
                  onPress={() => onOpenProduct?.(product)}
                  pressScale={0.98}
                  style={({ pressed }) => [
                    styles.budgetProductChip,
                    pressed && styles.budgetProductChipPressed,
                  ]}
                >
                  <Text numberOfLines={1} style={styles.budgetProductChipLabel}>
                    {product.name}
                  </Text>
                </ScalePressable>
              ))}
              {hiddenProductCount > 0 ? (
                <View style={styles.budgetMoreChip}>
                  <Text style={styles.budgetMoreChipLabel}>
                    +{hiddenProductCount} more
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.budgetEmptyText}>
              Try another preset when more products are in stock.
            </Text>
          )}
        </View>

        <View style={styles.budgetFooter}>
          <Text style={styles.budgetHint}>
            {getBudgetHint(selectedPreset?.budget, suggestion.estimatedTotal)}
          </Text>

          <CollectionActionButton
            disabled={!hasSuggestion}
            label={hasSuggestion ? 'Add budget basket' : 'Unavailable'}
            onPress={onAddSuggestion}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  railContent: {
    paddingHorizontal: UI_LAYOUT.homeScreenPadding,
    paddingVertical: 4,
  },
  railSpacer: {
    width: SMART_RAIL_GAP,
  },
  previewStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewBubbleOffset: {
    marginLeft: -12,
  },
  previewImage: {
    width: 34,
    height: 34,
  },
  previewPlaceholder: {
    width: 78,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholderLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  collectionCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    minHeight: 318,
    ...UI_SHADOWS.card,
  },
  collectionCardPressed: {
    opacity: 0.985,
  },
  collectionPreviewPanel: {
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    padding: 14,
    marginBottom: 18,
  },
  collectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  collectionEyebrowBadge: {
    borderRadius: UI_RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  collectionEyebrowBadgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
  },
  collectionBadge: {
    borderRadius: UI_RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 12,
  },
  collectionBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  collectionPreviewContent: {
    alignItems: 'flex-start',
  },
  collectionPreviewSummary: {
    width: '100%',
    marginTop: 12,
  },
  collectionPreviewSummaryLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.36,
    marginBottom: 6,
  },
  collectionPreviewSummaryValue: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  collectionTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
    minHeight: 48,
  },
  collectionSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 6,
    minHeight: 38,
  },
  collectionTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    marginBottom: 2,
    gap: 8,
  },
  collectionTag: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  collectionTagLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  collectionMetricsRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 12,
    gap: 10,
  },
  collectionMetricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  collectionMetricLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  collectionMetricValue: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 4,
  },
  collectionHint: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    lineHeight: 17,
    minHeight: 34,
  },
  collectionHintCard: {
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  collectionHintEyebrow: {
    color: UI_COLORS.textStrong,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.36,
    marginBottom: 5,
  },
  actionButton: {
    marginTop: 'auto',
    borderRadius: 16,
    backgroundColor: UI_COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  actionButtonDisabled: {
    backgroundColor: UI_COLORS.surfaceTint,
  },
  actionButtonPressed: {
    backgroundColor: UI_COLORS.accentGreenPressed,
    opacity: 0.96,
  },
  actionButtonLabel: {
    color: UI_COLORS.surface,
    ...UI_TYPOGRAPHY.button,
  },
  actionButtonLabelDisabled: {
    color: UI_COLORS.mutedStrong,
  },
  budgetPanel: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    ...UI_SHADOWS.card,
  },
  budgetIntro: {
    marginBottom: 16,
  },
  budgetIntroEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
    marginBottom: 6,
  },
  budgetIntroTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
  },
  budgetIntroSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  budgetPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 10,
  },
  budgetPresetChip: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  budgetPresetChipActive: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D7E4D4',
  },
  budgetPresetChipPressed: {
    opacity: 0.95,
  },
  budgetPresetChipAmount: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  budgetPresetChipAmountActive: {
    color: UI_COLORS.accentGreen,
  },
  budgetPresetChipLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  budgetPresetChipLabelActive: {
    color: UI_COLORS.accentGreen,
  },
  budgetPresetSummaryCard: {
    borderRadius: 20,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  budgetPresetSummaryCopy: {
    flex: 1,
    paddingRight: 12,
  },
  budgetPresetSummaryEyebrow: {
    color: UI_COLORS.accentGreen,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.36,
    marginBottom: 5,
  },
  budgetPresetSummaryTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  budgetPresetSummarySubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  budgetPresetSummaryPill: {
    borderRadius: 16,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 82,
    alignItems: 'center',
  },
  budgetPresetSummaryPillLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.34,
    marginBottom: 4,
  },
  budgetPresetSummaryPillValue: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  budgetResultCard: {
    borderRadius: 24,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    padding: 16,
  },
  budgetResultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  budgetResultCopy: {
    flex: 1,
    paddingRight: 12,
  },
  budgetResultTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
  },
  budgetResultSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  budgetTotalPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  budgetTotalCaption: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 4,
  },
  budgetTotalLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  budgetMetricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  budgetMetricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  budgetMetricLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.34,
    marginBottom: 4,
  },
  budgetMetricValue: {
    color: UI_COLORS.textStrong,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  budgetProductWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  budgetProductChip: {
    maxWidth: '100%',
    borderRadius: 16,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  budgetProductChipPressed: {
    opacity: 0.9,
  },
  budgetProductChipLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  budgetMoreChip: {
    borderRadius: 16,
    backgroundColor: UI_COLORS.surfaceTint,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  budgetMoreChipLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  budgetEmptyText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  budgetFooter: {
    marginTop: 18,
  },
  budgetHint: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: UI_SPACING.md,
  },
});
