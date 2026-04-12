import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DirectionalHint from '../../components/DirectionalHint';
import ChevronIcon from '../../components/icons/ChevronIcon';
import PrimaryButton from '../../components/PrimaryButton';
import { AUTH_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useApp } from '../../context/AppContext';
import {
  DEVICE_LOCATION_ERROR,
  LOCATION_PERMISSION_STATUS,
  getCurrentDeviceLocation,
  requestLocationPermission,
} from '../../services/deviceLocation';

const OPENING_COLORS = Object.freeze({
  accent: UI_COLORS.accentGreen,
  accentPressed: UI_COLORS.accentGreenPressed,
  accentSoft: UI_COLORS.accentGreenSoft,
  accentWarm: UI_COLORS.banner,
  accentWarmSoft: UI_COLORS.surfaceTint,
  canvas: UI_COLORS.screenLight,
  canvasWarm: UI_COLORS.screen,
  surface: UI_COLORS.surface,
  surfaceSoft: UI_COLORS.surfaceSoft,
  surfaceMuted: UI_COLORS.surfaceMuted,
  border: UI_COLORS.border,
  borderSoft: UI_COLORS.borderSoft,
  text: UI_COLORS.textStrong,
  muted: UI_COLORS.mutedStrong,
  mutedSoft: UI_COLORS.muted,
  shadow: UI_COLORS.shadow,
  dark: UI_COLORS.textStrong,
});

const OPENING_IMAGES = Object.freeze({
  welcome: require('../../assets/images/products/Vegetable-Bag copy.png'),
  signIn: require('../../assets/images/products/veg and fruits.png'),
  location: require('../../assets/images/products/fruit-and-veggie-heart-scaled.png'),
});

const DEFAULT_COUNTRY_CODE = '+84';
const MOCK_OTP_CODE = '1234';

function normalizePhoneInput(value) {
  return value.replace(/[^0-9 ]/g, '').slice(0, 16);
}

function hasValidPhoneNumber(value) {
  return value.replace(/\D/g, '').length >= 8;
}

function buildManualLocation(value) {
  const trimmedValue = value.trim();

  return {
    detail: trimmedValue,
    fullAddress: trimmedValue,
    label: 'Manual location',
    shortLabel: trimmedValue,
    source: 'manual',
  };
}

function GrovyLogo({ large = false }) {
  return (
    <View style={styles.logoWrap}>
      <View style={[styles.logoMark, large && styles.logoMarkLarge]}>
        <View
          style={[styles.logoLeafLeft, large && styles.logoLeafLeftLarge]}
        />
        <View
          style={[styles.logoLeafRight, large && styles.logoLeafRightLarge]}
        />
      </View>
      <Text style={[styles.logoText, large && styles.logoTextLarge]}>
        Grovy
      </Text>
    </View>
  );
}

function BackButton({ onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE7DC' }}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backButton,
        pressed && styles.backButtonPressed,
      ]}
    >
      <ChevronIcon
        color={OPENING_COLORS.text}
        direction="left"
        size={12}
        strokeWidth={1.9}
      />
    </Pressable>
  );
}

function CountryCodeChip({ label = DEFAULT_COUNTRY_CODE }) {
  return (
    <View style={styles.countryCodeChip}>
      <View style={styles.countryDot} />
      <Text style={styles.countryCodeChipLabel}>{label}</Text>
    </View>
  );
}

function SocialButton({ iconLabel, onPress, title, tone = 'google' }) {
  const isGoogle = tone === 'google';

  return (
    <Pressable
      android_ripple={{ color: '#EEE7DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        pressed && styles.socialButtonPressed,
      ]}
    >
      <View
        style={[
          styles.socialGlyph,
          isGoogle ? styles.socialGlyphGoogle : styles.socialGlyphApple,
        ]}
      >
        <Text
          style={[
            styles.socialGlyphLabel,
            isGoogle
              ? styles.socialGlyphLabelGoogle
              : styles.socialGlyphLabelApple,
          ]}
        >
          {iconLabel}
        </Text>
      </View>
      <Text style={styles.socialButtonLabel}>{title}</Text>
      <DirectionalHint
        chevronSize={8}
        color={OPENING_COLORS.muted}
        mode="plain"
        style={styles.socialArrow}
      />
    </Pressable>
  );
}

