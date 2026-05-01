const GROVY_COLORS = Object.freeze({
  background: '#F7F1E8',
  backgroundElevated: '#FBF6EE',
  surface: '#FFFDFC',
  surfaceMuted: '#F2E6D8',
  surfaceSoft: '#F8F0E5',
  surfaceTint: '#EFE2D2',
  primary: '#4F7A4A',
  primarySoft: '#E8F1E3',
  primaryPressed: '#3F653C',
  accent: '#D38D56',
  accentSoft: '#F8E8DA',
  text: '#231C15',
  textMuted: '#786E63',
  textSubtle: '#685E54',
  border: '#E6D8C7',
  borderSoft: '#EEE3D6',
  borderStrong: '#D8C5AF',
  danger: '#C76A52',
  dangerPressed: '#B75C46',
  dangerSoft: '#F8E7E2',
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

const GROVY_TYPOGRAPHY = Object.freeze({
  screenTitle: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  buttonLarge: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  priceLarge: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
});

const GROVY_SHADOWS = Object.freeze({
  card: {
    shadowColor: GROVY_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  floating: {
    shadowColor: GROVY_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  lifted: {
    shadowColor: GROVY_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 7,
  },
});

export const GROVY_THEME = Object.freeze({
  colors: GROVY_COLORS,
  layout: GROVY_LAYOUT,
  radius: GROVY_RADIUS,
  shadows: GROVY_SHADOWS,
  spacing: GROVY_SPACING,
  typography: GROVY_TYPOGRAPHY,
});

export {
  GROVY_COLORS,
  GROVY_LAYOUT,
  GROVY_RADIUS,
  GROVY_SHADOWS,
  GROVY_SPACING,
  GROVY_TYPOGRAPHY,
};
