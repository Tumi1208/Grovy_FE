import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
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
import PrimaryButton from '../PrimaryButton';

const ORDER_SUCCESS_ILLUSTRATION = require('../../assets/illustrations/order_success.png');
const MODAL_ENTER_DURATION_MS = 220;
const MODAL_EXIT_DURATION_MS = 170;

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
  onTrackOrder,
  order,
}) {
  const itemCount = getOrderItemCount(order);
  const statusLabel = normalizeOrderStatus(order?.status || 'processing');

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
  onRequestClose,
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
    <View style={styles.centeredContent}>
      <Animated.View style={[styles.card, animatedCardStyle]}>
        <OrderSuccessCard
          isDisabled={isClosing}
          onBackToHome={handleBackToHomePress}
          onTrackOrder={handleTrackOrderPress}
          order={order}
        />
      </Animated.View>
    </View>
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
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  card: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    ...UI_SHADOWS.floating,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIllustration: {
    width: 168,
    height: 168,
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
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 18,
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
