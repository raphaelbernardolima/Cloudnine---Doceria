// ── Cloudnine Patisserie — MD3 Color Tokens ──────────────────────────────────
// Extraídos do Figma (Material Theme Builder)

export const lightPalette = {
  primary: '#5E222A',
  onPrimary: '#FFFFFF',
  primaryContainer: '#A0585F',
  onPrimaryContainer: '#FFFFFF',
  inversePrimary: '#FFB2B8',

  secondary: '#5C260C',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#A05B3C',
  onSecondaryContainer: '#FFFFFF',

  tertiary: '#5E2322',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#A15855',
  onTertiaryContainer: '#FFFFFF',

  error: '#740006',
  onError: '#FFFFFF',
  errorContainer: '#CF2C27',
  onErrorContainer: '#FFFFFF',

  background: '#FFF8F7',
  onBackground: '#22191A',

  surface: '#FFF8F7',
  surfaceDim: '#C5B5B6',
  surfaceBright: '#FFF8F7',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FFF0F0',
  surfaceContainer: '#F6E4E5',
  surfaceContainerHigh: '#EAD9D9',
  surfaceContainerHighest: '#DFCECE',
  onSurface: '#170F10',
  onSurfaceVariant: '#413333',
  inverseSurface: '#382E2F',
  inverseOnSurface: '#FFEDED',

  outline: '#5F4F4F',
  outlineVariant: '#7A6969',
  surfaceTint: '#8F4A51',
} as const;

export const darkPalette = {
  primary: '#FFD1D4',
  onPrimary: '#48121B',
  primaryContainer: '#CA7A81',
  onPrimaryContainer: '#000000',
  inversePrimary: '#74343B',

  secondary: '#FFD3C2',
  onSecondary: '#461600',
  secondaryContainer: '#CA7E5C',
  onSecondaryContainer: '#000000',

  tertiary: '#FFD2CF',
  onTertiary: '#481313',
  tertiaryContainer: '#CB7B77',
  onTertiaryContainer: '#000000',

  error: '#FFD2CC',
  onError: '#540003',
  errorContainer: '#FF5449',
  onErrorContainer: '#000000',

  background: '#1A1112',
  onBackground: '#F0DEDF',

  surface: '#1A1112',
  surfaceDim: '#1A1112',
  surfaceBright: '#4D4242',
  surfaceContainerLowest: '#0C0606',
  surfaceContainerLow: '#241B1C',
  surfaceContainer: '#2F2526',
  surfaceContainerHigh: '#3A3031',
  surfaceContainerHighest: '#463B3C',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#EED7D7',
  inverseSurface: '#F0DEDF',
  inverseOnSurface: '#312828',

  outline: '#C2ADAD',
  outlineVariant: '#9F8C8C',
  surfaceTint: '#FFB2B8',
} as const;

export type ThemeMode = 'light' | 'dark';

export const getPalette = (mode: ThemeMode) => 
  mode === 'light' ? lightPalette : darkPalette;
