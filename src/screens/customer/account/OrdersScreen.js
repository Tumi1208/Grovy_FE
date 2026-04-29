import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AccountScene from '../../../components/account/AccountScene';
import ChevronIcon from '../../../components/icons/ChevronIcon';
import { CUSTOMER_ROUTES } from '../../../constants/routes';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import { useAccountData } from '../../../context/AccountDataContext';
import {
  formatOrderDate,
  getOrderStatusMeta,
  isRecentOrder,
  normalizeOrderStatus,
} from '../../../utils/accountFormatting';
import { formatCurrency } from '../../../utils/formatCurrency';

function StatusBadge({ status }) {
  const normalizedStatus = normalizeOrderStatus(status);
  const statusMeta = getOrderStatusMeta(normalizedStatus);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: statusMeta.backgroundColor,
          borderColor: statusMeta.borderColor,
        },
      ]}
    >
      <Text style={[styles.statusBadgeLabel, { color: statusMeta.textColor }]}>
        {normalizedStatus}
      </Text>
    </View>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function OrderCard({ onPress, order }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE6DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.orderCard,
        pressed && styles.orderCardPressed,
      ]}
    >
      <View style={styles.orderCardTopRow}>
        <View style={styles.orderCopy}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderDate}>Placed on {formatOrderDate(order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.orderMetaRow}>
        <View style={styles.orderMetaBlock}>
          <Text style={styles.orderMetaLabel}>Total</Text>
          <Text style={styles.orderMetaValue}>
            {formatCurrency(order.totalAmount || 0)}
          </Text>
        </View>

        <View style={styles.orderMetaBlock}>
          <Text style={styles.orderMetaLabel}>Items</Text>
          <Text style={styles.orderMetaValue}>
            {order.itemCount || order.items.length}
          </Text>
        </View>

        <View style={styles.orderArrowWrap}>
          <ChevronIcon
            color={UI_COLORS.mutedStrong}
            direction="right"
            size={12}
            strokeWidth={1.9}
          />
        </View>
      </View>
    </Pressable>
  );
}

function LoadingState() {
  return (
    <View style={styles.feedbackCard}>
      <ActivityIndicator color={UI_COLORS.accentGreen} size="small" />
      <Text style={styles.feedbackTitle}>Loading your orders</Text>
      <Text style={styles.feedbackSubtitle}>
        We are pulling the latest purchases for this account.
      </Text>
    </View>
  );
}

function ErrorState({ onRetry }) {
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackTitle}>Could not load orders</Text>
      <Text style={styles.feedbackSubtitle}>
        Try again to refresh this account's order history.
      </Text>
      <Pressable
        android_ripple={{ color: '#E4EEE1' }}
        onPress={onRetry}
        style={({ pressed }) => [
          styles.ctaButton,
          pressed && styles.ctaButtonPressed,
        ]}
      >
        <Text style={styles.ctaButtonLabel}>Retry</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({ navigation }) {
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackTitle}>No orders yet</Text>
      <Text style={styles.feedbackSubtitle}>
        Your recent purchases will appear here once you complete checkout.
      </Text>
      <Pressable
        android_ripple={{ color: '#E4EEE1' }}
        onPress={() => navigation.navigate(CUSTOMER_ROUTES.HOME)}
        style={({ pressed }) => [
          styles.ctaButton,
          pressed && styles.ctaButtonPressed,
        ]}
      >
        <Text style={styles.ctaButtonLabel}>Browse products</Text>
      </Pressable>
    </View>
  );
}

function SectionBlock({ navigation, orders, title }) {
  if (!orders.length) {
    return null;
  }

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          onPress={() =>
            navigation.navigate(CUSTOMER_ROUTES.ORDER_DETAIL, {
              orderId: order.id,
            })
          }
          order={order}
        />
      ))}
    </View>
  );
}

function OrdersScreen({ navigation }) {
  const { orders, ordersError, ordersLoading, refreshOrders } = useAccountData();

  const { activeCount, pastOrders, recentOrders } = useMemo(() => {
    const recent = [];
    const past = [];

    orders.forEach(order => {
      if (isRecentOrder(order.createdAt)) {
        recent.push(order);
      } else {
        past.push(order);
      }
    });

    return {
      recentOrders: recent,
      pastOrders: past,
      activeCount: orders.filter(order =>
        ['Processing', 'On the way'].includes(normalizeOrderStatus(order.status)),
      ).length,
    };
  }, [orders]);

  async function handleRetry() {
    try {
      await refreshOrders();
    } catch {}
  }

  return (
    <AccountScene
      eyebrow="Account"
      navigation={navigation}
      subtitle="Track what is on the way, revisit past baskets and open full order details."
      title="Orders"
    >
      <View style={styles.metricsRow}>
        <MetricCard label="Total orders" value={`${orders.length}`} />
        <MetricCard label="Active now" value={`${activeCount}`} />
      </View>

      {ordersLoading ? <LoadingState /> : null}
      {!ordersLoading && ordersError ? (
        <ErrorState onRetry={handleRetry} />
      ) : null}
      {!ordersLoading && !ordersError && !orders.length ? (
        <EmptyState navigation={navigation} />
      ) : null}
      {!ordersLoading && !ordersError && orders.length ? (
        <>
          <SectionBlock
            navigation={navigation}
            orders={recentOrders}
            title="Recent orders"
          />
          <SectionBlock
            navigation={navigation}
            orders={pastOrders}
            title="Past orders"
          />
        </>
      ) : null}
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  metricCard: {
    width: '48%',
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingVertical: 20,
    paddingHorizontal: 18,
    ...UI_SHADOWS.card,
  },
  metricValue: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  metricLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  feedbackCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginBottom: 22,
    ...UI_SHADOWS.card,
  },
  feedbackTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
    marginBottom: 18,
  },
  ctaButton: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderRadius: UI_RADIUS.round,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 180,
    alignItems: 'center',
  },
  ctaButtonPressed: {
    opacity: 0.9,
  },
  ctaButtonLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionLabel: {
    color: UI_COLORS.mutedStrong,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    marginBottom: 12,
    ...UI_SHADOWS.card,
  },
  orderCardPressed: {
    opacity: 0.94,
  },
  orderCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  orderId: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  orderDate: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  statusBadge: {
    borderRadius: UI_RADIUS.round,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderMetaBlock: {
    flex: 1,
  },
  orderMetaLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  orderMetaValue: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  orderArrowWrap: {
    width: 28,
    alignItems: 'flex-end',
  },
});

export default OrdersScreen;
