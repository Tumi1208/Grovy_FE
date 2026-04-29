import React from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { formatOrderDate, normalizeOrderStatus } from '../../utils/accountFormatting';
import { formatCurrency } from '../../utils/formatCurrency';
import PrimaryButton from '../PrimaryButton';

const ORDER_SUCCESS_ILLUSTRATION = require('../../assets/illustrations/order_success.png');

function getOrderItemCount(order) {
  if (typeof order?.itemCount === 'number') {
    return order.itemCount;
  }

  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
}

function SummaryRow({ isLast = false, label, value }) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function OrderSuccessCard({ onBackToHome, onTrackOrder, order }) {
  const itemCount = getOrderItemCount(order);
  const statusLabel = normalizeOrderStatus(order?.status || 'processing');

  return (
    <View style={styles.card}>
      <View style={styles.illustrationWrap}>
        <Image
          resizeMode="contain"
          source={ORDER_SUCCESS_ILLUSTRATION}
          style={styles.successIllustration}
        />
      </View>

      <Text style={styles.title}>Your Order has been accepted</Text>
      <Text style={styles.subtitle}>
        Your items have been placed and are getting ready for delivery.
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
        onPress={onTrackOrder}
        style={styles.secondaryButton}
        title="Track order"
        variant="secondary"
      />
      <PrimaryButton onPress={onBackToHome} title="Back to Home" />
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
  const content = (
    <View style={styles.centeredContent}>
      <OrderSuccessCard
        onBackToHome={onBackToHome}
        onTrackOrder={onTrackOrder}
        order={order}
      />
    </View>
  );

  if (presentation === 'screen') {
    return content;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onRequestClose || onBackToHome || (() => null)}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>{content}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
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
    borderRadius: 24,
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
  title: {
    color: UI_COLORS.textStrong,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
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
