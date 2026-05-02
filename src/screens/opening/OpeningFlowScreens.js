import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import DirectionalHint from '../../components/DirectionalHint';
import ChevronIcon from '../../components/icons/ChevronIcon';
import PrimaryButton from '../../components/PrimaryButton';
import { AUTH_ROUTES } from '../../constants/routes';
import {
  UI_COLORS,
  UI_LAYOUT,
  UI_MOTION,
  UI_PRESS,
  UI_RADIUS,
  UI_SHADOWS,
  UI_TYPOGRAPHY,
} from '../../constants/ui';
import { useApp } from '../../context/AppContext';
import { getLocationSuggestions } from '../../data/mockLocationOptions';

const OPENING_COLORS = Object.freeze({
  accent: UI_COLORS.accentGreen,
  accentPressed: UI_COLORS.accentGreenPressed,
  accentSoft: UI_COLORS.accentGreenSoft,
  accentWarm: UI_COLORS.banner,
  accentWarmSoft: UI_COLORS.surfaceTint,
  canvas: UI_COLORS.background,
  canvasWarm: UI_COLORS.screenLight,
  surface: UI_COLORS.surface,
  surfaceWarm: UI_COLORS.surfaceWarm,
  surfaceSoft: UI_COLORS.surfaceSoft,
  surfaceMuted: UI_COLORS.surfaceMuted,
  surfaceTint: UI_COLORS.surfaceTint,
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
  location: require('../../assets/illustrations/locator.png'),
});

const DEFAULT_COUNTRY_CODE = '+84';
const SPLASH_NAVIGATION_DELAY_MS = 1400;
const SPLASH_EXIT_DELAY_MS = 1180;

const OPENING_ANIMATION = Object.freeze({
  distance: 22,
  duration: UI_MOTION.slow,
  durationFast: UI_MOTION.fast,
  durationNormal: UI_MOTION.normal,
  scaleFrom: 0.985,
});

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

