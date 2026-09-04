import { createTheme, alpha } from '@mui/material/styles';
import { getPalette, ThemeMode } from './tokens';

// ── Typography scale ──────────────────────────────────────────────────────────
const SERIF  = '"Libre Caslon Text", Georgia, serif';
const SANS   = '"Plus Jakarta Sans", "Inter", system-ui, sans-serif';

// ── Shadows ──────────────────────────────────────────────────────────────
const getShadows = (primary: string) => [
  'none',
  `0 1px 3px ${alpha(primary, 0.06)}, 0 1px 2px ${alpha(primary, 0.04)}`,
  `0 2px 6px ${alpha(primary, 0.07)}, 0 1px 3px ${alpha(primary, 0.05)}`,
  `0 4px 12px ${alpha(primary, 0.08)}, 0 2px 4px ${alpha(primary, 0.05)}`,
  `0 6px 16px ${alpha(primary, 0.08)}, 0 3px 6px ${alpha(primary, 0.05)}`,
  `0 8px 24px ${alpha(primary, 0.09)}, 0 4px 8px ${alpha(primary, 0.06)}`,
  `0 10px 28px ${alpha(primary, 0.09)}`,
  `0 12px 32px ${alpha(primary, 0.10)}`,
  `0 14px 36px ${alpha(primary, 0.10)}`,
  `0 16px 40px ${alpha(primary, 0.11)}`,
  `0 18px 44px ${alpha(primary, 0.11)}`,
  `0 20px 48px ${alpha(primary, 0.12)}`,
  `0 22px 52px ${alpha(primary, 0.12)}`,
  `0 24px 56px ${alpha(primary, 0.13)}`,
  `0 26px 60px ${alpha(primary, 0.13)}`,
  `0 28px 64px ${alpha(primary, 0.14)}`,
  `0 30px 68px ${alpha(primary, 0.14)}`,
  `0 32px 72px ${alpha(primary, 0.15)}`,
  `0 34px 76px ${alpha(primary, 0.15)}`,
  `0 36px 80px ${alpha(primary, 0.16)}`,
  `0 38px 84px ${alpha(primary, 0.16)}`,
  `0 40px 88px ${alpha(primary, 0.17)}`,
  `0 42px 92px ${alpha(primary, 0.17)}`,
  `0 44px 96px ${alpha(primary, 0.18)}`,
  `0 46px 100px ${alpha(primary, 0.18)}`,
];

