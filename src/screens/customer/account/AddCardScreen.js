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
import {
  detectCardBrand,
  formatCardNumberInput,
  formatExpiryInput,
} from '../../../utils/accountFormatting';

function AddCardScreen({ navigation }) {
  const { addPaymentMethod, paymentMethods } = useAccountData();
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isDefault, setIsDefault] = useState(paymentMethods.length === 0);
  const [errorMessage, setErrorMessage] = useState('');

  const cardDigits = useMemo(
    () => cardNumber.replace(/\D/g, ''),
    [cardNumber],
  );
  const last4 = cardDigits.slice(-4);
  const cardBrand = detectCardBrand(cardDigits);

  function handleSave() {
    const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/);

    if (!cardholderName.trim() || !cardNumber.trim() || !expiry.trim()) {
      setErrorMessage('Please complete the cardholder name, number and expiry.');
      return;
    }

    if (cardDigits.length < 12 || cardDigits.length > 19) {
      setErrorMessage('Card numbers should be between 12 and 19 digits.');
      return;
    }

    if (!expiryMatch) {
      setErrorMessage('Expiry should use the MM/YY format.');
      return;
    }

    const month = Number(expiryMatch[1]);

    if (month < 1 || month > 12) {
      setErrorMessage('Please enter a valid expiry month.');
      return;
    }

    addPaymentMethod({
      cardholderName,
      cardNumber: cardDigits,
      expiry,
      isDefault,
    });
    navigation.goBack();
  }

  return (
    <AccountScene
      eyebrow="Account"
      footer={<PrimaryButton onPress={handleSave} title="Save card" />}
      navigation={navigation}
      subtitle="This stays local for the demo and is only used as a saved checkout preference."
      title="Add card"
    >
      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Cardholder name</Text>
        <TextInput
          onChangeText={value => {
            setCardholderName(value);
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="Cardholder name"
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={cardholderName}
        />

        <Text style={styles.inputLabel}>Card number</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={value => {
            setCardNumber(formatCardNumberInput(value));
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="4242 4242 4242 4242"
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={cardNumber}
        />

        <Text style={styles.inputLabel}>Expiry</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={value => {
            setExpiry(formatExpiryInput(value));
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          placeholder="MM/YY"
          placeholderTextColor={UI_COLORS.muted}
          style={styles.input}
          value={expiry}
        />

        <View style={styles.previewCard}>
          <Text style={styles.previewEyebrow}>{cardBrand}</Text>
          <Text style={styles.previewTitle}>
            {last4 ? `•••• ${last4}` : '•••• 0000'}
          </Text>
          <Text style={styles.previewMeta}>Last 4 digits shown in checkout</Text>
        </View>

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
            <Text style={styles.defaultToggleTitle}>Set as default payment</Text>
            <Text style={styles.defaultToggleSubtitle}>
              Checkout will preselect this card after saving.
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
  previewCard: {
    backgroundColor: UI_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xxl,
    borderWidth: 1,
    borderColor: UI_COLORS.borderSoft,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  previewEyebrow: {
    color: UI_COLORS.mutedStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 6,
  },
  previewTitle: {
    color: UI_COLORS.textStrong,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  previewMeta: {
    color: UI_COLORS.mutedStrong,
    ...UI_TYPOGRAPHY.meta,
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

export default AddCardScreen;
