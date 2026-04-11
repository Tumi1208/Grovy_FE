export const UI_COLORS = Object.freeze({
  screen: '#F4EFE7',
  screenLight: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceMuted: '#F1EBE2',
  surfaceSoft: '#F7F3EC',
  surfaceTint: '#ECE4D8',
  border: '#E4DACD',
  borderSoft: '#ECE3D8',
  borderStrong: '#D6C8B7',
  text: '#201A16',
  textStrong: '#17120F',
  muted: '#766E65',
  mutedStrong: '#655D55',
  accentRed: '#C7674F',
  accentRedPressed: '#B75843',
  accentRedSoft: '#F8E6DF',
  accentGreen: '#547A4E',
  accentGreenPressed: '#42623D',
  accentGreenSoft: '#EAF2E7',
  banner: '#EFE4D3',
  bannerAccent: '#D79B5A',
  bannerSoft: '#E4EDD9',
  hero: '#EEF1E5',
  successSoft: '#EEF6EC',
  successText: '#4D7343',
  errorSoft: '#FAEDEC',
  shadow: '#24180E',
});

export const UI_SPACING = Object.freeze({
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
});

export const UI_RADIUS = Object.freeze({
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  hero: 30,
  round: 999,
});

export const UI_LAYOUT = Object.freeze({
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

export const UI_TYPOGRAPHY = Object.freeze({
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

export const UI_SHADOWS = Object.freeze({
  card: {
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  floating: {
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
});