function AnimatedIntroBlock({
  children,
  delay = 0,
  distance = OPENING_ANIMATION.distance,
  scaleFrom = OPENING_ANIMATION.scaleFrom,
  style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;
  const shouldAnimate = !process.env.JEST_WORKER_ID;

  useEffect(() => {
    if (!shouldAnimate) {
      return undefined;
    }

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: OPENING_ANIMATION.duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: OPENING_ANIMATION.duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: OPENING_ANIMATION.duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop?.();
      opacity.stopAnimation();
      translateY.stopAnimation();
      scale.stopAnimation();
    };
  }, [delay, opacity, scale, scaleFrom, shouldAnimate, translateY]);

  return (
    <Animated.View
      style={[
        style,
        shouldAnimate
          ? {
              opacity,
              transform: [{ translateY }, { scale }],
            }
          : null,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function FloatingVisual({
  amplitude = 6,
  children,
  duration = 3600,
  style,
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const shouldAnimate = !process.env.JEST_WORKER_ID;

  useEffect(() => {
    if (!shouldAnimate) {
      return undefined;
    }

    const animation = Animated.sequence([
      Animated.timing(translateY, {
        toValue: -amplitude,
        duration: Math.round(duration * 0.45),
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: Math.round(duration * 0.55),
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop?.();
      translateY.stopAnimation();
    };
  }, [amplitude, duration, shouldAnimate, translateY]);

  return (
    <Animated.View
      style={[
        style,
        shouldAnimate
          ? {
              transform: [{ translateY }],
            }
          : null,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function OpeningSceneBackground() {
  return (
    <View pointerEvents="none" style={styles.ambientBackground}>
      <View style={[styles.ambientGlow, styles.ambientGlowPrimary]} />
      <View style={[styles.ambientGlow, styles.ambientGlowSecondary]} />
      <View style={[styles.ambientGlow, styles.ambientGlowTertiary]} />
    </View>
  );
}

function GrovyLogo({ large = false }) {
  return (
    <View style={styles.logoWrap}>
      <View style={[styles.logoMark, large && styles.logoMarkLarge]}>
        <View style={[styles.logoMarkPlate, large && styles.logoMarkPlateLarge]} />
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
      disabled={!onPress}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backButton,
        !onPress && styles.backButtonDisabled,
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

function buildBackHandler(navigation, fallbackRouteName = null) {
  return () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (fallbackRouteName) {
      navigation.navigate(fallbackRouteName);
    }
  };
}

function CountryCodeChip({ label = DEFAULT_COUNTRY_CODE }) {
  return (
    <View style={styles.countryCodeChip}>
      <View style={styles.countryDot} />
      <Text style={styles.countryCodeChipLabel}>{label}</Text>
    </View>
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
  const isWarning = tone === 'warning';

  return (
    <View
      style={[
        styles.noticeCard,
        isError && styles.noticeCardError,
        isWarning && styles.noticeCardWarning,
      ]}
    >
      <Text
        style={[
          styles.noticeText,
          isError && styles.noticeTextError,
          isWarning && styles.noticeTextWarning,
        ]}
      >
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
              isWarning && styles.noticeActionLabelWarning,
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
      <View style={styles.locationIllustrationBadge}>
        <Text style={styles.locationIllustrationBadgeLabel}>Delivery area</Text>
      </View>
      <FloatingVisual amplitude={5} duration={3800}>
        <Image
          resizeMode="contain"
          source={OPENING_IMAGES.location}
          style={styles.locationImage}
        />
      </FloatingVisual>
    </View>
  );
}

export function SplashScreen({ navigation }) {
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashTranslateY = useRef(
    new Animated.Value(OPENING_ANIMATION.distance),
  ).current;
  const splashScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashOpacity, {
        toValue: 1,
        duration: OPENING_ANIMATION.duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(splashTranslateY, {
        toValue: 0,
        duration: OPENING_ANIMATION.duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(splashScale, {
        toValue: 1,
        duration: OPENING_ANIMATION.duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: OPENING_ANIMATION.durationNormal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(splashTranslateY, {
          toValue: -10,
          duration: OPENING_ANIMATION.durationNormal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(splashScale, {
          toValue: 0.985,
          duration: OPENING_ANIMATION.durationNormal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, SPLASH_EXIT_DELAY_MS);

    const timer = setTimeout(() => {
      navigation.replace(AUTH_ROUTES.ONBOARDING);
    }, SPLASH_NAVIGATION_DELAY_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(timer);
      splashOpacity.stopAnimation();
      splashTranslateY.stopAnimation();
      splashScale.stopAnimation();
    };
  }, [navigation, splashOpacity, splashScale, splashTranslateY]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <View style={styles.splashScreen}>
        <View style={styles.splashHaloPrimary} />
        <View style={styles.splashHaloSecondary} />
        <View style={styles.splashHaloTertiary} />

        <Animated.View
          style={[
            styles.splashCard,
            {
              opacity: splashOpacity,
              transform: [{ translateY: splashTranslateY }, { scale: splashScale }],
            },
          ]}
        >
          <View style={styles.splashCardTone} />
          <View style={styles.splashCardToneWarm} />
          <View style={styles.splashBadge}>
            <Text style={styles.splashBadgeLabel}>Grovy weekly shop</Text>
          </View>
          <FloatingVisual amplitude={4} duration={3200}>
            <GrovyLogo large />
          </FloatingVisual>
          <Text style={styles.splashTagline}>Fresh groceries made simple</Text>
          <Text style={styles.splashSubtitle}>
            Preparing a warmer, calmer grocery flow for your next restock.
          </Text>
          <View style={styles.splashStatusRow}>
            <View style={styles.splashStatusDot} />
            <Text style={styles.splashStatusText}>Setting up your welcome</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

export function WelcomeScreen() {
  const { completeOnboarding } = useApp();
  const [isContinuing, setIsContinuing] = useState(false);
  const welcomeOpacity = useRef(new Animated.Value(1)).current;
  const welcomeTranslateY = useRef(new Animated.Value(0)).current;
  const welcomeScale = useRef(new Animated.Value(1)).current;

  const handleGetStarted = useCallback(() => {
    if (isContinuing) {
      return;
    }

    setIsContinuing(true);

    Animated.parallel([
      Animated.timing(welcomeOpacity, {
        toValue: 0,
        duration: OPENING_ANIMATION.durationNormal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(welcomeTranslateY, {
        toValue: 14,
        duration: OPENING_ANIMATION.durationNormal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(welcomeScale, {
        toValue: 0.985,
        duration: OPENING_ANIMATION.durationNormal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      completeOnboarding();
    });
  }, [
    completeOnboarding,
    isContinuing,
    welcomeOpacity,
    welcomeScale,
    welcomeTranslateY,
  ]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <Animated.View
        style={[
          styles.welcomeScreen,
          {
            opacity: welcomeOpacity,
            transform: [{ translateY: welcomeTranslateY }, { scale: welcomeScale }],
          },
        ]}
      >
        <OpeningSceneBackground />

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.welcomeContent}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedIntroBlock delay={30} distance={16} style={styles.welcomeHeroCard}>
            <View style={styles.welcomeHeroWarmTone} />
            <View style={styles.welcomeHeroSoftTone} />
            <View style={styles.welcomeHeroTopRow}>
              <SupportPill label="Fresh this week" tone="warm" />
              <Text style={styles.welcomeHeroTopMeta}>Curated for quick restocks</Text>
            </View>
            <View style={styles.welcomeHeroCopyBlock}>
              <Text style={styles.welcomeHeroTitle}>A calmer way to restock.</Text>
              <Text style={styles.welcomeHeroSubtitle}>
                Fresh produce, pantry basics, and weekly essentials arranged for a warm,
                easy first run through Grovy.
              </Text>
            </View>
            <View style={styles.welcomeHeroVisualWrap}>
              <View style={styles.welcomeHeroImageHalo} />
              <FloatingVisual amplitude={6} duration={3800}>
                <Image
                  resizeMode="contain"
                  source={OPENING_IMAGES.welcome}
                  style={styles.welcomeHeroImage}
                />
              </FloatingVisual>
            </View>
            <View style={styles.welcomeHeroSpotlightCard}>
              <Text style={styles.welcomeHeroSpotlightEyebrow}>Weekly reset</Text>
              <Text style={styles.welcomeHeroSpotlightTitle}>
                Fresh produce, pantry basics, and easy top-up essentials in one calm flow.
              </Text>
            </View>
          </AnimatedIntroBlock>

          <AnimatedIntroBlock delay={120} distance={24} style={styles.welcomeCard}>
            <View style={styles.welcomeCardAccent} />
            <GrovyLogo />
            <ScreenHeader
              eyebrow="Groceries, kept simple"
              subtitle="Fresh produce, pantry basics, and weekly staples in one clean, grounded grocery flow."
              title="Welcome to Grovy"
            />

            <View style={styles.supportPillRow}>
              <SupportPill label="Fresh produce" tone="warm" />
              <SupportPill label="Pantry staples" />
              <SupportPill label="Weekly restock" />
            </View>

            <PrimaryButton
              disabled={isContinuing}
              labelStyle={styles.welcomePrimaryActionLabel}
              onPress={handleGetStarted}
              style={[
                styles.primaryAction,
                styles.welcomePrimaryAction,
                isContinuing && styles.welcomePrimaryActionPending,
              ]}
              title={isContinuing ? 'Opening Grovy...' : 'Get started'}
            />
            <Text style={styles.welcomeFooterNote}>
              Create your account and set your delivery area to start shopping.
            </Text>
          </AnimatedIntroBlock>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

export function EntryScreen({ navigation }) {
  const handleBack = buildBackHandler(navigation, AUTH_ROUTES.ONBOARDING);

  function handleContinueWithPhone() {
    navigation.navigate(AUTH_ROUTES.NUMBER_INPUT);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <View style={styles.openingScrollScene}>
        <OpeningSceneBackground />
        <ScrollView
          contentContainerStyle={styles.signInScreen}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedIntroBlock delay={30} distance={16} style={styles.signInHeroCard}>
            <View style={styles.signInHeroSoftTone} />
            <View style={styles.signInHeroWarmTone} />
            <View style={styles.signInHeroTopRow}>
              <View style={styles.signInHeroBadge}>
                <Text style={styles.signInHeroBadgeLabel}>Get started</Text>
              </View>
            </View>
            <View style={styles.signInHeroCopy}>
              <Text style={styles.signInHeroTitle}>
                Choose how you'd like to continue.
              </Text>
              <Text style={styles.signInHeroSubtitle}>
                Sign in to your Grovy account, create a new one, or continue
                with your mobile number.
              </Text>
            </View>
            <FloatingVisual amplitude={5} duration={3600}>
              <Image
                resizeMode="contain"
                source={OPENING_IMAGES.signIn}
                style={styles.signInHeroImage}
              />
            </FloatingVisual>
          </AnimatedIntroBlock>

          <AnimatedIntroBlock delay={120} distance={24} style={styles.signInCard}>
            <BackButton onPress={handleBack} />
            <ScreenHeader
              eyebrow="Start here"
              subtitle="Choose the option that works best for you."
              title="How would you like to continue?"
            />

            <PrimaryButton
              onPress={() => {
                navigation.navigate(AUTH_ROUTES.SIGN_IN);
              }}
              style={styles.entryPrimaryAction}
              title="Sign In"
            />
            <PrimaryButton
              onPress={() => {
                navigation.navigate(AUTH_ROUTES.SIGN_UP);
              }}
              style={styles.entrySecondaryAction}
              title="Create account"
              variant="secondary"
            />

            <Pressable
              android_ripple={{ color: '#EEE7DC' }}
              onPress={handleContinueWithPhone}
              style={({ pressed }) => [
                styles.phoneEntryButton,
                pressed && styles.phoneEntryButtonPressed,
              ]}
            >
              <CountryCodeChip />
              <View style={styles.phoneEntryCopy}>
                <Text style={styles.phoneEntryLabel}>Continue with phone</Text>
                <Text style={styles.phoneEntryMeta}>
                  Use your mobile number to continue
                </Text>
              </View>
              <DirectionalHint
                chevronSize={8}
                color={OPENING_COLORS.muted}
                mode="plain"
                style={styles.phoneEntryArrow}
              />
            </Pressable>
          </AnimatedIntroBlock>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function NumberInputScreen({ navigation, route }) {
  const { openingFlow, saveOpeningPhone } = useApp();
  const handleBack = buildBackHandler(navigation, AUTH_ROUTES.ENTRY);
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
          <OpeningSceneBackground />
          <AnimatedIntroBlock delay={30} distance={18}>
            <View>
              <BackButton onPress={handleBack} />
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
                  We'll use this number to verify your account.
                </Text>
                <InlineNotice message={errorMessage} tone="error" />
              </View>
            </View>
          </AnimatedIntroBlock>

          <AnimatedIntroBlock delay={120} distance={26}>
            <PrimaryButton
              onPress={handleNext}
              disabled={!phoneNumber.trim()}
              style={styles.primaryAction}
              title="Continue"
            />
          </AnimatedIntroBlock>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function VerificationScreen({ navigation, route }) {
  const { completeOpeningVerification, openingFlow } = useApp();
  const handleBack = buildBackHandler(navigation, AUTH_ROUTES.NUMBER_INPUT);
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
    navigation.navigate(AUTH_ROUTES.LOCATION, {
      backRouteName: AUTH_ROUTES.VERIFICATION,
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
          <OpeningSceneBackground />
          <AnimatedIntroBlock delay={30} distance={18}>
            <View>
              <BackButton onPress={handleBack} />
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
                  Enter the verification code to continue.
                </Text>
                <InlineNotice message={errorMessage} tone="error" />
              </View>
            </View>
          </AnimatedIntroBlock>

          <AnimatedIntroBlock delay={120} distance={26}>
            <PrimaryButton
              onPress={handleNext}
              style={styles.primaryAction}
              title="Continue to location"
            />
          </AnimatedIntroBlock>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function LocationScreen({ navigation, route }) {
  const {
    completeCustomerOpeningFlow,
    currentUser,
    isAuthenticated,
    openingFlow,
    saveOpeningLocation,
  } = useApp();
  const canAccessLocationStep =
    isAuthenticated || openingFlow.isVerificationComplete;
  const fallbackRouteName = isAuthenticated
    ? null
    : route.params?.backRouteName ||
      (openingFlow.isVerificationComplete
        ? AUTH_ROUTES.VERIFICATION
        : AUTH_ROUTES.ENTRY);
  const handleBack = buildBackHandler(
    navigation,
    fallbackRouteName,
  );
  const initialLocationValue =
    openingFlow.selectedLocation?.fullAddress ||
    openingFlow.selectedLocation?.detail ||
    currentUser?.location?.fullAddress ||
    currentUser?.location?.detail ||
    currentUser?.location?.label ||
    '';
  const manualInputRef = useRef(null);
  const isMountedRef = useRef(true);
  const [manualLocation, setManualLocation] = useState(initialLocationValue);
  const [selectedSuggestion, setSelectedSuggestion] = useState(
    openingFlow.selectedLocation?.source === 'manual' ? initialLocationValue : '',
  );
  const [isManualInputFocused, setIsManualInputFocused] = useState(false);
  const [manualErrorMessage, setManualErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestionPanelVisible, setIsSuggestionPanelVisible] = useState(false);

  const suggestionItems = getLocationSuggestions(manualLocation, 6);
  const showSuggestions = isSuggestionPanelVisible && !isSubmitting;
  const showSuggestionEmptyState =
    showSuggestions && manualLocation.trim().length > 0 && !suggestionItems.length;
  const hasManualValue = Boolean(manualLocation.trim());
  const hasSelectedSuggestion = Boolean(selectedSuggestion);

  useEffect(() => {
    if (!canAccessLocationStep) {
      navigation.replace(AUTH_ROUTES.ENTRY);
    }
  }, [canAccessLocationStep, navigation]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function focusManualInput() {
    requestAnimationFrame(() => {
      manualInputRef.current?.focus();
    });
  }

  function handleManualLocationChange(value) {
    setManualLocation(value);
    setSelectedSuggestion('');
    setManualErrorMessage('');

    if (!isSuggestionPanelVisible) {
      setIsSuggestionPanelVisible(true);
    }
  }

  function handleSelectSuggestion(locationLabel) {
    if (isSubmitting) {
      return;
    }

    setManualLocation(locationLabel);
    setSelectedSuggestion(locationLabel);
    setManualErrorMessage('');
    setIsSuggestionPanelVisible(false);
    saveOpeningLocation(buildManualLocation(locationLabel));
  }

  function handleFocusManualInput() {
    setIsManualInputFocused(true);
    setIsSuggestionPanelVisible(true);
  }

  async function handleContinue() {
    if (isSubmitting) {
      return;
    }

    if (!manualLocation.trim()) {
      setManualErrorMessage('Please enter your area or address.');
      setIsSuggestionPanelVisible(true);
      focusManualInput();
      return;
    }

    const manualSelection = buildManualLocation(manualLocation);
    saveOpeningLocation(manualSelection);
    setManualErrorMessage('');
    setIsSubmitting(true);

    try {
      await completeCustomerOpeningFlow(manualSelection);
    } catch (error) {
      if (isMountedRef.current) {
        setManualErrorMessage(
          error.message || 'Could not save your location right now.',
        );
        setIsSubmitting(false);
      }
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.lightSafeArea}>
      <StatusBar
        backgroundColor={OPENING_COLORS.canvas}
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexOne}
      >
        <View style={styles.openingScrollScene}>
          <OpeningSceneBackground />
          <ScrollView
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentContainerStyle={styles.locationContent}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AnimatedIntroBlock delay={30} distance={18}>
              <View>
                <BackButton onPress={handleBack} />
                <LocationIllustration />
                <ScreenHeader
                  eyebrow="Set your delivery area"
                  subtitle="Choose the area you shop from most so Grovy can open with the right local context from the very first screen."
                  title="Where should we deliver?"
                />
                <View style={styles.supportPillRow}>
                  <SupportPill label="Manual entry" tone="warm" />
                  <SupportPill label="Popular areas" />
                  <SupportPill label="No GPS required" />
                </View>
              </View>
            </AnimatedIntroBlock>

            <AnimatedIntroBlock delay={110} distance={22}>
              <View style={[styles.formCard, styles.locationFormCard]}>
                <View style={styles.locationFormIntro}>
                  <Text style={styles.locationFormEyebrow}>Choose or type</Text>
                  <Text style={styles.locationFormTitle}>
                    Start with a delivery area that feels most like home.
                  </Text>
                  <Text style={styles.locationFormSubtitle}>
                    Pick a suggested area or type your address manually. This
                    step is required, but live GPS access is not.
                  </Text>
                </View>

                <View style={styles.locationFieldCard}>
                  <View style={styles.manualEntryWrap}>
                    <Text style={styles.fieldLabel}>Delivery location</Text>
                    <View
                      style={[
                        styles.textFieldWrap,
                        isManualInputFocused && styles.locationTextFieldWrapFocused,
                      ]}
                    >
                      <View
                        style={[
                          styles.locationFieldIcon,
                          isManualInputFocused && styles.locationFieldIconActive,
                        ]}
                      >
                        <View
                          style={[
                            styles.locationFieldIconDot,
                            isManualInputFocused && styles.locationFieldIconDotActive,
                          ]}
                        />
                      </View>
                      <TextInput
                        autoCapitalize="words"
                        blurOnSubmit={false}
                        cursorColor={OPENING_COLORS.accent}
                        editable={!isSubmitting}
                        onBlur={() => {
                          setIsManualInputFocused(false);
                        }}
                        onChangeText={handleManualLocationChange}
                        onFocus={handleFocusManualInput}
                        onSubmitEditing={handleContinue}
                        placeholder="District 1, Ho Chi Minh City"
                        placeholderTextColor={OPENING_COLORS.mutedSoft}
                        ref={manualInputRef}
                        returnKeyType="done"
                        selectionColor={OPENING_COLORS.accent}
                        style={[
                          styles.textField,
                          hasManualValue && styles.locationTextFieldFilled,
                        ]}
                        value={manualLocation}
                      />
                    </View>
                    <Text style={[styles.helperText, styles.locationHelperText]}>
                      Enter your district, neighborhood, or full address. Grovy
                      will use this to localize the onboarding flow for this
                      account.
                    </Text>

                    {hasManualValue ? (
                      <View style={styles.locationSummaryCard}>
                        <View style={styles.locationSummaryHeader}>
                          <Text style={styles.locationSummaryEyebrow}>
                            {hasSelectedSuggestion ? 'Selected area' : 'Ready to save'}
                          </Text>
                          <View
                            style={[
                              styles.locationSummaryBadge,
                              hasSelectedSuggestion
                                ? styles.locationSummaryBadgeActive
                                : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.locationSummaryBadgeLabel,
                                hasSelectedSuggestion
                                  ? styles.locationSummaryBadgeLabelActive
                                  : null,
                              ]}
                            >
                              {hasSelectedSuggestion ? 'Suggestion match' : 'Manual entry'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.locationSummaryTitle}>
                          {manualLocation.trim()}
                        </Text>
                        <Text style={styles.locationSummaryDetail}>
                          {hasSelectedSuggestion
                            ? 'Picked from Grovy suggestions for a smoother first delivery setup.'
                            : 'You can continue with this location exactly as entered.'}
                        </Text>
                      </View>
                    ) : null}

                    {showSuggestions ? (
                      <View style={styles.suggestionsCard}>
                        <Text style={styles.suggestionsHeading}>
                          {manualLocation.trim() ? 'Matching areas' : 'Popular areas'}
                        </Text>

                        {showSuggestionEmptyState ? (
                          <View style={styles.suggestionsEmptyState}>
                            <Text style={styles.suggestionsEmptyTitle}>
                              No matching areas found
                            </Text>
                            <Text style={styles.suggestionsEmptySubtitle}>
                              You can keep your typed location and continue.
                            </Text>
                          </View>
                        ) : (
                          <ScrollView
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={false}
                            style={styles.suggestionsList}
                          >
                            {suggestionItems.map(locationLabel => {
                              const isSelected = selectedSuggestion === locationLabel;

                              return (
                                <Pressable
                                  key={locationLabel}
                                  android_ripple={{ color: '#E8ECE2' }}
                                  disabled={isSubmitting}
                                  onPress={() => handleSelectSuggestion(locationLabel)}
                                  style={({ pressed }) => [
                                    styles.suggestionItem,
                                    isSelected && styles.suggestionItemSelected,
                                    pressed && !isSubmitting && styles.suggestionItemPressed,
                                  ]}
                                >
                                  <View style={styles.suggestionCopy}>
                                    <Text
                                      style={[
                                        styles.suggestionLabel,
                                        isSelected && styles.suggestionLabelSelected,
                                      ]}
                                    >
                                      {locationLabel}
                                    </Text>
                                    <Text style={styles.suggestionMeta}>
                                      Tap to use this area
                                    </Text>
                                  </View>
                                  {isSelected ? (
                                    <View style={styles.suggestionBadge}>
                                      <Text style={styles.suggestionBadgeLabel}>
                                        Selected
                                      </Text>
                                    </View>
                                  ) : (
                                    <DirectionalHint
                                      chevronSize={8}
                                      color={OPENING_COLORS.muted}
                                      mode="plain"
                                    />
                                  )}
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        )}
                      </View>
                    ) : null}

                    <InlineNotice message={manualErrorMessage} tone="error" />
                  </View>
                </View>
              </View>
            </AnimatedIntroBlock>

            <AnimatedIntroBlock delay={180} distance={26}>
              <View style={styles.locationFooter}>
              <PrimaryButton
                disabled={!hasManualValue}
                labelStyle={styles.locationActionLabel}
                loading={isSubmitting}
                onPress={handleContinue}
                style={[styles.primaryAction, styles.locationAction]}
                title={
                  isSubmitting
                    ? 'Saving your location...'
                    : 'Continue to shop'
                }
              />
                <Text style={styles.locationFooterNote}>
                  This saves a starting delivery area for this account so Grovy
                  opens in the right place next time.
                </Text>
              </View>
            </AnimatedIntroBlock>
          </ScrollView>
        </View>
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
  ambientBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: UI_RADIUS.round,
  },
  ambientGlowPrimary: {
    top: -86,
    right: -46,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(84, 122, 78, 0.09)',
  },
  ambientGlowSecondary: {
    bottom: 42,
    left: -70,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(215, 155, 90, 0.11)',
  },
  ambientGlowTertiary: {
    top: '42%',
    right: '20%',
    width: 118,
    height: 118,
    backgroundColor: 'rgba(255, 255, 255, 0.44)',
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
  splashHaloTertiary: {
    position: 'absolute',
    top: '34%',
    left: -48,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255, 255, 255, 0.44)',
  },
  splashCard: {
    width: '100%',
    maxWidth: 348,
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'center',
    overflow: 'hidden',
    ...UI_SHADOWS.card,
  },
  splashCardTone: {
    position: 'absolute',
    top: -46,
    right: -24,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(84, 122, 78, 0.08)',
  },
  splashCardToneWarm: {
    position: 'absolute',
    bottom: -36,
    left: -26,
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: 'rgba(215, 155, 90, 0.12)',
  },
  splashBadge: {
    marginBottom: 18,
    borderRadius: UI_RADIUS.pill,
    borderWidth: 1,
    borderColor: '#DDE8D8',
    backgroundColor: OPENING_COLORS.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  splashBadgeLabel: {
    color: OPENING_COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.24,
    textTransform: 'uppercase',
  },
  splashTagline: {
    marginTop: 18,
    color: OPENING_COLORS.text,
    ...UI_TYPOGRAPHY.heroTitle,
    textAlign: 'center',
    maxWidth: '90%',
  },
  splashSubtitle: {
    marginTop: 8,
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.body,
    textAlign: 'center',
    maxWidth: '88%',
  },
  splashStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  splashStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: OPENING_COLORS.accent,
    marginRight: 8,
  },
  splashStatusText: {
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.label,
  },
  welcomeScreen: {
    flex: 1,
    backgroundColor: OPENING_COLORS.canvas,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeContent: {
    flexGrow: 1,
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 24,
  },
  welcomeBackgroundGlowTop: {
    position: 'absolute',
    top: -92,
    right: -48,
    width: 228,
    height: 228,
    borderRadius: 114,
    backgroundColor: 'rgba(84, 122, 78, 0.08)',
  },
  welcomeBackgroundGlowBottom: {
    position: 'absolute',
    bottom: 72,
    left: -72,
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: 'rgba(215, 155, 90, 0.1)',
  },
  welcomeHeroCard: {
    minHeight: 416,
    backgroundColor: OPENING_COLORS.accentWarm,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: '#E1D0BD',
    overflow: 'hidden',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
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
  welcomeHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeHeroTopMeta: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  welcomeHeroCopyBlock: {
    marginTop: 12,
  },
  welcomeHeroTitle: {
    color: OPENING_COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    maxWidth: '85%',
  },
  welcomeHeroSubtitle: {
    color: OPENING_COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: '94%',
  },
  welcomeHeroVisualWrap: {
    marginTop: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeHeroImageHalo: {
    position: 'absolute',
    width: 228,
    height: 228,
    borderRadius: 114,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeHeroImage: {
    width: 260,
    height: 182,
    alignSelf: 'center',
  },
  welcomeHeroSpotlightCard: {
    alignSelf: 'stretch',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(230, 216, 199, 0.95)',
    backgroundColor: 'rgba(255, 253, 252, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  welcomeHeroSpotlightEyebrow: {
    color: OPENING_COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.24,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  welcomeHeroSpotlightTitle: {
    color: OPENING_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  welcomeCard: {
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    overflow: 'hidden',
    ...UI_SHADOWS.card,
  },
  welcomeCardAccent: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: OPENING_COLORS.accent,
  },
  supportPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 20,
  },
  supportPill: {
    backgroundColor: OPENING_COLORS.surfaceSoft,
    borderRadius: UI_RADIUS.pill,
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
  welcomePrimaryAction: {
    marginTop: 4,
    minHeight: 62,
    borderRadius: 24,
    ...UI_SHADOWS.floating,
  },
  welcomePrimaryActionLabel: {
    ...UI_TYPOGRAPHY.buttonLarge,
  },
  welcomePrimaryActionPending: {
    opacity: 0.96,
  },
  welcomeFooterNote: {
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 14,
    textAlign: 'center',
  },
  entryPrimaryAction: {
    marginBottom: 12,
  },
  entrySecondaryAction: {
    marginBottom: 18,
  },
  locationAction: {
    marginTop: 18,
  },
  signInScreen: {
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: OPENING_COLORS.canvas,
  },
  openingScrollScene: {
    flex: 1,
    backgroundColor: OPENING_COLORS.canvas,
    position: 'relative',
    overflow: 'hidden',
  },
  signInHeroCard: {
    minHeight: 304,
    backgroundColor: OPENING_COLORS.surfaceWarm,
    borderRadius: UI_RADIUS.hero,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    marginBottom: 20,
    ...UI_SHADOWS.card,
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
    width: '94%',
    height: 136,
    marginTop: 8,
    alignSelf: 'center',
  },
  signInHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signInHeroBadge: {
    borderRadius: UI_RADIUS.pill,
    borderWidth: 1,
    borderColor: '#DCD7CD',
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  signInHeroBadgeLabel: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  signInHeroMeta: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  signInHeroCopy: {
    marginTop: 18,
  },
  signInHeroTitle: {
    color: OPENING_COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 30,
    maxWidth: '88%',
  },
  signInHeroSubtitle: {
    color: OPENING_COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: '92%',
  },
  signInCard: {
    backgroundColor: OPENING_COLORS.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 10,
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
    ...UI_SHADOWS.card,
  },
  phoneEntryButtonPressed: {
    opacity: UI_PRESS.opacity.soft,
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
    backgroundColor: 'rgba(255, 253, 252, 0.9)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  socialButtonPressed: {
    opacity: UI_PRESS.opacity.soft,
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
    position: 'relative',
    overflow: 'hidden',
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
    opacity: UI_PRESS.opacity.medium,
  },
  backButtonDisabled: {
    opacity: 0.45,
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
    borderRadius: 28,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    padding: 20,
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
  noticeCardWarning: {
    borderColor: '#E6D7BC',
    backgroundColor: UI_COLORS.banner,
  },
  noticeText: {
    color: OPENING_COLORS.accent,
    ...UI_TYPOGRAPHY.label,
  },
  noticeTextError: {
    color: UI_COLORS.accentRed,
  },
  noticeTextWarning: {
    color: OPENING_COLORS.muted,
  },
  noticeActionButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  noticeActionButtonPressed: {
    opacity: UI_PRESS.opacity.medium,
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
  noticeActionLabelWarning: {
    color: OPENING_COLORS.text,
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
    opacity: UI_PRESS.opacity.soft,
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
    opacity: UI_PRESS.opacity.medium,
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
    opacity: UI_PRESS.opacity.soft,
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
  locationActionBadge: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: OPENING_COLORS.surface,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
  },
  locationActionBadgeLabel: {
    color: OPENING_COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  locationContent: {
    flexGrow: 1,
    paddingHorizontal: UI_LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 30,
    backgroundColor: OPENING_COLORS.canvas,
  },
  locationIllustrationCard: {
    height: 224,
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
  locationIllustrationBadge: {
    position: 'absolute',
    top: 18,
    left: 18,
    borderRadius: UI_RADIUS.pill,
    borderWidth: 1,
    borderColor: '#D5E2D2',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  locationIllustrationBadgeLabel: {
    color: OPENING_COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.24,
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
    width: 180,
    height: 130,
  },
  locationFormCard: {
    paddingTop: 18,
    paddingBottom: 18,
  },
  locationFormIntro: {
    borderRadius: 22,
    backgroundColor: OPENING_COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  locationFormEyebrow: {
    color: OPENING_COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.28,
    marginBottom: 6,
  },
  locationFormTitle: {
    color: OPENING_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  locationFormSubtitle: {
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 8,
  },
  locationFieldCard: {
    borderRadius: 24,
    backgroundColor: OPENING_COLORS.surface,
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
  locationTextFieldWrapFocused: {
    borderColor: OPENING_COLORS.accent,
    backgroundColor: OPENING_COLORS.surface,
    shadowColor: OPENING_COLORS.accent,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 1,
  },
  manualEntryWrap: {
    marginTop: 4,
  },
  locationFieldIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    backgroundColor: OPENING_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationFieldIconActive: {
    borderColor: '#D2E0CF',
    backgroundColor: OPENING_COLORS.accentSoft,
  },
  locationFieldIconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: OPENING_COLORS.mutedSoft,
  },
  locationFieldIconDotActive: {
    backgroundColor: OPENING_COLORS.accent,
  },
  locationTextFieldFilled: {
    color: OPENING_COLORS.text,
  },
  locationHelperText: {
    marginBottom: 14,
  },
  suggestionsCard: {
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: OPENING_COLORS.border,
    backgroundColor: OPENING_COLORS.surface,
    padding: 12,
    ...UI_SHADOWS.card,
  },
  suggestionsHeading: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  suggestionsList: {
    maxHeight: 252,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    backgroundColor: OPENING_COLORS.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  suggestionItemSelected: {
    borderColor: '#D2E0CF',
    backgroundColor: OPENING_COLORS.accentSoft,
  },
  suggestionItemPressed: {
    opacity: UI_PRESS.opacity.soft,
  },
  suggestionCopy: {
    flex: 1,
    marginRight: 12,
  },
  suggestionLabel: {
    color: OPENING_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  suggestionLabelSelected: {
    color: OPENING_COLORS.accent,
  },
  suggestionMeta: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  suggestionBadge: {
    borderRadius: UI_RADIUS.round,
    backgroundColor: OPENING_COLORS.surface,
    borderWidth: 1,
    borderColor: '#D2E0CF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  suggestionBadgeLabel: {
    color: OPENING_COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.28,
  },
  suggestionsEmptyState: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: OPENING_COLORS.borderSoft,
    backgroundColor: OPENING_COLORS.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  suggestionsEmptyTitle: {
    color: OPENING_COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  suggestionsEmptySubtitle: {
    color: OPENING_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
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
  locationSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationSummaryEyebrow: {
    color: OPENING_COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  locationSummaryBadge: {
    borderRadius: UI_RADIUS.round,
    borderWidth: 1,
    borderColor: '#D2DCCF',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationSummaryBadgeActive: {
    borderColor: '#CDE0C8',
    backgroundColor: OPENING_COLORS.surface,
  },
  locationSummaryBadgeLabel: {
    color: OPENING_COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.28,
  },
  locationSummaryBadgeLabelActive: {
    color: OPENING_COLORS.accent,
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
  locationFooter: {
    paddingBottom: 8,
  },
  locationActionLabel: {
    ...UI_TYPOGRAPHY.buttonLarge,
  },
  locationFooterNote: {
    color: OPENING_COLORS.muted,
    ...UI_TYPOGRAPHY.meta,
    marginTop: 14,
    textAlign: 'center',
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
  logoMarkPlate: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: OPENING_COLORS.surfaceTint,
  },
  logoMarkPlateLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
