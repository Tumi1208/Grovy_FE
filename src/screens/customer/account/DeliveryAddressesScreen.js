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
  buildAddressFullText,
  formatAddressContact,
} from '../../../utils/accountFormatting';

function AddressAction({ destructive = false, label, onPress }) {
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

function AddressCard({ address, navigation, onDelete, onSetDefault }) {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressTopRow}>
        <View>
          <Text style={styles.addressLabel}>{address.label}</Text>
          <Text style={styles.addressContact}>{formatAddressContact(address)}</Text>
        </View>
        {address.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeLabel}>Default</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.addressText}>{buildAddressFullText(address)}</Text>
      {address.notes ? <Text style={styles.addressNote}>{address.notes}</Text> : null}

      <View style={styles.actionsRow}>
        <AddressAction
          label="Edit"
          onPress={() =>
            navigation.navigate(CUSTOMER_ROUTES.ADDRESS_FORM, {
              addressId: address.id,
              mode: 'edit',
            })
          }
        />
        {!address.isDefault ? (
          <AddressAction label="Set default" onPress={() => onSetDefault(address.id)} />
        ) : null}
        <AddressAction
          destructive
          label="Delete"
          onPress={() => onDelete(address)}
        />
      </View>
    </View>
  );
}

function DeliveryAddressesScreen({ navigation }) {
  const { addresses, deleteAddress, setDefaultAddress } = useAccountData();

  function handleDelete(address) {
    Alert.alert(
      'Delete address',
      `Remove ${address.label.toLowerCase()} from your saved delivery addresses?`,
      [
        {
          text: 'Keep it',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(address.id),
        },
      ],
    );
  }

  return (
    <AccountScene
      eyebrow="Account"
      footer={
        <PrimaryButton
          onPress={() =>
            navigation.navigate(CUSTOMER_ROUTES.ADDRESS_FORM, {
              mode: 'add',
            })
          }
          title="Add new address"
        />
      }
      navigation={navigation}
      subtitle="Your default address is used first during checkout and can be changed any time."
      title="Delivery Address"
    >
      {addresses.map(address => (
        <AddressCard
          address={address}
          key={address.id}
          navigation={navigation}
          onDelete={handleDelete}
          onSetDefault={setDefaultAddress}
        />
      ))}
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  addressCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 14,
    ...UI_SHADOWS.card,
  },
  addressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  addressLabel: {
    color: UI_COLORS.textStrong,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 4,
  },
  addressContact: {
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

export default DeliveryAddressesScreen;
