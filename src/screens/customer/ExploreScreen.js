import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoryFallbackImage } from '../../assets/productImages';
import CustomerBottomNav from '../../components/CustomerBottomNav';
import ProductImage from '../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import {
  CUSTOMER_DEMO_PRODUCTS,
  EXPLORE_CATEGORY_CARDS,
} from '../../data/customerTabsData';
import { useCart } from '../../context/CartContext';

function SearchGlyph({ color = UI_COLORS.mutedStrong }) {
  return (
    <View style={styles.searchGlyph}>
      <View style={[styles.searchGlyphCircle, { borderColor: color }]} />
      <View style={[styles.searchGlyphHandle, { backgroundColor: color }]} />
    </View>
  );
}

function getCategoryCount(category) {
  return CUSTOMER_DEMO_PRODUCTS.filter(
    item => item.category.toLowerCase() === category.toLowerCase(),
  ).length;
}

function ExploreCategoryCard({ card, itemCount, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EDE4D8' }}
      onPress={() => onPress(card)}
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: card.backgroundColor,
          borderColor: card.borderColor,
        },
        pressed && styles.categoryCardPressed,
      ]}
    >
      <View style={styles.categoryCopy}>
        <View style={styles.categoryMetaRow}>
          <View style={styles.categoryCountPill}>
            <Text style={styles.categoryCountLabel}>{itemCount} items</Text>
          </View>
          <Text style={styles.categoryAction}>{'>'}</Text>
        </View>

        <Text style={styles.categoryLabel}>{card.title}</Text>
        <Text style={styles.categoryDescription}>{card.description}</Text>
      </View>

      <View style={styles.categoryImageWrap}>
        <ProductImage
          name={card.title}
          resizeMode="contain"
          source={getCategoryFallbackImage(card.category)}
          style={styles.categoryImage}
        />
      </View>
    </Pressable>
  );
}

function ExploreScreen({ navigation }) {
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return EXPLORE_CATEGORY_CARDS;
    }

    return EXPLORE_CATEGORY_CARDS.filter(card =>
      `${card.title} ${card.category} ${card.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);
  const hasNoCategoryResults = filteredCategories.length === 0;

  function handleClearSearch() {
    setSearchQuery('');
  }

  function handleOpenCategory(card) {
    navigation.navigate(CUSTOMER_ROUTES.CATEGORY_PRODUCTS, {
      category: card.category,
      title: card.title,
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Explore the store</Text>
          <Text style={styles.subtitle}>
            Browse aisles built around real grocery shopping, not decorative
            sections.
          </Text>

          <View style={styles.searchBar}>
            <SearchGlyph />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search aisles"
              placeholderTextColor={UI_COLORS.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {normalizedQuery ? (
              <Pressable
                android_ripple={{ color: '#ECE2D7' }}
                onPress={handleClearSearch}
                style={({ pressed }) => [
                  styles.clearSearchButton,
                  pressed && styles.clearSearchButtonPressed,
                ]}
              >
                <Text style={styles.clearSearchButtonLabel}>×</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>
              {filteredCategories.length} aisle
              {filteredCategories.length === 1 ? '' : 's'}
            </Text>
          </View>

          {filteredCategories.map(card => (
            <ExploreCategoryCard
              card={card}
              itemCount={getCategoryCount(card.category)}
              key={card.id}
              onPress={handleOpenCategory}
            />
          ))}

          {hasNoCategoryResults ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No aisles found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try another keyword to browse the grocery categories.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.bottomNavWrap}>
          <CustomerBottomNav
            activeRoute={CUSTOMER_ROUTES.EXPLORE}
            navigation={navigation}
            totalItems={totalItems}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: UI_COLORS.screen,
  },
  content: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: UI_LAYOUT.screenTop,
    paddingBottom: 132,
  },
  title: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    marginTop: 8,
    marginBottom: 20,
    maxWidth: '88%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 16,
    minHeight: UI_LAYOUT.searchHeight,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  searchGlyph: {
    width: 18,
    height: 18,
    position: 'relative',
    marginRight: 12,
  },
  searchGlyphCircle: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.8,
  },
  searchGlyphHandle: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 6,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    color: UI_COLORS.textStrong,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearSearchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: UI_COLORS.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearSearchButtonPressed: {
    opacity: 0.88,
  },
  clearSearchButtonLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 17,
    lineHeight: 17,
    fontWeight: '700',
  },
  resultRow: {
    marginBottom: 14,
  },
  resultLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  categoryCard: {
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  categoryCardPressed: {
    opacity: 0.96,
  },
  categoryCopy: {
    flex: 1,
    paddingRight: 16,
  },
  categoryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryCountPill: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryCountLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  categoryAction: {
    color: UI_COLORS.mutedStrong,
    fontSize: 18,
    fontWeight: '700',
  },
  categoryLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  categoryDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 8,
    maxWidth: '88%',
  },
  categoryImageWrap: {
    width: 92,
    height: 92,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 74,
    height: 74,
  },
  emptyState: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 22,
    marginTop: 8,
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: UI_LAYOUT.bottomNavSide,
    right: UI_LAYOUT.bottomNavSide,
    bottom: UI_LAYOUT.bottomNavBottom,
  },
});

export default ExploreScreen;
