import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AccountScene from '../../../components/account/AccountScene';
import PrimaryButton from '../../../components/PrimaryButton';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../../constants/ui';
import { useAccountData } from '../../../context/AccountDataContext';
import { normalizePhoneNumberInput } from '../../../utils/accountFormatting';

function AddressFormScreen({ navigation, route }) {
  const { addresses, saveAddress } = useAccountData();
  const isEditMode = route.params?.mode === 'edit';
  const existingAddress = useMemo(
    () =>
      addresses.find(address => address.id === route.params?.addressId) || null,
    [addresses, route.params?.addressId],
  );
  const [label, setLabel] = useState(existingAddress?.label || '');
  const [recipientName, setRecipientName] = useState(
    existingAddress?.recipientName || '',
  );
  const [phoneNumber, setPhoneNumber] = useState(
    existingAddress?.phoneNumber || '',
  );
  const [addressLine, setAddressLine] = useState(
    existingAddress?.addressLine || '',
  );
  const [area, setArea] = useState(existingAddress?.area || '');
  const [notes, setNotes] = useState(existingAddress?.notes || '');
  const [isDefault, setIsDefault] = useState(
    existingAddress?.isDefault || (!existingAddress && addresses.length === 0),
  );
  const [errorMessage, setErrorMessage] = useState('');

  function handleSave() {
    if (
      !label.trim() ||
      !recipientName.trim() ||
      !phoneNumber.trim() ||
      !addressLine.trim() ||
      !area.trim()
    ) {
      setErrorMessage('Please fill in the required delivery details.');
      return;
    }

    if (phoneNumber.replace(/\D/g, '').length < 8) {
      setErrorMessage('Please enter a valid phone number for delivery.');
      return;
    }

    saveAddress({
      id: existingAddress?.id,
      label,
      recipientName,
      phoneNumber,
      addressLine,
      area,
      notes,
      isDefault,
    });
    navigation.goBack();
  }

  return (
    <AccountScene
      eyebrow="Account"
      footer={<PrimaryButton onPress={handleSave} title="Save address" />}
      navigation={navigation}
      subtitle={
        isEditMode
          ? 'Update the delivery details used across checkout.'
          : 'Add another place for groceries to arrive smoothly.'
      }
      title={isEditMode ? 'Edit address' : 'Add address'}
    >
      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Label</Text>
        <TextInput
          onChangeText={value => {
            setLabel(value);
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="Home, Office..."
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={label}
        />

        <Text style={styles.inputLabel}>Recipient name</Text>
        <TextInput
          onChangeText={value => {
            setRecipientName(value);
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="Recipient name"
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={recipientName}
        />

        <Text style={styles.inputLabel}>Phone number</Text>
        <TextInput
          keyboardType="phone-pad"
          onChangeText={value => {
            setPhoneNumber(normalizePhoneNumberInput(value));
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="+84 938 555 010"
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={phoneNumber}
        />

        <Text style={styles.inputLabel}>Address line</Text>
        <TextInput
          onChangeText={value => {
            setAddressLine(value);
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="Street, building or apartment"
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={addressLine}
        />

        <Text style={styles.inputLabel}>City / district / area</Text>
        <TextInput
          onChangeText={value => {
            setArea(value);
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="District 1, Ho Chi Minh City"
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={area}
        />

        <Text style={styles.inputLabel}>Notes (optional)</Text>
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Gate code, drop-off note, preferred call instruction"
          placeholderTextColor={UI_COLORS.muted}
          style={[styles.input, styles.notesInput]}
          value={notes}
        />

        <Pressable
          android_ripple={{ color: '#E6EEE3' }}
          onPress={() => setIsDefault(currentValue => !currentValue)}
          style={({ pressed }) => [
            styles.defaultToggle,
            isDefault && styles.defaultToggleActive,
            pressed && styles.defaultTogglePressed,
          ]}
        >
          <View style={[styles.toggleIndicator, isDefault && styles.toggleIndicatorActive]} />
          <View style={styles.defaultToggleCopy}>
            <Text style={styles.defaultToggleTitle}>Use as default address</Text>
            <Text style={styles.defaultToggleSubtitle}>
              Checkout will prefill this address first.
            </Text>
          </View>
        </Pressable>
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </AccountScene>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    padding: 20,
    marginBottom: 16,
    ...UI_SHADOWS.card,
  },
  inputLabel: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 8,
  },
  input: {
    minHeight: UI_LAYOUT.searchHeight,
    backgroundColor: '#FBF8F4',
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    color: UI_COLORS.textStrong,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 104,
    textAlignVertical: 'top',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 4,
  },
  defaultToggleActive: {
    backgroundColor: UI_COLORS.accentGreenSoft,
    borderColor: '#D2E0CC',
  },
  defaultTogglePressed: {
    opacity: 0.9,
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI_COLORS.borderStrong,
    backgroundColor: UI_COLORS.surface,
    marginRight: 12,
  },
  toggleIndicatorActive: {
    backgroundColor: UI_COLORS.accentGreen,
    borderColor: UI_COLORS.accentGreen,
  },
  defaultToggleCopy: {
    flex: 1,
  },
  defaultToggleTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  defaultToggleSubtitle: {
    color: UI_COLORS.mutedStrong,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: UI_COLORS.errorSoft,
    borderRadius: UI_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#EBCFC8',
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: UI_COLORS.accentRed,
    ...UI_TYPOGRAPHY.body,
  },
});

export default AddressFormScreen;
