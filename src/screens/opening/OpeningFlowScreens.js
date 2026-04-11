import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
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
import ChevronIcon from '../../components/icons/ChevronIcon';
import { AUTH_ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { useApp } from '../../context/AppContext';

const OPENING_COLORS = Object.freeze({
  accent: '#D71920',
  accentPressed: '#C5151C',
  accentSoft: '#FDEBEC',
  splash: '#D71920',
  canvas: '#FBF7F2',
  surface: '#FFFFFF',
  text: '#181725',
  muted: '#7C7C7C',
  line: '#E2E2E2',
  chip: '#F2F3F2',
  shadow: '#2A160B',
  dark: '#111111',
});

const OPENING_IMAGES = Object.freeze({
  welcome: require('../../assets/images/products/Vegetable-Bag copy.png'),
  signIn: require('../../assets/images/products/veg and fruits.png'),
  location: require('../../assets/images/products/fruit-and-veggie-heart-scaled.png'),
});

const DEFAULT_COUNTRY_CODE = '+84';
const DEFAULT_ZONE = 'HCMC, Vietnam';
const DEFAULT_AREA = 'Types of your area';

function GrovyLogo({ light = false, large = false }) {
  return (
    <View style={styles.logoWrap}>
      <View
        style={[
          styles.logoMark,
          large && styles.logoMarkLarge,
          light && styles.logoMarkLight,
        ]}
      >
        <View
          style={[
            styles.logoLeafLeft,
            large && styles.logoLeafLeftLarge,
            light && styles.logoLeafLight,
          ]}
        />
        <View
          style={[
            styles.logoLeafRight,
            large && styles.logoLeafRightLarge,
            light && styles.logoLeafLight,
          ]}
        />
      </View>
      <Text
        style={[
          styles.logoText,
          large && styles.logoTextLarge,
          light && styles.logoTextLight,
        ]}
      >
        Grovy
      </Text>
    </View>
  );
}

function BackButton({ onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#F3E7DE', borderless: true }}
      hitSlop={10}
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

function PrimaryActionButton({ title, onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#D1383D' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryActionButton,
        pressed && styles.primaryActionButtonPressed,
      ]}
    >
      <Text style={styles.primaryActionButtonLabel}>{title}</Text>
    </Pressable>
  );
}

function RoundNextButton({ onPress }) {
  return (
    <Pressable
      android_ripple={{ color: '#D1383D', borderless: true }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roundNextButton,
        pressed && styles.roundNextButtonPressed,
      ]}
    >
      <ChevronIcon color={OPENING_COLORS.surface} size={16} strokeWidth={2.2} />
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
      android_ripple={{ color: isGoogle ? '#4775D8' : '#222222' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        isGoogle ? styles.socialButtonGoogle : styles.socialButtonApple,
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
    </Pressable>
  );
}

function ScreenHeader({ subtitle, title }) {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
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
      {values.map((value, index) => (
        <View key={`otp-box-${index}`} style={styles.verificationBox}>
          <Text style={styles.verificationBoxLabel}>{value}</Text>
        </View>
      ))}
    </Pressable>
  );
}

function LocationIllustration() {
  return (
    <View style={styles.locationIllustrationWrap}>
      <View style={styles.locationHalo} />
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

export function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(AUTH_ROUTES.ONBOARDING);
    }, 1400);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.splashSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.splash}
        barStyle="light-content"
      />
      <View style={styles.splashScreen}>
        <View style={styles.splashCircleTop} />
        <View style={styles.splashCircleBottom} />
        <GrovyLogo large light />
        <Text style={styles.splashTagline}>Fresh groceries made simple</Text>
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
        <View style={styles.welcomeHeroPanel}>
          <View style={styles.welcomeHeroGlow} />
          <Image
            resizeMode="contain"
            source={OPENING_IMAGES.welcome}
            style={styles.welcomeHeroImage}
          />
        </View>

        <View style={styles.welcomeCard}>
          <GrovyLogo />
          <Text style={styles.welcomeTitle}>Welcome to our store</Text>
          <Text style={styles.welcomeSubtitle}>
            Get your groceries in as fast as one hour.
          </Text>
          <PrimaryActionButton
            onPress={() => navigation.navigate(AUTH_ROUTES.SIGN_IN)}
            title="Get Started"
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
      <View style={styles.signInScreen}>
        <View style={styles.signInHero}>
          <View style={styles.signInHeroAccent} />
          <Image
            resizeMode="contain"
            source={OPENING_IMAGES.signIn}
            style={styles.signInHeroImage}
          />
        </View>

        <View style={styles.signInSheet}>
          <BackButton onPress={() => navigation.goBack()} />

          <Text style={styles.signInTitle}>Get your groceries with Grovy</Text>
          <Text style={styles.signInSubtitle}>
            Sign in or create an account to continue.
          </Text>

          <Pressable
            android_ripple={{ color: '#F4F4F4' }}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.phoneEntryButton,
              pressed && styles.phoneEntryButtonPressed,
            ]}
          >
            <CountryCodeChip />
            <Text style={styles.phoneEntryLabel}>Enter your mobile number</Text>
            <View style={styles.phoneEntryArrow}>
              <ChevronIcon color={OPENING_COLORS.muted} size={10} />
            </View>
          </Pressable>

          <Text style={styles.orLabel}>Or continue with social account</Text>

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
        </View>
      </View>
    </SafeAreaView>
  );
}

