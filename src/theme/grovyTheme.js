const GROVY_COLORS = Object.freeze({
  background: '#F7F1E8',
  backgroundElevated: '#FBF6EE',
  surface: '#FFFDFC',
  surfaceWarm: '#F8F0E5',
  surfaceMuted: '#F2E6D8',
  surfaceSoft: '#F8F0E5',
  surfaceTint: '#EFE2D2',
  primary: '#4F7A4A',
  primaryDark: '#3F653C',
  primarySoft: '#E8F1E3',
  primaryPressed: '#3F653C',
  accent: '#D38D56',
  accentSoft: '#F8E8DA',
  text: '#231C15',
  mutedText: '#786E63',
  textMuted: '#786E63',
  textSubtle: '#685E54',
  border: '#E6D8C7',
  borderSoft: '#EEE3D6',
  borderStrong: '#D8C5AF',
  danger: '#C76A52',
  dangerPressed: '#B75C46',
  dangerSoft: '#F8E7E2',
  warning: '#D79B5A',
  success: '#4F7A4A',
  successSoft: '#EEF5E8',
  successText: '#486A43',
  hero: '#EEF2E6',
  banner: '#F2E5D4',
  bannerSoft: '#E7EEDC',
  shadow: '#2C1A0D',
});

const GROVY_SPACING = Object.freeze({
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
});

const GROVY_RADIUS = Object.freeze({
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
  xxl: 26,
  hero: 30,
  round: 999,
});

const GROVY_LAYOUT = Object.freeze({
  screenPadding: 24,
  homeScreenPadding: 24,
  screenTop: 10,
  bottomNavSide: 18,
  bottomNavBottom: 16,
  footerSide: 20,
  footerBottom: 20,
  bottomNavContentInset: 124,
  searchHeight: 56,
  ctaHeight: 58,
  iconButton: 44,
  compactAction: 40,
});

const GROVY_FONT_SIZES = Object.freeze({
  xs: 11,
  sm: 12,
  md: 14,
  body: 15,
  lg: 16,
  xl: 17,
  title: 20,
  section: 22,
  hero: 30,
  display: 32,
});

const GROVY_FONT_WEIGHTS = Object.freeze({
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
});

const GROVY_LINE_HEIGHTS = Object.freeze({
  xs: 14,
  sm: 16,
  md: 20,
  body: 22,
  title: 26,
  section: 28,
  hero: 36,
  display: 38,
});

const GROVY_TYPOGRAPHY = Object.freeze({
  sizes: GROVY_FONT_SIZES,
  weights: GROVY_FONT_WEIGHTS,
  lineHeights: GROVY_LINE_HEIGHTS,
  screenTitle: {
    fontSize: GROVY_FONT_SIZES.hero,
    fontWeight: GROVY_FONT_WEIGHTS.heavy,
    lineHeight: GROVY_LINE_HEIGHTS.hero,
  },
  heroTitle: {
    fontSize: GROVY_FONT_SIZES.display,
    fontWeight: GROVY_FONT_WEIGHTS.heavy,
    lineHeight: GROVY_LINE_HEIGHTS.display,
  },
  sectionTitle: {
    fontSize: GROVY_FONT_SIZES.section,
    fontWeight: GROVY_FONT_WEIGHTS.bold,
    lineHeight: GROVY_LINE_HEIGHTS.section,
  },
  title: {
    fontSize: GROVY_FONT_SIZES.title,
    fontWeight: GROVY_FONT_WEIGHTS.bold,
    lineHeight: GROVY_LINE_HEIGHTS.title,
  },
  cardTitle: {
    fontSize: GROVY_FONT_SIZES.lg,
    fontWeight: GROVY_FONT_WEIGHTS.bold,
    lineHeight: GROVY_LINE_HEIGHTS.body,
  },
  body: {
    fontSize: GROVY_FONT_SIZES.body,
    lineHeight: GROVY_LINE_HEIGHTS.body,
  },
  bodyStrong: {
    fontSize: GROVY_FONT_SIZES.body,
    fontWeight: GROVY_FONT_WEIGHTS.semibold,
    lineHeight: GROVY_LINE_HEIGHTS.body,
  },
  label: {
    fontSize: GROVY_FONT_SIZES.sm,
    fontWeight: GROVY_FONT_WEIGHTS.semibold,
    lineHeight: 17,
  },
  meta: {
    fontSize: GROVY_FONT_SIZES.md,
    lineHeight: GROVY_LINE_HEIGHTS.md,
  },
  button: {
    fontSize: GROVY_FONT_SIZES.lg,
    fontWeight: GROVY_FONT_WEIGHTS.bold,
    lineHeight: GROVY_LINE_HEIGHTS.md,
  },
  buttonLarge: {
    fontSize: GROVY_FONT_SIZES.xl,
    fontWeight: GROVY_FONT_WEIGHTS.bold,
    lineHeight: 22,
  },
  price: {
    fontSize: GROVY_FONT_SIZES.title,
    fontWeight: GROVY_FONT_WEIGHTS.heavy,
    lineHeight: 24,
  },
  priceLarge: {
    fontSize: GROVY_FONT_SIZES.hero,
    fontWeight: GROVY_FONT_WEIGHTS.heavy,
    lineHeight: GROVY_LINE_HEIGHTS.hero,
  },
});

