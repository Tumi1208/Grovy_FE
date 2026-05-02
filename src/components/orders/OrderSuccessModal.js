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
  formatOrderDate,
  normalizeOrderStatus,
} from '../../utils/accountFormatting';
import { formatCurrency } from '../../utils/formatCurrency';
import DirectionalHint from '../DirectionalHint';
import PrimaryButton from '../PrimaryButton';
import ScalePressable from '../ScalePressable';

const ORDER_SUCCESS_ILLUSTRATION = require('../../assets/illustrations/order_success.png');
const MODAL_ENTER_DURATION_MS = 220;
const MODAL_EXIT_DURATION_MS = 170;
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

function SummaryRow({ isLast = false, label, value }) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function OrderSuccessCard({
  isDisabled = false,
  onBackToHome,
  onBuySimilarBasketAgain,
  onExploreSmartBaskets,
  onSaveBasket,
  onTrackOrder,
  order,
}) {
  const itemCount = getOrderItemCount(order);
  const orderItems = getOrderItems(order);
  const hasOrderItems = orderItems.length > 0;
  const statusLabel = normalizeOrderStatus(order?.status || 'processing');
  const handleSaveBasketPress = onSaveBasket
    ? onSaveBasket
    : () => Alert.alert(COMING_SOON_BASKET_ALERT);
  const handleBuySimilarBasketAgainPress = onBuySimilarBasketAgain
    ? onBuySimilarBasketAgain
    : () => Alert.alert(COMING_SOON_BASKET_ALERT);

  return (
    <View>
      <View style={styles.illustrationWrap}>
        <Image
          resizeMode="contain"
          source={ORDER_SUCCESS_ILLUSTRATION}
          style={styles.successIllustration}
        />
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusPillLabel}>Order confirmed</Text>
      </View>

      <Text style={styles.title}>Your basket is on the way</Text>
      <Text style={styles.subtitle}>
        Grovy has your items and is preparing them for delivery.
      </Text>

      {order?.id ? (
        <View style={styles.summaryCard}>
          <SummaryRow label="Order reference" value={order.id} />
          <SummaryRow
            label="Total"
            value={formatCurrency(order.totalAmount || 0)}
          />
          <SummaryRow label="Items" value={`${itemCount}`} />
          <SummaryRow label="Status" value={statusLabel} />
          <SummaryRow
            isLast
            label="Placed"
            value={formatOrderDate(order.createdAt)}
          />
        </View>
      ) : null}

      <View style={styles.smartActionCard}>
        <Text style={styles.smartActionEyebrow}>Smart actions</Text>
        <Text style={styles.smartActionTitle}>
          Want to shop faster next time?
        </Text>
        <Text style={styles.smartActionSubtitle}>
          Keep your next grocery run simple with a few quick shortcuts.
        </Text>
        <View style={styles.smartActionStack}>
          <SmartActionRow
            description="Jump back to Home and open the Smart Baskets section."
            isDisabled={isDisabled}
            isHighlighted
            onPress={onExploreSmartBaskets}
            statusLabel="Ready now"
            statusTone="live"
            title="Explore Smart Baskets"
          />
          {hasOrderItems ? (
            <SmartActionRow
              description="Keep this mix ready for a future checkout."
              isDisabled={isDisabled}
              onPress={handleSaveBasketPress}
              statusLabel="Coming soon"
              statusTone="soon"
              title="Save this basket"
            />
          ) : null}
          {hasOrderItems ? (
            <SmartActionRow
              description="Start from this order and fine-tune it later."
              isDisabled={isDisabled}
              onPress={handleBuySimilarBasketAgainPress}
              statusLabel="Coming soon"
              statusTone="soon"
              title="Buy similar basket again"
            />
          ) : null}
        </View>
      </View>

      <PrimaryButton
        disabled={isDisabled}
        onPress={onTrackOrder}
        style={styles.secondaryButton}
        title="Track order"
        variant="secondary"
      />
      <PrimaryButton
        disabled={isDisabled}
        onPress={onBackToHome}
        title="Back to Home"
      />
    </View>
  );
}

function OrderSuccessModal({
  onBackToHome,
  onBuySimilarBasketAgain,
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
  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardTranslateY = useRef(new Animated.Value(14)).current;

  const animateCard = useCallback(
    ({ isEntering, onComplete } = {}) => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: isEntering ? 1 : 0,
          duration: isEntering
            ? MODAL_ENTER_DURATION_MS
            : MODAL_EXIT_DURATION_MS,
          easing: isEntering ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: isEntering ? 1 : 0,
          duration: isEntering
            ? MODAL_ENTER_DURATION_MS
            : MODAL_EXIT_DURATION_MS,
          easing: isEntering
            ? Easing.out(Easing.cubic)
            : Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: isEntering ? 1 : 0.96,
          duration: isEntering
            ? MODAL_ENTER_DURATION_MS
            : MODAL_EXIT_DURATION_MS,
          easing: isEntering
            ? Easing.out(Easing.back(1.1))
            : Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: isEntering ? 0 : 10,
          duration: isEntering
            ? MODAL_ENTER_DURATION_MS
            : MODAL_EXIT_DURATION_MS,
          easing: isEntering
            ? Easing.out(Easing.cubic)
            : Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
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
            onBuySimilarBasketAgain={onBuySimilarBasketAgain}
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
      <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
        {content}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 18, 15, 0.42)',
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
    paddingVertical: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    ...UI_SHADOWS.floating,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successIllustration: {
    width: 148,
    height: 148,
  },
  statusPill: {
    alignSelf: 'center',
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D6E4D2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 10,
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
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.border,
  },
  summaryLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    paddingRight: 16,
    flex: 1,
  },
  summaryValue: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.bodyStrong,
    flex: 1,
    textAlign: 'right',
  },
  secondaryButton: {
    marginBottom: 12,
  },
});

export default OrderSuccessModal;
