import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import {
  getOrderStatusMeta,
  normalizeOrderStatus,
} from '../../utils/accountFormatting';
import { formatCurrency } from '../../utils/formatCurrency';
import DirectionalHint from '../DirectionalHint';
import PrimaryButton from '../PrimaryButton';
import ScalePressable from '../ScalePressable';

const ORDER_SUCCESS_ILLUSTRATION = require('../../assets/illustrations/order_success.png');
const MODAL_ENTER_DURATION_MS = 260;
const MODAL_EXIT_DURATION_MS = 180;
const CARD_ENTER_SCALE = 0.9;
const CARD_EXIT_SCALE = 0.97;
const CARD_ENTER_OFFSET = 22;
const CARD_EXIT_OFFSET = 14;
const COMING_SOON_BASKET_ALERT =
  'Coming soon: save this basket for next time.';

function getOrderItemCount(order) {
  if (typeof order?.itemCount === 'number') {
    return order.itemCount;
  }

  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0,
  );
}

function getOrderItems(order) {
  return Array.isArray(order?.items) ? order.items.filter(Boolean) : [];
}

function SmartActionRow({
  description,
  isDisabled = false,
  isHighlighted = false,
  onPress,
  statusLabel,
  statusTone = 'neutral',
  title,
}) {
  const isLiveStatus = statusTone === 'live';
  const isSoonStatus = statusTone === 'soon';

  return (
    <ScalePressable
      android_ripple={{ color: isHighlighted ? '#DCE8D7' : '#F0E8DD' }}
      disabled={isDisabled}
      onPress={onPress}
      pressScale={0.985}
      style={({ pressed }) => [
        styles.smartActionRow,
        isHighlighted && styles.smartActionRowHighlighted,
        pressed && !isDisabled && styles.smartActionRowPressed,
        isDisabled && styles.smartActionRowDisabled,
      ]}
    >
      <View
        style={[
          styles.smartActionAccent,
          isHighlighted
            ? styles.smartActionAccentHighlighted
            : styles.smartActionAccentNeutral,
        ]}
      />
      <View style={styles.smartActionRowBody}>
        <View style={styles.smartActionRowHeader}>
          <Text
            style={[
              styles.smartActionRowTitle,
              isHighlighted && styles.smartActionRowTitleHighlighted,
            ]}
          >
            {title}
          </Text>
          <DirectionalHint
            chevronSize={9}
            color={isHighlighted ? UI_COLORS.accentGreen : UI_COLORS.textStrong}
            mode="soft"
            size={22}
          />
        </View>
        {description ? (
          <Text style={styles.smartActionRowDescription}>{description}</Text>
        ) : null}
        {statusLabel ? (
          <View
            style={[
              styles.smartActionStatusPill,
              isLiveStatus && styles.smartActionStatusPillLive,
              isSoonStatus && styles.smartActionStatusPillSoon,
            ]}
          >
            <Text
              style={[
                styles.smartActionStatusLabel,
                isLiveStatus && styles.smartActionStatusLabelLive,
                isSoonStatus && styles.smartActionStatusLabelSoon,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </ScalePressable>
  );
}

function SummaryRow({
  isLast = false,
  label,
  value,
  valueEllipsizeMode = 'tail',
  valueNode = null,
  valueNumberOfLines = 1,
  valueStyle,
}) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <View style={styles.summaryValueWrap}>
        {valueNode ? (
          valueNode
        ) : (
          <Text
            ellipsizeMode={valueEllipsizeMode}
            numberOfLines={valueNumberOfLines}
            style={[styles.summaryValue, valueStyle]}
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

function OrderSuccessCard({
  isDisabled = false,
  onBackToHome,
  onExploreSmartBaskets,
  onSaveBasket,
  onTrackOrder,
  order,
}) {
  const itemCount = getOrderItemCount(order);
  const orderItems = getOrderItems(order);
  const hasOrderItems = orderItems.length > 0;
  const itemCountLabel = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  const orderReference = order?.id || order?._id || 'Pending';
  const statusLabel = normalizeOrderStatus(order?.status || 'processing');
  const statusMeta = getOrderStatusMeta(order?.status || 'processing');
  const handleSaveBasketPress = onSaveBasket
    ? onSaveBasket
    : () => Alert.alert(COMING_SOON_BASKET_ALERT);
  const showSmartActions = Boolean(onExploreSmartBaskets || hasOrderItems);
  const showOrderDetails =
    Boolean(order) || itemCount > 0 || Boolean(order?.totalAmount);

  return (
    <View>
      <View style={styles.illustrationWrap}>
        <View style={styles.illustrationHaloLarge} />
        <View style={styles.illustrationHaloSmall} />
        <Image
          resizeMode="contain"
          source={ORDER_SUCCESS_ILLUSTRATION}
          style={styles.successIllustration}
        />
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusPillLabel}>Success</Text>
      </View>

      <Text style={styles.title}>Your order has been accepted</Text>
      <Text style={styles.subtitle}>
        We're getting your groceries ready now.
      </Text>

      {showOrderDetails ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Order details</Text>
          <SummaryRow
            label="Reference"
            value={orderReference}
            valueEllipsizeMode="middle"
            valueStyle={styles.summaryValueReference}
          />
          <SummaryRow label="Item count" value={itemCountLabel} />
          <SummaryRow
            label="Total"
            value={formatCurrency(order?.totalAmount || 0)}
          />
          <SummaryRow
            isLast
            label="Status"
            valueNode={
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusMeta.backgroundColor,
                    borderColor: statusMeta.borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeLabel,
                    {
                      color: statusMeta.textColor,
                    },
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>
            }
          />
        </View>
      ) : null}

      {showSmartActions ? (
        <View style={styles.smartActionCard}>
          <Text style={styles.smartActionEyebrow}>Smart next steps</Text>
          <Text style={styles.smartActionTitle}>Make the next shop easier</Text>
          <Text style={styles.smartActionSubtitle}>
            Keep a couple of quick shortcuts handy for later.
          </Text>
          <View style={styles.smartActionStack}>
            {onExploreSmartBaskets ? (
              <SmartActionRow
                description="Jump back home and open Smart Baskets in one tap."
                isDisabled={isDisabled}
                isHighlighted
                onPress={onExploreSmartBaskets}
                statusLabel="Ready now"
                statusTone="live"
                title="Explore Smart Baskets"
              />
            ) : null}
            {hasOrderItems ? (
              <SmartActionRow
                description="Save this mix as a shortcut for a future checkout."
                isDisabled={isDisabled}
                onPress={handleSaveBasketPress}
                statusLabel="Coming soon"
                statusTone="soon"
                title="Save this basket"
              />
            ) : null}
          </View>
        </View>
      ) : null}

      <PrimaryButton
        disabled={isDisabled}
        onPress={onBackToHome}
        style={styles.primaryButton}
        title="Back to Home"
      />
      <PrimaryButton
        disabled={isDisabled}
        onPress={onTrackOrder}
        style={styles.secondaryButton}
        title="Track Order"
        variant="secondary"
      />
    </View>
  );
}

function OrderSuccessModal({
  onBackToHome,
  onExploreSmartBaskets,
  onRequestClose,
  onSaveBasket,
  onTrackOrder,
  order = null,
  presentation = 'modal',
  visible = false,
}) {
  const [isMounted, setIsMounted] = useState(
    presentation === 'screen' ? true : visible,
  );
  const [isClosing, setIsClosing] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(CARD_ENTER_SCALE)).current;
  const cardTranslateY = useRef(new Animated.Value(CARD_ENTER_OFFSET)).current;

  const animateCard = useCallback(
    ({ isEntering, onComplete } = {}) => {
      const animations = isEntering
        ? [
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: MODAL_ENTER_DURATION_MS,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: MODAL_ENTER_DURATION_MS - 20,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
              toValue: 1,
              tension: 52,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.spring(cardTranslateY, {
              toValue: 0,
              tension: 58,
              friction: 8,
              useNativeDriver: true,
            }),
          ]
        : [
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: MODAL_EXIT_DURATION_MS,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
              toValue: 0,
              duration: MODAL_EXIT_DURATION_MS,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(cardScale, {
              toValue: CARD_EXIT_SCALE,
              duration: MODAL_EXIT_DURATION_MS,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(cardTranslateY, {
              toValue: CARD_EXIT_OFFSET,
              duration: MODAL_EXIT_DURATION_MS,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ];

      if (isEntering) {
        overlayOpacity.setValue(0);
        cardOpacity.setValue(0);
        cardScale.setValue(CARD_ENTER_SCALE);
        cardTranslateY.setValue(CARD_ENTER_OFFSET);
      }

      Animated.parallel(animations).start(() => {
        onComplete?.();
      });
    },
    [cardOpacity, cardScale, cardTranslateY, overlayOpacity],
  );

  useEffect(() => {
    if (presentation === 'screen') {
      animateCard({ isEntering: true });
      return;
    }

    if (visible) {
      setIsMounted(true);
      setIsClosing(false);
      requestAnimationFrame(() => {
        animateCard({ isEntering: true });
      });
      return;
    }

    if (isMounted) {
      animateCard({
        isEntering: false,
        onComplete: () => {
          setIsMounted(false);
          setIsClosing(false);
        },
      });
    }
  }, [animateCard, isMounted, presentation, visible]);

  const handleAnimatedAction = useCallback(
    callback => {
      if (isClosing) {
        return;
      }

      setIsClosing(true);
      animateCard({
        isEntering: false,
        onComplete: () => {
          if (presentation !== 'screen') {
            setIsMounted(false);
          }

          setIsClosing(false);
          callback?.();
        },
      });
    },
    [animateCard, isClosing, presentation],
  );

  const handleBackToHomePress = useCallback(() => {
    handleAnimatedAction(onBackToHome);
  }, [handleAnimatedAction, onBackToHome]);

  const handleTrackOrderPress = useCallback(() => {
    handleAnimatedAction(onTrackOrder);
  }, [handleAnimatedAction, onTrackOrder]);

  const handleExploreSmartBasketsPress = useCallback(() => {
    handleAnimatedAction(onExploreSmartBaskets);
  }, [handleAnimatedAction, onExploreSmartBaskets]);

  const handleRequestClose = useCallback(() => {
    handleAnimatedAction(onRequestClose || onBackToHome || (() => null));
  }, [handleAnimatedAction, onBackToHome, onRequestClose]);

  const animatedCardStyle = useMemo(
    () => ({
      opacity: cardOpacity,
      transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
    }),
    [cardOpacity, cardScale, cardTranslateY],
  );
  const animatedOverlayStyle = useMemo(
    () => ({
      opacity: overlayOpacity,
    }),
    [overlayOpacity],
  );
  const content = (
    <ScrollView
      alwaysBounceVertical={false}
      bounces={false}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.centeredContent}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <OrderSuccessCard
            isDisabled={isClosing}
            onBackToHome={handleBackToHomePress}
            onExploreSmartBaskets={handleExploreSmartBasketsPress}
            onSaveBasket={onSaveBasket}
            onTrackOrder={handleTrackOrderPress}
            order={order}
          />
        </Animated.View>
      </View>
    </ScrollView>
  );

  if (presentation === 'screen') {
    return (
      <View style={styles.screenCanvas}>
        <Animated.View style={[styles.screenGlow, animatedOverlayStyle]} />
        {content}
      </View>
    );
  }

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={handleRequestClose}
      statusBarTranslucent
      transparent
      visible={isMounted}
    >
      <View style={styles.modalCanvas}>
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, animatedOverlayStyle]}
        />
        {content}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 20, 18, 0.48)',
  },
  modalCanvas: {
    flex: 1,
  },
  screenCanvas: {
    flex: 1,
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(84, 122, 78, 0.06)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centeredContent: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
    ...UI_SHADOWS.floating,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginBottom: 8,
    position: 'relative',
  },
  illustrationHaloLarge: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(84, 122, 78, 0.11)',
  },
  illustrationHaloSmall: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(84, 122, 78, 0.07)',
  },
  successIllustration: {
    width: 148,
    height: 148,
  },
  statusPill: {
    alignSelf: 'center',
    borderRadius: UI_RADIUS.round,
    backgroundColor: '#EEF6EC',
    borderWidth: 1,
    borderColor: '#D6E7D1',
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginBottom: 12,
  },
  statusPillLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  title: {
    color: UI_COLORS.textStrong,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    textAlign: 'center',
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: '#FCFAF6',
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  summaryCardTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
    marginBottom: 4,
  },
  smartActionCard: {
    backgroundColor: '#FBF7F0',
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#EADCCA',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  smartActionEyebrow: {
    color: UI_COLORS.bannerAccent,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    letterSpacing: 0.35,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  smartActionTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
    marginBottom: 4,
  },
  smartActionSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginBottom: 12,
  },
  smartActionStack: {
    gap: 10,
  },
  smartActionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    backgroundColor: UI_COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  smartActionRowHighlighted: {
    backgroundColor: '#F0F7EC',
    borderColor: '#D7E6D2',
  },
  smartActionRowPressed: {
    opacity: 0.88,
  },
  smartActionRowDisabled: {
    opacity: 0.55,
  },
  smartActionAccent: {
    width: 4,
    borderRadius: UI_RADIUS.round,
    marginRight: 12,
  },
  smartActionAccentHighlighted: {
    backgroundColor: UI_COLORS.accentGreen,
  },
  smartActionAccentNeutral: {
    backgroundColor: UI_COLORS.bannerAccent,
  },
  smartActionRowBody: {
    flex: 1,
  },
  smartActionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  smartActionRowTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.cardTitle,
    flex: 1,
    paddingRight: 12,
  },
  smartActionRowTitleHighlighted: {
    color: UI_COLORS.accentGreen,
  },
  smartActionRowDescription: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 4,
  },
  smartActionStatusPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: UI_RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smartActionStatusPillLive: {
    backgroundColor: UI_COLORS.accentGreenSoft,
  },
  smartActionStatusPillSoon: {
    backgroundColor: '#F8E9DB',
  },
  smartActionStatusLabel: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  smartActionStatusLabelLive: {
    color: UI_COLORS.accentGreen,
  },
  smartActionStatusLabelSoon: {
    color: UI_COLORS.bannerAccent,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.borderSoft,
  },
  summaryLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    paddingRight: 16,
    flex: 1,
  },
  summaryValueWrap: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 0,
  },
  summaryValue: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.bodyStrong,
    textAlign: 'right',
  },
  summaryValueReference: {
    letterSpacing: 0.2,
  },
  statusBadge: {
    borderRadius: UI_RADIUS.round,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 2,
  },
});

export default OrderSuccessModal;