// ── Theme Generator ───────────────────────────────────────────────────────────
export const createCloudnineTheme = (mode: ThemeMode) => {
  const palette = getPalette(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: palette.primary,
        light: palette.primaryContainer,
        dark: palette.onPrimaryContainer,
        contrastText: palette.onPrimary,
      },
      secondary: {
        main: palette.secondary,
        light: palette.secondaryContainer,
        dark: palette.onSecondaryContainer,
        contrastText: palette.onSecondary,
      },
      error: {
        main: palette.error,
        light: palette.errorContainer,
        dark: palette.onErrorContainer,
        contrastText: palette.onError,
      },
      background: {
        default: palette.background,
        paper: palette.surfaceContainerLow,
      },
      text: {
        primary: palette.onSurface,
        secondary: palette.onSurfaceVariant,
        disabled: alpha(palette.onSurface, 0.38),
      },
      divider: palette.outlineVariant,
      action: {
        active: palette.onSurfaceVariant,
        hover: alpha(palette.primary, 0.08),
        hoverOpacity: 0.08,
        selected: alpha(palette.primary, 0.12),
        selectedOpacity: 0.12,
        disabled: alpha(palette.onSurface, 0.38),
        disabledOpacity: 0.38,
        focus: alpha(palette.primary, 0.12),
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
      },
    },

    typography: {
      fontFamily: SANS,
      h1: { fontFamily: SERIF, fontSize: '3rem', fontWeight: 400, lineHeight: '3.5rem', letterSpacing: '-0.02em' },
      h2: { fontFamily: SERIF, fontSize: '2.25rem', fontWeight: 400, lineHeight: '2.75rem', letterSpacing: '-0.01em' },
      h3: { fontFamily: SERIF, fontSize: '2rem', fontWeight: 400, lineHeight: '2.5rem' },
      h4: { fontFamily: SERIF, fontSize: '1.375rem', fontWeight: 400, lineHeight: '1.75rem' },
      h5: { fontFamily: SERIF, fontSize: '1.25rem', fontWeight: 400, lineHeight: '1.625rem' },
      h6: { fontFamily: SERIF, fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.5rem' },
      body1: { fontFamily: SANS, fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.75rem' },
      body2: { fontFamily: SANS, fontSize: '1rem', fontWeight: 400, lineHeight: '1.5rem' },
      subtitle1: { fontFamily: SANS, fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.25rem', letterSpacing: '0.05em' },
      subtitle2: { fontFamily: SANS, fontSize: '0.75rem', fontWeight: 500, lineHeight: '1rem', letterSpacing: '0.08em' },
      button: { fontFamily: SANS, fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.25rem', letterSpacing: '0.05em', textTransform: 'none' },
      caption: { fontFamily: SANS, fontSize: '0.75rem', fontWeight: 400, lineHeight: '1rem', letterSpacing: '0.04em' },
      overline: { fontFamily: SANS, fontSize: '0.625rem', fontWeight: 500, lineHeight: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' },
    },

    shape: { borderRadius: 8 },

    // Cast as any para evitar erro de TS com sombras dinâmicas, mas funciona perfeitamente no MUI
    shadows: getShadows(palette.primary) as any,

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*, *::before, *::after': { boxSizing: 'border-box' },
          html: { scrollBehavior: 'smooth' },
          body: {
            backgroundColor: palette.background,
            color: palette.onBackground,
            fontFamily: SANS,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '::-webkit-scrollbar': { width: '6px', height: '6px' },
          '::-webkit-scrollbar-track': { background: palette.surfaceContainerLow },
          '::-webkit-scrollbar-thumb': {
            background: palette.outlineVariant,
            borderRadius: '9999px',
            '&:hover': { background: palette.outline },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: '9999px',
            padding: '10px 28px',
            transition: 'all 0.25s ease',
            '&.MuiButton-containedPrimary': {
              background: `linear-gradient(135deg, ${palette.primaryContainer} 0%, ${palette.primary} 100%)`,
              color: palette.onPrimaryContainer,
              border: 'none',
              '&:hover': {
                background: `linear-gradient(135deg, ${palette.primaryContainer} 0%, ${palette.primary} 100%)`,
                boxShadow: `0 0 0 4px ${alpha(palette.primary, 0.18)}, 0 4px 16px ${alpha(palette.primary, 0.25)}`,
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
            },
            '&.MuiButton-outlinedPrimary': {
              border: `1px solid ${palette.primaryContainer}`,
              color: palette.primary,
              background: 'transparent',
              '&:hover': {
                background: alpha(palette.primary, 0.06),
                borderColor: palette.primary,
                boxShadow: `0 0 0 3px ${alpha(palette.primary, 0.10)}`,
              },
            },
            '&.MuiButton-textPrimary': {
              color: palette.primary,
              '&:hover': { background: alpha(palette.primary, 0.06) },
            },
          },
          sizeSmall: { padding: '6px 18px', fontSize: '0.75rem' },
          sizeLarge: { padding: '14px 36px', fontSize: '1rem' },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: '9999px',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: alpha(palette.primary, 0.08),
              boxShadow: `0 0 0 8px ${alpha(palette.primary, 0.06)}`,
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            background: `linear-gradient(135deg, ${palette.primaryContainer} 0%, ${palette.primary} 100%)`,
            color: palette.onPrimaryContainer,
            boxShadow: `0 6px 24px ${alpha(palette.primary, 0.30)}`,
            '&:hover': { boxShadow: `0 8px 32px ${alpha(palette.primary, 0.40)}` },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: palette.surfaceContainerLow,
            borderRadius: '1rem',
            border: `1px solid ${alpha(palette.onSurface, 0.06)}`,
            boxShadow: `0 4px 20px ${alpha(palette.primary, 0.07)}, 0 1px 4px ${alpha(palette.primary, 0.05)}`,
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            '&:hover': {
              boxShadow: `0 8px 32px ${alpha(palette.primary, 0.12)}, 0 2px 8px ${alpha(palette.primary, 0.07)}`,
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: { padding: '20px 24px', '&:last-child': { paddingBottom: '24px' } },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '0.75rem',
            border: `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
            backgroundColor: palette.surfaceContainerLow,
          },
        },
      },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '0.5rem',
            backgroundColor: palette.surfaceContainerLow,
            transition: 'box-shadow 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.outlineVariant,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.outline,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(palette.primary, 0.15)}`,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: palette.primary,
                borderWidth: '1.5px',
              },
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.error },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            backgroundColor: palette.surfaceContainerLow,
            borderRadius: '0.5rem 0.5rem 0 0',
            '&:hover': { backgroundColor: palette.surfaceContainer },
            '&.Mui-focused': { backgroundColor: palette.surfaceContainerLow },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: palette.onSurfaceVariant,
            '&.Mui-focused': { color: palette.primary },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: palette.secondaryContainer,
            color: palette.onSecondaryContainer,
            border: `1px solid ${alpha(palette.secondary, 0.20)}`,
            '&:hover': {
              backgroundColor: alpha(palette.secondary, 0.20),
              boxShadow: `0 2px 8px ${alpha(palette.secondary, 0.15)}`,
            },
          },
          colorPrimary: {
            backgroundColor: palette.primaryContainer,
            color: palette.onPrimaryContainer,
            border: `1px solid ${alpha(palette.primary, 0.20)}`,
          },
          outlined: {
            backgroundColor: 'transparent',
            border: `1px solid ${palette.outlineVariant}`,
            color: palette.onSurfaceVariant,
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: alpha(palette.surfaceContainerLow, 0.72),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
            color: palette.onSurface,
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(palette.surfaceContainerLow, 0.90),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${alpha(palette.outlineVariant, 0.40)}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '1.5rem',
            backgroundColor: alpha(palette.surfaceContainerLow, 0.95),
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
            boxShadow: `0 24px 64px ${alpha(palette.primary, 0.18)}`,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: '0.75rem',
            backgroundColor: alpha(palette.surfaceContainerLow, 0.95),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
            boxShadow: `0 8px 32px ${alpha(palette.primary, 0.12)}`,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: '0.5rem',
            margin: '2px 6px',
            '&:hover': { backgroundColor: alpha(palette.primary, 0.08) },
            '&.Mui-selected': {
              backgroundColor: alpha(palette.primary, 0.12),
              '&:hover': { backgroundColor: alpha(palette.primary, 0.16) },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { color: palette.onSurfaceVariant, '&.Mui-selected': { color: palette.primary } },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { backgroundColor: palette.primary },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            background: `linear-gradient(135deg, ${palette.primaryContainer}, ${palette.primary})`,
            color: palette.onPrimaryContainer,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { backgroundColor: palette.primaryContainer, color: palette.onPrimaryContainer },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '0.75rem',
            '&.MuiAlert-standardError': {
              backgroundColor: palette.errorContainer,
              color: palette.onErrorContainer,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: palette.inverseSurface,
            color: palette.inverseOnSurface,
            borderRadius: '0.5rem',
            boxShadow: `0 4px 12px ${alpha(palette.onSurface, 0.15)}`,
          },
          arrow: { color: palette.inverseSurface },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: palette.primary,
              '& + .MuiSwitch-track': { backgroundColor: palette.primaryContainer },
            },
          },
          track: { backgroundColor: palette.outlineVariant },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: { color: palette.outline, '&.Mui-checked': { color: palette.primary } },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: { color: palette.outline, '&.Mui-checked': { color: palette.primary } },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: { color: palette.primary },
          thumb: {
            boxShadow: `0 0 0 8px ${alpha(palette.primary, 0.10)}`,
            '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 12px ${alpha(palette.primary, 0.14)}` },
          },
          track: { background: `linear-gradient(90deg, ${palette.primaryContainer}, ${palette.primary})` },
          rail: { backgroundColor: palette.outlineVariant },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: palette.surfaceContainerHigh },
          bar: { background: `linear-gradient(90deg, ${palette.primaryContainer}, ${palette.primary})` },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: palette.outlineVariant } },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '0.5rem',
            margin: '2px 0',
            '&:hover': { backgroundColor: alpha(palette.primary, 0.07) },
            '&.Mui-selected': {
              backgroundColor: alpha(palette.primary, 0.12),
              '&:hover': { backgroundColor: alpha(palette.primary, 0.16) },
            },
          },
        },
      },
      MuiAccordion: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: palette.surfaceContainerLow,
            border: `1px solid ${palette.outlineVariant}`,
            '&:before': { display: 'none' },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              color: palette.onSurfaceVariant,
              backgroundColor: palette.surfaceContainerHigh,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: { '&:hover': { backgroundColor: alpha(palette.primary, 0.03) } },
        },
      },
      MuiTableCell: {
        styleOverrides: { root: { borderColor: palette.outlineVariant } },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: palette.surfaceContainerHigh,
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${alpha(palette.primary, 0.08)}, transparent)`,
            },
          },
        },
      },
    },
  });
};
