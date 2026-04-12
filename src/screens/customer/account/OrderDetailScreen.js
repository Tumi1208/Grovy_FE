import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  defaultProductImage,
  getProductImageSource,
} from '../../../assets/productImages';
import AccountScene from '../../../components/account/AccountScene';
import PrimaryButton from '../../../components/PrimaryButton';
import ProductImage from '../../../components/ProductImage';
import { CUSTOMER_ROUTES } from '../../../constants/routes';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import { useAccountData } from '../../../context/AccountDataContext';
import {
  buildAddressFullText,
  formatAddressContact,
  formatOrderDate,
  formatPaymentMethodMeta,
  formatPaymentMethodTitle,
  getOrderStatusMeta,
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

function SummaryRow({ emphasized = false, label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasized && styles.summaryLabelStrong]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, emphasized && styles.summaryValueStrong]}>
        {value}
      </Text>
    </View>
  );
}

function OrderItemRow({ item }) {
  const imageSource = item.product
    ? getProductImageSource(item.product)
    : defaultProductImage;

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemImageWrap}>
        <ProductImage
          name={item.name}
          resizeMode="contain"
          source={imageSource}
          style={styles.itemImage}
        />
      </View>

      <View style={styles.itemCopy}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>
          {item.quantity} x {formatCurrency(item.price)}
        </Text>
      </View>

      <Text style={styles.itemPrice}>
        {formatCurrency(item.price * item.quantity)}
      </Text>
    </View>
  );
}

function InfoCard({ description, title }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardDescription}>{description}</Text>
    </View>
  );
}

function EmptyOrderState({ navigation }) {
  return (
    <AccountScene
      eyebrow="Account"
      navigation={navigation}
      subtitle="The selected order could not be found in local history."
      title="Order detail"
    >
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Order not available</Text>
        <Text style={styles.emptySubtitle}>
          Try returning to the Orders list to open another record.
        </Text>
        <PrimaryButton
          onPress={() => navigation.replace(CUSTOMER_ROUTES.ACCOUNT_ORDERS)}
          style={styles.emptyButton}
          title="Back to orders"
        />
      </View>
    </AccountScene>
  );
}

function OrderDetailScreen({ navigation, route }) {
  const { getOrderById } = useAccountData();
  const order = getOrderById(route.params?.orderId);

  if (!order) {
    return <EmptyOrderState navigation={navigation} />;
  }

  return (
    <AccountScene
      eyebrow="Account"
      footer={
        <PrimaryButton
          onPress={() => navigation.navigate(CUSTOMER_ROUTES.ACCOUNT_ORDERS)}
          title="View all orders"
        />
      }
      navigation={navigation}
      subtitle={`Placed on ${formatOrderDate(order.createdAt)}`}
      title="Order detail"
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderIdValue}>{order.id}</Text>
          </View>
          <StatusBadge status={order.status} />
        </View>

        <View style={styles.heroMetaRow}>
          <Text style={styles.heroMetaText}>{order.itemCount} items</Text>
          <Text style={styles.heroMetaDivider}>•</Text>
          <Text style={styles.heroMetaText}>
            {formatCurrency(order.totalAmount || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map(item => (
          <OrderItemRow item={item} key={item.id} />
        ))}
      </View>

      <View style={styles.infoRow}>
        <InfoCard
          description={formatPaymentMethodMeta(order.paymentMethodSnapshot)}
          title={formatPaymentMethodTitle(order.paymentMethodSnapshot)}
        />
        <InfoCard
          description={formatAddressContact(order.deliveryAddressSnapshot)}
          title={order.deliveryAddressSnapshot.label || 'Delivery address'}
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <Text style={styles.addressText}>
          {buildAddressFullText(order.deliveryAddressSnapshot)}
        </Text>
        {order.deliveryAddressSnapshot.notes ? (
          <Text style={styles.addressNote}>{order.deliveryAddressSnapshot.notes}</Text>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Total summary</Text>
        <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal || 0)} />
        <SummaryRow
          label="Delivery fee"
          value={
            order.deliveryFee > 0
              ? formatCurrency(order.deliveryFee)
              : 'Free'
          }
        />
        <SummaryRow
          emphasized
          label="Total"
          value={formatCurrency(order.totalAmount || 0)}
        />
      </View>
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 14,
  },
  orderIdLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 4,
  },
  orderIdValue: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
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
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetaText: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  heroMetaDivider: {
    color: UI_COLORS.mutedStrong,
    marginHorizontal: 8,
  },
  sectionCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  sectionTitle: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.title,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  itemImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
  },
  itemCopy: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  itemMeta: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
  },
  itemPrice: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCard: {
    width: '48.2%',
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 18,
    ...UI_SHADOWS.card,
  },
  infoCardTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  infoCardDescription: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
  },
  addressText: {
    color: UI_COLORS.textStrong,
    ...UI_TYPOGRAPHY.body,
  },
  addressNote: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
  },
  summaryLabelStrong: {
    color: UI_COLORS.textStrong,
    fontWeight: '700',
  },
  summaryValue: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  summaryValueStrong: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  emptyCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 24,
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  emptyTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    width: '100%',
  },
});

export default OrderDetailScreen;