const GROVY_CARD_SHADOW = Object.freeze({
  shadowColor: GROVY_COLORS.shadow,
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 2,
});

const GROVY_FLOATING_SHADOW = Object.freeze({
  shadowColor: GROVY_COLORS.shadow,
  shadowOffset: {
    width: 0,
    height: 14,
  },
  shadowOpacity: 0.1,
  shadowRadius: 24,
  elevation: 5,
});

const GROVY_LIFTED_SHADOW = Object.freeze({
  shadowColor: GROVY_COLORS.shadow,
  shadowOffset: {
    width: 0,
    height: 18,
  },
  shadowOpacity: 0.12,
  shadowRadius: 28,
  elevation: 7,
});

const GROVY_SHADOWS = Object.freeze({
  cardShadow: GROVY_CARD_SHADOW,
  floatingShadow: GROVY_FLOATING_SHADOW,
  liftedShadow: GROVY_LIFTED_SHADOW,
  card: GROVY_CARD_SHADOW,
  floating: GROVY_FLOATING_SHADOW,
  lifted: GROVY_LIFTED_SHADOW,
});

const GROVY_MOTION = Object.freeze({
  fast: 120,
  normal: 220,
  slow: 320,
});

const GROVY_PRESS_FEEDBACK = Object.freeze({
  scale: Object.freeze({
    subtle: 0.992,
    default: 0.98,
    button: 0.985,
    medium: 0.97,
    strong: 0.94,
  }),
  opacity: Object.freeze({
    subtle: 0.98,
    soft: 0.96,
    medium: 0.92,
    strong: 0.88,
    disabled: 0.55,
  }),
  timing: Object.freeze({
    in: 90,
    out: 160,
  }),
});

export const GROVY_THEME = Object.freeze({
  colors: GROVY_COLORS,
  layout: GROVY_LAYOUT,
  motion: GROVY_MOTION,
  press: GROVY_PRESS_FEEDBACK,
  radius: GROVY_RADIUS,
  shadows: GROVY_SHADOWS,
  spacing: GROVY_SPACING,
  typography: GROVY_TYPOGRAPHY,
});

export {
  GROVY_COLORS,
  GROVY_LAYOUT,
  GROVY_MOTION,
  GROVY_PRESS_FEEDBACK,
  GROVY_RADIUS,
  GROVY_SHADOWS,
  GROVY_SPACING,
  GROVY_TYPOGRAPHY,
};
