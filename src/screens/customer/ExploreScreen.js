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
import { EXPLORE_CATEGORY_CARDS } from '../../data/customerTabsData';
import { useCart } from '../../context/CartContext';

const EXPLORE_COLORS = Object.freeze({
  screen: '#FCF8F3',
  surface: '#FFFFFF',
  border: '#EEE7DF',
  text: '#211A16',
  muted: '#7F7870',
  accent: '#D71920',
  shadow: '#2A160B',
});

function SearchGlyph({ color = '#7F7870' }) {
  return (
    <View style={styles.searchGlyph}>
      <View style={[styles.searchGlyphCircle, { borderColor: color }]} />
      <View style={[styles.searchGlyphHandle, { backgroundColor: color }]} />
    </View>
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
      `${card.title} ${card.category}`.toLowerCase().includes(normalizedQuery),
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
          <Text style={styles.title}>Find Products</Text>

          <View style={styles.searchBar}>
            <SearchGlyph />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search Store"
              placeholderTextColor={EXPLORE_COLORS.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {normalizedQuery ? (
              <Pressable
                android_ripple={{ color: '#EFE8E1' }}
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

          <View style={styles.categoryGrid}>
            {filteredCategories.map(card => (
              <Pressable
                key={card.id}
                android_ripple={{ color: '#EFE8E1' }}
                onPress={() => handleOpenCategory(card)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  {
                    backgroundColor: card.backgroundColor,
                    borderColor: card.borderColor,
                  },
                  pressed && styles.categoryCardPressed,
                ]}
              >
                <ProductImage
                  name={card.title}
                  resizeMode="contain"
                  source={getCategoryFallbackImage(card.category)}
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryLabel}>{card.title}</Text>
              </Pressable>
            ))}
          </View>

          {hasNoCategoryResults ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No categories found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try another keyword to browse the category grid.
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
    backgroundColor: EXPLORE_COLORS.screen,
  },
  screen: {
    flex: 1,
    backgroundColor: EXPLORE_COLORS.screen,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 132,
  },
  title: {
    color: EXPLORE_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EXPLORE_COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 22,
    shadowColor: EXPLORE_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
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
    color: EXPLORE_COLORS.text,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8DFD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  clearSearchButtonPressed: {
    opacity: 0.88,
  },
  clearSearchButtonLabel: {
    color: EXPLORE_COLORS.muted,
    fontSize: 18,
    lineHeight: 18,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47.5%',
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 18,
    marginBottom: 14,
  },
  categoryCardPressed: {
    opacity: 0.92,
  },
  categoryImage: {
    width: 88,
    height: 74,
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  categoryLabel: {
    color: EXPLORE_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: EXPLORE_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: EXPLORE_COLORS.border,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: EXPLORE_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: EXPLORE_COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
  },
});

export default ExploreScreen;
