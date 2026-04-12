import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AccountScene from '../../../components/account/AccountScene';
import PrimaryButton from '../../../components/PrimaryButton';
import { CUSTOMER_ROUTES } from '../../../constants/routes';
import {
  UI_COLORS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import { useAccountData } from '../../../context/AccountDataContext';
import {
  formatPaymentMethodMeta,
  formatPaymentMethodTitle,
} from '../../../utils/accountFormatting';

function PaymentAction({ destructive = false, label, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE6DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        destructive && styles.actionButtonDestructive,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.actionButtonLabel,
          destructive && styles.actionButtonLabelDestructive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PaymentMethodCard({ method, onDelete, onSetDefault }) {
  return (
    <View style={styles.methodCard}>
      <View style={styles.methodTopRow}>
        <View style={styles.methodGlyph}>
          <Text style={styles.methodGlyphLabel}>
            {method.type === 'cash'
              ? 'COD'
              : `${method.brand || 'CD'}`
                  .slice(0, 2)
                  .toUpperCase()}
          </Text>
        </View>

        <View style={styles.methodCopy}>
          <Text style={styles.methodTitle}>{formatPaymentMethodTitle(method)}</Text>
          <Text style={styles.methodMeta}>{formatPaymentMethodMeta(method)}</Text>
        </View>

        {method.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeLabel}>Default</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        {!method.isDefault ? (
          <PaymentAction label="Set default" onPress={() => onSetDefault(method.id)} />
        ) : null}
        {method.type === 'card' ? (
          <PaymentAction
            destructive
            label="Delete"
            onPress={() => onDelete(method)}
          />
        ) : null}
      </View>
    </View>
  );
}

function PaymentMethodsScreen({ navigation }) {
  const {
    deletePaymentMethod,
    paymentMethods,
    setDefaultPaymentMethod,
  } = useAccountData();

  function handleDelete(method) {
    Alert.alert(
      'Delete card',
      `Remove ${formatPaymentMethodTitle(method).toLowerCase()} from saved payment methods?`,
      [
        {
          text: 'Keep it',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePaymentMethod(method.id),
        },
      ],
    );
  }

  return (
    <AccountScene
      eyebrow="Account"
      footer={
        <PrimaryButton
          onPress={() => navigation.navigate(CUSTOMER_ROUTES.ADD_CARD)}
          title="Add mock card"
        />
      }
      navigation={navigation}
      subtitle="Your default payment method is reused during checkout for a smoother demo flow."
      title="Payment Methods"
    >
      {paymentMethods.map(method => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          onDelete={handleDelete}
          onSetDefault={setDefaultPaymentMethod}
        />
      ))}
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  methodCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  methodTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodGlyph: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: UI_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodGlyphLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  methodCopy: {
    flex: 1,
    paddingRight: 10,
  },
  methodTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  methodMeta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
  },
  defaultBadge: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderWidth: 1,
    borderColor: '#D2E0CC',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  defaultBadgeLabel: {
    color: UI_COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  actionButton: {
    minHeight: 38,
    borderRadius: UI_RADIUS.round,
    backgroundColor: UI_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonDestructive: {
    backgroundColor: '#FFF7F6',
    borderColor: '#E7CFC7',
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  actionButtonLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionButtonLabelDestructive: {
    color: UI_COLORS.accentRed,
  },
});

export default PaymentMethodsScreen;