export function NumberInputScreen({ navigation, route }) {
  const initialCountryCode = route.params?.countryCode || DEFAULT_COUNTRY_CODE;
  const initialPhoneNumber = route.params?.phoneNumber || '';

  const [countryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);

  function handleNext() {
    const resolvedPhoneNumber = phoneNumber.trim() || '912 345 678';

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
            <ScreenHeader title="Enter your mobile number" />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <CountryCodeChip label={countryCode} />
                <TextInput
                  autoFocus
                  keyboardType="phone-pad"
                  onChangeText={setPhoneNumber}
                  placeholder="912 345 678"
                  placeholderTextColor={OPENING_COLORS.muted}
                  selectionColor={OPENING_COLORS.accent}
                  style={styles.phoneInput}
                  value={phoneNumber}
                />
              </View>
            </View>
          </View>

          <View style={styles.roundButtonWrap}>
            <RoundNextButton onPress={handleNext} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function VerificationScreen({ navigation, route }) {
  const inputRef = useRef(null);
  const [code, setCode] = useState(route.params?.code || '');

  const countryCode = route.params?.countryCode || DEFAULT_COUNTRY_CODE;
  const phoneNumber = route.params?.phoneNumber || '912 345 678';

  function handleNext() {
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
              subtitle={`Enter the 4-digit code sent to ${countryCode} ${phoneNumber}.`}
              title="Enter your 4-digit code"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Code</Text>
              <VerificationBoxes
                code={code}
                onPress={() => inputRef.current?.focus()}
              />
              <TextInput
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={value =>
                  setCode(value.replace(/[^0-9]/g, '').slice(0, 4))
                }
                ref={inputRef}
                selectionColor={OPENING_COLORS.accent}
                style={styles.hiddenVerificationInput}
                value={code}
              />
            </View>

            <Pressable
              onPress={() => setCode('')}
              style={({ pressed }) => [
                styles.resendButton,
                pressed && styles.resendButtonPressed,
              ]}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </Pressable>
          </View>

          <View style={styles.roundButtonWrap}>
            <RoundNextButton onPress={handleNext} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function LocationScreen({ navigation }) {
  const { continueAsRole } = useApp();
  const [zone, setZone] = useState(DEFAULT_ZONE);
  const [area, setArea] = useState(DEFAULT_AREA);

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
            subtitle="Switch on your location to stay in tune with what's happening in your area."
            title="Select your location"
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your Zone</Text>
            <View style={styles.textFieldWrap}>
              <TextInput
                onChangeText={setZone}
                placeholderTextColor={OPENING_COLORS.muted}
                selectionColor={OPENING_COLORS.accent}
                style={styles.textField}
                value={zone}
              />
              <View style={styles.fieldChevron}>
                <ChevronIcon
                  color={OPENING_COLORS.muted}
                  direction="down"
                  size={10}
                />
              </View>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your Area</Text>
            <View style={styles.textFieldWrap}>
              <TextInput
                onChangeText={setArea}
                placeholderTextColor={OPENING_COLORS.muted}
                selectionColor={OPENING_COLORS.accent}
                style={styles.textField}
                value={area}
              />
              <View style={styles.fieldChevron}>
                <ChevronIcon
                  color={OPENING_COLORS.muted}
                  direction="down"
                  size={10}
                />
              </View>
            </View>
          </View>

          <PrimaryActionButton
            onPress={() => continueAsRole(ROLES.CUSTOMER)}
            title="Submit"
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
  splashSafeArea: {
    flex: 1,
    backgroundColor: OPENING_COLORS.splash,
  },
  splashScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OPENING_COLORS.splash,
    overflow: 'hidden',
  },
  splashCircleTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  splashCircleBottom: {
    position: 'absolute',
    bottom: -90,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  splashTagline: {
    marginTop: 18,
    color: OPENING_COLORS.surface,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  welcomeScreen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: OPENING_COLORS.canvas,
  },
  welcomeHeroPanel: {
    flex: 1,
    minHeight: 340,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  welcomeHeroGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: OPENING_COLORS.accentSoft,
  },
  welcomeHeroImage: {
    width: '100%',
    height: 340,
  },
  welcomeCard: {
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 10,
    shadowColor: OPENING_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  welcomeTitle: {
    marginTop: 24,
    color: OPENING_COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    marginTop: 10,
    marginBottom: 24,
    color: OPENING_COLORS.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  signInScreen: {
    flex: 1,
    backgroundColor: OPENING_COLORS.canvas,
  },
  signInHero: {
    height: 290,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  signInHeroAccent: {
    position: 'absolute',
    top: 24,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: OPENING_COLORS.accentSoft,
  },
  signInHeroImage: {
    width: '92%',
    height: 230,
    marginBottom: 8,
  },
  signInSheet: {
    flex: 1,
    backgroundColor: OPENING_COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    shadowColor: OPENING_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  signInTitle: {
    marginTop: 18,
    color: OPENING_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
  },
  signInSubtitle: {
    marginTop: 10,
    marginBottom: 24,
    color: OPENING_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  phoneEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: OPENING_COLORS.line,
    paddingBottom: 18,
  },
  phoneEntryButtonPressed: {
    opacity: 0.92,
  },
  phoneEntryLabel: {
    flex: 1,
    marginLeft: 14,
    color: OPENING_COLORS.text,
    fontSize: 17,
    fontWeight: '500',
  },
  phoneEntryArrow: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orLabel: {
    color: OPENING_COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 28,
    marginBottom: 18,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    minHeight: 64,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  socialButtonGoogle: {
    backgroundColor: '#5383EC',
  },
  socialButtonApple: {
    backgroundColor: OPENING_COLORS.dark,
  },
  socialButtonPressed: {
    opacity: 0.92,
  },
  socialGlyph: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  socialGlyphGoogle: {
    backgroundColor: OPENING_COLORS.surface,
  },
  socialGlyphApple: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  socialGlyphLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  socialGlyphLabelGoogle: {
    color: '#5383EC',
  },
  socialGlyphLabelApple: {
    color: OPENING_COLORS.surface,
  },
  socialButtonLabel: {
    color: OPENING_COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  formScreen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: OPENING_COLORS.canvas,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OPENING_COLORS.surface,
    borderWidth: 1,
    borderColor: OPENING_COLORS.line,
  },
  backButtonPressed: {
    opacity: 0.92,
  },
  backButtonLabel: {
    color: OPENING_COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  screenHeader: {
    marginTop: 28,
    marginBottom: 28,
  },
  screenTitle: {
    color: OPENING_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
  },
  screenSubtitle: {
    marginTop: 10,
    color: OPENING_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    color: OPENING_COLORS.muted,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OPENING_COLORS.line,
    paddingHorizontal: 16,
    minHeight: 66,
  },
  phoneInput: {
    flex: 1,
    color: OPENING_COLORS.text,
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 14,
    paddingVertical: 0,
  },
  countryCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OPENING_COLORS.chip,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  countryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: OPENING_COLORS.accent,
    marginRight: 8,
  },
  countryCodeChipLabel: {
    color: OPENING_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  roundButtonWrap: {
    alignItems: 'flex-end',
  },
  roundNextButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OPENING_COLORS.accent,
    shadowColor: OPENING_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  roundNextButtonPressed: {
    backgroundColor: OPENING_COLORS.accentPressed,
  },
  roundNextButtonLabel: {
    color: OPENING_COLORS.surface,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  verificationBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verificationBoxesPressed: {
    opacity: 0.95,
  },
  verificationBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: OPENING_COLORS.line,
    backgroundColor: OPENING_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBoxLabel: {
    color: OPENING_COLORS.text,
    fontSize: 28,
    fontWeight: '700',
  },
  hiddenVerificationInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  resendButtonPressed: {
    opacity: 0.7,
  },
  resendText: {
    color: OPENING_COLORS.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  locationContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: OPENING_COLORS.canvas,
  },
  locationIllustrationWrap: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  locationHalo: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: OPENING_COLORS.accentSoft,
  },
  locationImage: {
    width: 220,
    height: 220,
    opacity: 0.3,
  },
  pinWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinHead: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: OPENING_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInnerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: OPENING_COLORS.surface,
  },
  pinTail: {
    width: 24,
    height: 40,
    marginTop: -8,
    backgroundColor: OPENING_COLORS.accent,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    transform: [{ rotate: '45deg' }],
  },
  textFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OPENING_COLORS.line,
    minHeight: 64,
    paddingHorizontal: 18,
  },
  textField: {
    flex: 1,
    color: OPENING_COLORS.text,
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 0,
  },
  fieldChevron: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    borderRadius: 22,
    backgroundColor: OPENING_COLORS.accent,
    shadowColor: OPENING_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryActionButtonPressed: {
    backgroundColor: OPENING_COLORS.accentPressed,
  },
  primaryActionButtonLabel: {
    color: OPENING_COLORS.surface,
    fontSize: 18,
    fontWeight: '700',
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
  logoMarkLight: {
    backgroundColor: 'transparent',
  },
  logoLeafLight: {
    backgroundColor: OPENING_COLORS.surface,
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
  logoTextLight: {
    color: OPENING_COLORS.surface,
  },
});