function ScreenHeader({ eyebrow, subtitle, title }) {
  return (
    <View style={styles.screenHeader}>
      {eyebrow ? <Text style={styles.screenEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function SupportPill({ label, tone = 'soft' }) {
  return (
    <View
      style={[
        styles.supportPill,
        tone === 'warm' ? styles.supportPillWarm : null,
      ]}
    >
      <Text style={styles.supportPillLabel}>{label}</Text>
    </View>
  );
}

function InlineNotice({
  actionLabel,
  message,
  onPressAction,
  tone = 'neutral',
}) {
  if (!message) {
    return null;
  }

  const isError = tone === 'error';

  return (
    <View style={[styles.noticeCard, isError && styles.noticeCardError]}>
      <Text style={[styles.noticeText, isError && styles.noticeTextError]}>
        {message}
      </Text>
      {actionLabel && onPressAction ? (
        <Pressable
          hitSlop={6}
          onPress={onPressAction}
          style={({ pressed }) => [
            styles.noticeActionButton,
            pressed && styles.noticeActionButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.noticeActionLabel,
              isError && styles.noticeActionLabelError,
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function VerificationBoxes({ code, onPress }) {
  const values = `${code}`.slice(0, 4).split('');

  while (values.length < 4) {
    values.push('');
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.verificationBoxes,
        pressed && styles.verificationBoxesPressed,
      ]}
    >
      {values.map((value, index) => {
        const isFilled = Boolean(value);

        return (
          <View
            key={`otp-box-${index}`}
            style={[
              styles.verificationBox,
              isFilled && styles.verificationBoxFilled,
              index < values.length - 1 ? styles.verificationBoxGap : null,
            ]}
          >
            <Text
              style={[
                styles.verificationBoxLabel,
                isFilled && styles.verificationBoxLabelFilled,
              ]}
            >
              {value}
            </Text>
          </View>
        );
      })}
    </Pressable>
  );
}

function LocationIllustration() {
  return (
    <View style={styles.locationIllustrationCard}>
      <View style={styles.locationHaloLarge} />
      <View style={styles.locationHaloSmall} />
      <Image
        resizeMode="contain"
        source={OPENING_IMAGES.location}
        style={styles.locationImage}
      />
      <View style={styles.pinWrap}>
        <View style={styles.pinHead}>
          <View style={styles.pinInnerDot} />
        </View>
        <View style={styles.pinTail} />
      </View>
    </View>
  );
}

function LocationActionCard({
  active = false,
  description,
  isLoading = false,
  onPress,
  title,
}) {
  return (
    <Pressable
      android_ripple={{ color: '#EEE7DC' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.locationActionCard,
        active && styles.locationActionCardActive,
        pressed && styles.locationActionCardPressed,
      ]}
    >
      <View style={[styles.locationActionIcon, active && styles.locationActionIconActive]}>
        <View
          style={[
            styles.locationActionIconDot,
            active && styles.locationActionIconDotActive,
          ]}
        />
      </View>

      <View style={styles.locationActionCopy}>
        <Text style={styles.locationActionTitle}>{title}</Text>
        <Text style={styles.locationActionDescription}>{description}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={OPENING_COLORS.accent} size="small" />
      ) : (
        <DirectionalHint
          chevronSize={8}
          color={OPENING_COLORS.muted}
          mode="plain"
        />
      )}
    </Pressable>
  );
}

export function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(AUTH_ROUTES.ONBOARDING);
    }, 1400);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <View style={styles.splashScreen}>
        <View style={styles.splashHaloPrimary} />
        <View style={styles.splashHaloSecondary} />

        <View style={styles.splashCard}>
          <GrovyLogo large />
          <Text style={styles.splashTagline}>Fresh groceries made simple</Text>
          <Text style={styles.splashSubtitle}>Preparing your weekly shop</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <View style={styles.welcomeScreen}>
        <View style={styles.welcomeHeroCard}>
          <View style={styles.welcomeHeroWarmTone} />
          <View style={styles.welcomeHeroSoftTone} />
          <Image
            resizeMode="contain"
            source={OPENING_IMAGES.welcome}
            style={styles.welcomeHeroImage}
          />
        </View>

        <View style={styles.welcomeCard}>
          <GrovyLogo />
          <ScreenHeader
            eyebrow="Groceries, kept simple"
            subtitle="Fresh produce, pantry basics and weekly essentials in one grounded, practical shop."
            title="Welcome to Grovy"
          />

          <View style={styles.supportPillRow}>
            <SupportPill label="Fresh produce" tone="warm" />
            <SupportPill label="Pantry staples" />
          </View>

          <PrimaryButton
            onPress={() => navigation.navigate(AUTH_ROUTES.SIGN_IN)}
            style={styles.primaryAction}
            title="Get started"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export function SignInScreen({ navigation }) {
  function handleContinue() {
    navigation.navigate(AUTH_ROUTES.NUMBER_INPUT);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <ScrollView
        contentContainerStyle={styles.signInScreen}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.signInHeroCard}>
          <View style={styles.signInHeroSoftTone} />
          <View style={styles.signInHeroWarmTone} />
          <Image
            resizeMode="contain"
            source={OPENING_IMAGES.signIn}
            style={styles.signInHeroImage}
          />
        </View>

        <View style={styles.signInCard}>
          <BackButton onPress={() => navigation.goBack()} />
          <ScreenHeader
            eyebrow="Welcome back"
            subtitle="Use your mobile number or a saved account to continue."
            title="Choose how to enter"
          />

          <Pressable
            android_ripple={{ color: '#EEE7DC' }}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.phoneEntryButton,
              pressed && styles.phoneEntryButtonPressed,
            ]}
          >
            <CountryCodeChip />
            <View style={styles.phoneEntryCopy}>
              <Text style={styles.phoneEntryLabel}>Continue with phone</Text>
              <Text style={styles.phoneEntryMeta}>
                The quickest way to get into the shop
              </Text>
            </View>
            <DirectionalHint
              chevronSize={8}
              color={OPENING_COLORS.muted}
              mode="plain"
              style={styles.phoneEntryArrow}
            />
          </Pressable>

          <View style={styles.orDividerRow}>
            <View style={styles.orDivider} />
            <Text style={styles.orLabel}>Or use a saved account</Text>
            <View style={styles.orDivider} />
          </View>

          <SocialButton
            iconLabel="G"
            onPress={handleContinue}
            tone="google"
            title="Continue with Google"
          />
          <SocialButton
            iconLabel="A"
            onPress={handleContinue}
            tone="apple"
            title="Continue with Apple"
          />

          <InlineNotice
            message="Phone, OTP, Google and Apple stay in mock mode for this demo."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function NumberInputScreen({ navigation, route }) {
  const { openingFlow, saveOpeningPhone } = useApp();
  const initialCountryCode =
    route.params?.countryCode ||
    openingFlow.countryCode ||
    DEFAULT_COUNTRY_CODE;
  const initialPhoneNumber = route.params?.phoneNumber || openingFlow.phoneNumber;

  const [countryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [errorMessage, setErrorMessage] = useState('');

  function handleNext() {
    const resolvedPhoneNumber = normalizePhoneInput(phoneNumber).trim();

    if (!hasValidPhoneNumber(resolvedPhoneNumber)) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    setErrorMessage('');
    saveOpeningPhone({
      countryCode,
      phoneNumber: resolvedPhoneNumber,
    });

    navigation.navigate(AUTH_ROUTES.VERIFICATION, {
      countryCode,
      phoneNumber: resolvedPhoneNumber,
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <View style={styles.formScreen}>
          <View>
            <BackButton onPress={() => navigation.goBack()} />
            <ScreenHeader
              eyebrow="Sign in"
              subtitle="We'll send a short verification code before you continue."
              title="Enter your mobile number"
            />

            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Mobile number</Text>
              <View style={styles.phoneInputRow}>
                <CountryCodeChip label={countryCode} />
                <TextInput
                  autoFocus
                  keyboardType="phone-pad"
                  onChangeText={value => {
                    setPhoneNumber(normalizePhoneInput(value));
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
                  placeholder="912 345 678"
                  placeholderTextColor={OPENING_COLORS.mutedSoft}
                  selectionColor={OPENING_COLORS.accent}
                  style={styles.phoneInput}
                  value={phoneNumber}
                />
              </View>
              <Text style={styles.helperText}>
                Standard carrier rates may apply. We only mock the OTP step here.
              </Text>
              <InlineNotice message={errorMessage} tone="error" />
            </View>
          </View>

          <PrimaryButton
            onPress={handleNext}
            disabled={!phoneNumber.trim()}
            style={styles.primaryAction}
            title="Continue"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function VerificationScreen({ navigation, route }) {
  const { completeOpeningVerification, openingFlow } = useApp();
  const inputRef = useRef(null);
  const [code, setCode] = useState(
    route.params?.code || openingFlow.verificationCode || '',
  );
  const [errorMessage, setErrorMessage] = useState('');

  const countryCode =
    route.params?.countryCode ||
    openingFlow.countryCode ||
    DEFAULT_COUNTRY_CODE;
  const phoneNumber = route.params?.phoneNumber || openingFlow.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
      navigation.replace(AUTH_ROUTES.NUMBER_INPUT);
    }
  }, [navigation, phoneNumber]);

  function handleNext() {
    if (code.length !== 4) {
      setErrorMessage('Enter a 4-digit code to continue.');
      return;
    }

    setErrorMessage('');
    completeOpeningVerification(code);
    navigation.navigate(AUTH_ROUTES.LOCATION);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <View style={styles.formScreen}>
          <View>
            <BackButton onPress={() => navigation.goBack()} />
            <ScreenHeader
              eyebrow="Verification"
              subtitle={`Enter the 4-digit code sent to ${countryCode} ${phoneNumber}.`}
              title="Check your code"
            />

            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Verification code</Text>
              <VerificationBoxes
                code={code}
                onPress={() => inputRef.current?.focus()}
              />
              <TextInput
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={value => {
                  setCode(value.replace(/[^0-9]/g, '').slice(0, 4));
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                ref={inputRef}
                selectionColor={OPENING_COLORS.accent}
                style={styles.hiddenVerificationInput}
                value={code}
              />
              <Text style={styles.helperText}>
                Any 4 digits work for this demo. You can also use {MOCK_OTP_CODE}.
              </Text>
              <InlineNotice message={errorMessage} tone="error" />
              <Pressable
                onPress={() => {
                  setCode(MOCK_OTP_CODE);
                  setErrorMessage('');
                }}
                style={({ pressed }) => [
                  styles.resendButton,
                  pressed && styles.resendButtonPressed,
                ]}
              >
                <Text style={styles.resendText}>Use demo code {MOCK_OTP_CODE}</Text>
              </Pressable>
            </View>
          </View>

          <PrimaryButton
            onPress={handleNext}
            style={styles.primaryAction}
            title="Verify code"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function LocationScreen({ navigation }) {
  const { completeCustomerOpeningFlow, openingFlow, saveOpeningLocation } =
    useApp();
  const [manualLocation, setManualLocation] = useState(
    openingFlow.selectedLocation?.source === 'manual'
      ? openingFlow.selectedLocation.fullAddress
      : '',
  );
  const [selectedMethod, setSelectedMethod] = useState(
    openingFlow.selectedLocation?.source || 'current',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isPermissionBlocked, setIsPermissionBlocked] = useState(false);

  const selectedLocation = openingFlow.selectedLocation;
  const showManualEntry =
    selectedMethod === 'manual' || Boolean(errorMessage) || isPermissionBlocked;
  const currentLocationSelected =
    selectedMethod === 'current' && selectedLocation?.source === 'current';

  useEffect(() => {
    if (!openingFlow.isVerificationComplete) {
      navigation.replace(AUTH_ROUTES.VERIFICATION);
    }
  }, [navigation, openingFlow.isVerificationComplete]);

  function handleManualEntry() {
    setSelectedMethod('manual');
    setErrorMessage('');
    setIsPermissionBlocked(false);
  }

  async function handleUseCurrentLocation() {
    if (isRequestingLocation) {
      return;
    }

    setSelectedMethod('current');
    setErrorMessage('');
    setIsPermissionBlocked(false);

    const permissionStatus = await requestLocationPermission();

    if (permissionStatus === LOCATION_PERMISSION_STATUS.BLOCKED) {
      setIsPermissionBlocked(true);
      setSelectedMethod('manual');
      setErrorMessage(
        'Location access is off for Grovy. Open Settings or enter it manually.',
      );
      return;
    }

    if (permissionStatus === LOCATION_PERMISSION_STATUS.DENIED) {
      setSelectedMethod('manual');
      setErrorMessage('No worries, you can enter your area manually instead.');
      return;
    }

    setIsRequestingLocation(true);

    try {
      const deviceLocation = await getCurrentDeviceLocation();
      saveOpeningLocation(deviceLocation);
      setManualLocation('');
      setSelectedMethod('current');
    } catch (error) {
      setSelectedMethod('manual');
      setErrorMessage(
        error?.message || 'We could not detect your location right now.',
      );

      if (error?.type === DEVICE_LOCATION_ERROR.PERMISSION_DENIED) {
        setIsPermissionBlocked(false);
      }
    } finally {
      setIsRequestingLocation(false);
    }
  }

  async function handleOpenSettings() {
    await Linking.openSettings();
  }

  function handleManualLocationChange(value) {
    setManualLocation(value);

    if (errorMessage) {
      setErrorMessage('');
    }

    if (selectedMethod !== 'manual') {
      setSelectedMethod('manual');
    }

    if (isPermissionBlocked) {
      setIsPermissionBlocked(false);
    }
  }

  function handleContinue() {
    if (selectedMethod === 'manual') {
      if (!manualLocation.trim()) {
        setErrorMessage('Please enter your area or address.');
        return;
      }

      const manualSelection = buildManualLocation(manualLocation);
      saveOpeningLocation(manualSelection);
      completeCustomerOpeningFlow(manualSelection);
      return;
    }

    if (!selectedLocation) {
      setErrorMessage('Choose your location before continuing.');
      return;
    }

    completeCustomerOpeningFlow(selectedLocation);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.locationContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton onPress={() => navigation.goBack()} />
          <LocationIllustration />
          <ScreenHeader
            eyebrow="Almost there"
            subtitle="Choose where you shop so the first store view already feels local and familiar."
            title="Select your location"
          />

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Choose a delivery location</Text>

            <LocationActionCard
              active={selectedMethod === 'current'}
              description="Ask for location permission and detect this device."
              isLoading={isRequestingLocation}
              onPress={handleUseCurrentLocation}
              title="Use current location"
            />

            <LocationActionCard
              active={selectedMethod === 'manual'}
              description="Type a district, neighborhood or short address yourself."
              onPress={handleManualEntry}
              title="Enter manually"
            />

            {currentLocationSelected ? (
              <View style={styles.locationSummaryCard}>
                <Text style={styles.locationSummaryEyebrow}>Location ready</Text>
                <Text style={styles.locationSummaryTitle}>
                  {selectedLocation.label}
                </Text>
                <Text style={styles.locationSummaryDetail}>
                  {selectedLocation.detail}
                </Text>
              </View>
            ) : null}

            <InlineNotice
              actionLabel={isPermissionBlocked ? 'Open settings' : null}
              message={errorMessage}
              onPressAction={isPermissionBlocked ? handleOpenSettings : null}
              tone="error"
            />

            {showManualEntry ? (
              <View style={styles.manualEntryWrap}>
                <Text style={styles.fieldLabel}>Manual location</Text>
                <View style={styles.textFieldWrap}>
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={handleManualLocationChange}
                    placeholder="District 1, Ho Chi Minh City"
                    placeholderTextColor={OPENING_COLORS.mutedSoft}
                    selectionColor={OPENING_COLORS.accent}
                    style={styles.textField}
                    value={manualLocation}
                  />
                </View>
                <Text style={styles.helperText}>
                  Keep it short and clear so the demo can continue smoothly.
                </Text>
              </View>
            ) : null}
          </View>

          <PrimaryButton
            onPress={handleContinue}
            style={[styles.primaryAction, styles.locationAction]}
            title="Continue to shop"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  lightSafeArea: {
    flex: 1,
    backgroundColor: OPENING_COLORS.canvas,
  },
  splashScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    backgroundColor: OPENING_COLORS.canvas,
    overflow: 'hidden',
  },
  splashHaloPrimary: {
    position: 'absolute',
    top: -78,
    right: -44,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(84, 122, 78, 0.12)',
  },
  splashHaloSecondary: {
    position: 'absolute',
    bottom: -64,
    left: -34,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(215, 155, 90, 0.14)',
  },
  splashCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    ...UI_SHADOWS.card,
  },
  splashTagline: {
    marginTop: 18,
    color: OPENING_COLORS.text,
    ...UI_TYPOGRAPHY.title,
    textAlign: 'center',
  },
  splashSubtitle: {
    marginTop: 8,
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.meta,
    textAlign: 'center',
  },
  welcomeScreen: {
    flex: 1,
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: OPENING_COLORS.canvas,
    justifyContent: 'space-between',
  },
  welcomeHeroCard: {
    flex: 1,
    minHeight: 328,
    backgroundColor: OPENING_COLORS.accentWarm,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: '#E6D8C7',
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...UI_SHADOWS.card,
  },
  welcomeHeroWarmTone: {
    position: 'absolute',
    right: -18,
    bottom: -26,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
  },
  welcomeHeroSoftTone: {
    position: 'absolute',
    left: -28,
    top: 28,
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: 'rgba(84, 122, 78, 0.1)',
  },
  welcomeHeroImage: {
    width: '100%',
    height: '84%',
  },
  welcomeCard: {
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    ...UI_SHADOWS.card,
  },
  supportPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -2,
    marginBottom: 18,
  },
  supportPill: {
    backgroundColor: OPENING_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.round,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  supportPillWarm: {
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
  },
  supportPillLabel: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  primaryAction: {
    width: '100%',
  },
  locationAction: {
    marginTop: 18,
  },
  signInScreen: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: OPENING_COLORS.canvas,
  },
  signInHeroCard: {
    height: 244,
    backgroundColor: OPENING_COLORS.surfaceMuted,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 18,
  },
  signInHeroSoftTone: {
    position: 'absolute',
    top: -36,
    right: 20,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(84, 122, 78, 0.12)',
  },
  signInHeroWarmTone: {
    position: 'absolute',
    bottom: -44,
    left: -12,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(215, 155, 90, 0.14)',
  },
  signInHeroImage: {
    width: '88%',
    height: 196,
    marginBottom: 10,
  },
  signInCard: {
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    ...UI_SHADOWS.card,
  },
  phoneEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OPENING_COLORS.surfaceSoft,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 18,
  },
  phoneEntryButtonPressed: {
    opacity: 0.94,
  },
  phoneEntryCopy: {
    flex: 1,
    marginLeft: 12,
  },
  phoneEntryLabel: {
    color: OPENING_COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  phoneEntryMeta: {
    color: OPENING_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  phoneEntryArrow: {
    marginLeft: 8,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: OPENING_COLORS.border,
  },
  orLabel: {
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.label,
    marginHorizontal: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  socialButtonPressed: {
    opacity: 0.94,
  },
  socialGlyph: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  socialGlyphGoogle: {
    backgroundColor: '#EAF1FF',
  },
  socialGlyphApple: {
    backgroundColor: OPENING_COLORS.surfaceSoft,
  },
  socialGlyphLabel: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  socialGlyphLabelGoogle: {
    color: '#4E7FDE',
  },
  socialGlyphLabelApple: {
    color: OPENING_COLORS.text,
  },
  socialButtonLabel: {
    flex: 1,
    color: OPENING_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  socialArrow: {
    marginLeft: 8,
  },
  formScreen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: OPENING_COLORS.canvas,
  },
  backButton: {
    width: UI_LAYOUT.iconButton,
    height: UI_LAYOUT.iconButton,
    borderRadius: UI_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OPENING_COLORS.surface,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    ...UI_SHADOWS.card,
  },
  backButtonPressed: {
    opacity: 0.9,
  },
  screenHeader: {
    marginTop: 26,
    marginBottom: 20,
  },
  screenEyebrow: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 4,
  },
  screenTitle: {
    color: OPENING_COLORS.text,
    ...UI_TYPOGRAPHY.screenTitle,
  },
  screenSubtitle: {
    marginTop: 8,
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.body,
    maxWidth: '94%',
  },
  formCard: {
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    padding: 18,
    ...UI_SHADOWS.card,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldGroupLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.label,
    marginBottom: 8,
  },
  helperText: {
    color: OPENING_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  noticeCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE8D8',
    backgroundColor: OPENING_COLORS.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noticeCardError: {
    borderColor: '#EBCFC8',
    backgroundColor: UI_COLORS.errorSoft,
  },
  noticeText: {
    color: OPENING_COLORS.accent,
    ...UI_TYPOGRAPHY.label,
  },
  noticeTextError: {
    color: UI_COLORS.accentRed,
  },
  noticeActionButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  noticeActionButtonPressed: {
    opacity: 0.76,
  },
  noticeActionLabel: {
    color: OPENING_COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  noticeActionLabelError: {
    color: UI_COLORS.accentRed,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OPENING_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    paddingHorizontal: 12,
    minHeight: UI_LAYOUT.searchHeight + 4,
  },
  phoneInput: {
    flex: 1,
    color: OPENING_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    marginLeft: 12,
    paddingVertical: 0,
  },
  countryCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  countryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: OPENING_COLORS.accent,
    marginRight: 8,
  },
  countryCodeChipLabel: {
    color: OPENING_COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  verificationBoxes: {
    flexDirection: 'row',
  },
  verificationBoxesPressed: {
    opacity: 0.96,
  },
  verificationBox: {
    flex: 1,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    backgroundColor: OPENING_COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBoxGap: {
    marginRight: 10,
  },
  verificationBoxFilled: {
    backgroundColor: OPENING_COLORS.accentSoft,
    borderColor: '#D8E4D6',
  },
  verificationBoxLabel: {
    color: OPENING_COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  verificationBoxLabelFilled: {
    color: OPENING_COLORS.accent,
  },
  hiddenVerificationInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  resendButtonPressed: {
    opacity: 0.72,
  },
  resendText: {
    color: OPENING_COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  locationActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    backgroundColor: OPENING_COLORS.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginBottom: 12,
  },
  locationActionCardActive: {
    borderColor: '#D2E0CF',
    backgroundColor: OPENING_COLORS.accentSoft,
  },
  locationActionCardPressed: {
    opacity: 0.96,
  },
  locationActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    backgroundColor: OPENING_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationActionIconActive: {
    borderColor: '#D2E0CF',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  locationActionIconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: OPENING_COLORS.mutedSoft,
  },
  locationActionIconDotActive: {
    backgroundColor: OPENING_COLORS.accent,
  },
  locationActionCopy: {
    flex: 1,
    marginRight: 12,
  },
  locationActionTitle: {
    color: OPENING_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  locationActionDescription: {
    color: OPENING_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  locationContent: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: OPENING_COLORS.canvas,
  },
  locationIllustrationCard: {
    height: 228,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: '#DEE4D7',
    backgroundColor: UI_COLORS.hero,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 6,
    ...UI_SHADOWS.card,
  },
  locationHaloLarge: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: 'rgba(215, 155, 90, 0.12)',
  },
  locationHaloSmall: {
    position: 'absolute',
    left: 46,
    top: 34,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(84, 122, 78, 0.1)',
  },
  locationImage: {
    width: 186,
    height: 186,
    opacity: 0.4,
  },
  pinWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinHead: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: OPENING_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInnerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: OPENING_COLORS.surface,
  },
  pinTail: {
    width: 18,
    height: 30,
    marginTop: -6,
    backgroundColor: OPENING_COLORS.accent,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    transform: [{ rotate: '45deg' }],
  },
  textFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OPENING_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.xl,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    minHeight: UI_LAYOUT.searchHeight,
    paddingHorizontal: 16,
  },
  manualEntryWrap: {
    marginTop: 4,
  },
  locationSummaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7E4D4',
    backgroundColor: OPENING_COLORS.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 2,
  },
  locationSummaryEyebrow: {
    color: OPENING_COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  locationSummaryTitle: {
    color: OPENING_COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  locationSummaryDetail: {
    color: OPENING_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  textField: {
    flex: 1,
    color: OPENING_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    paddingVertical: 0,
  },
  fieldChevron: {
    marginLeft: 8,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoMarkLarge: {
    width: 56,
    height: 56,
    marginRight: 14,
  },
  logoLeafLeft: {
    position: 'absolute',
    width: 16,
    height: 22,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    backgroundColor: OPENING_COLORS.accent,
    transform: [{ rotate: '-30deg' }, { translateX: -5 }],
  },
  logoLeafRight: {
    position: 'absolute',
    width: 16,
    height: 22,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: OPENING_COLORS.accent,
    transform: [{ rotate: '30deg' }, { translateX: 5 }],
  },
  logoLeafLeftLarge: {
    width: 24,
    height: 34,
    transform: [{ rotate: '-30deg' }, { translateX: -7 }],
  },
  logoLeafRightLarge: {
    width: 24,
    height: 34,
    transform: [{ rotate: '30deg' }, { translateX: 7 }],
  },
  logoText: {
    color: OPENING_COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  logoTextLarge: {
    fontSize: 42,
  },
});
