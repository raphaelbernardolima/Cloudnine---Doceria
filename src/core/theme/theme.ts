import { createTheme, alpha } from '@mui/material/styles';

// ── Ethereal Patisserie — Color tokens ────────────────────────────────────────
const palette = {
  primary:            '#8b4c52',
  onPrimary:          '#ffffff',
  primaryContainer:   '#d98e94',
  onPrimaryContainer: '#5e282e',
  inversePrimary:     '#ffb2b8',

  secondary:            '#74584d',
  onSecondary:          '#ffffff',
  secondaryContainer:   '#fdd8c9',
  onSecondaryContainer: '#785c51',

  tertiary:            '#625d5d',
  onTertiary:          '#ffffff',
  tertiaryContainer:   '#a7a1a0',
  onTertiaryContainer: '#3c3837',

  error:            '#ba1a1a',
  onError:          '#ffffff',
  errorContainer:   '#ffdad6',
  onErrorContainer: '#93000a',

  background:   '#fff8f7',
  onBackground: '#231919',

  surface:                 '#fff8f7',
  surfaceDim:              '#e8d6d5',
  surfaceBright:           '#fff8f7',
  surfaceContainerLowest:  '#ffffff',
  surfaceContainerLow:     '#fff0f0',
  surfaceContainer:        '#fdeae9',
  surfaceContainerHigh:    '#f7e4e3',
  surfaceContainerHighest: '#f1dede',
  onSurface:               '#231919',
  onSurfaceVariant:        '#524344',
  inverseSurface:          '#392e2e',
  inverseOnSurface:        '#ffedec',

  outline:        '#857373',
  outlineVariant: '#d7c1c2',
  surfaceTint:    '#8b4c52',
  surfaceVariant: '#f1dede',
} as const;

// ── Typography scale ──────────────────────────────────────────────────────────
const SERIF  = '"Libre Caslon Text", Georgia, serif';
const SANS   = '"Plus Jakarta Sans", "Inter", system-ui, sans-serif';

// ── Theme ─────────────────────────────────────────────────────────────────────
export const etherealTheme = createTheme({
  // ── Palette ────────────────────────────────────────────────────────────────
  palette: {
    mode: 'light',
    primary: {
      main:        palette.primary,
      light:       palette.primaryContainer,
      dark:        palette.onPrimaryContainer,
      contrastText: palette.onPrimary,
    },
    secondary: {
      main:        palette.secondary,
      light:       palette.secondaryContainer,
      dark:        palette.onSecondaryContainer,
      contrastText: palette.onSecondary,
    },
    error: {
      main:        palette.error,
      light:       palette.errorContainer,
      dark:        palette.onErrorContainer,
      contrastText: palette.onError,
    },
    background: {
      default: palette.background,
      paper:   palette.surfaceContainerLow,
    },
    text: {
      primary:   palette.onSurface,
      secondary: palette.onSurfaceVariant,
      disabled:  alpha(palette.onSurface, 0.38),
    },
    divider: palette.outlineVariant,
    action: {
      active:           palette.onSurfaceVariant,
      hover:            alpha(palette.primary, 0.08),
      hoverOpacity:     0.08,
      selected:         alpha(palette.primary, 0.12),
      selectedOpacity:  0.12,
      disabled:         alpha(palette.onSurface, 0.38),
      disabledOpacity:  0.38,
      focus:            alpha(palette.primary, 0.12),
      focusOpacity:     0.12,
      activatedOpacity: 0.12,
    },
  },

  // ── Typography ──────────────────────────────────────────────────────────────
  typography: {
    fontFamily: SANS,

    // Display — Libre Caslon
    h1: {
      fontFamily:    SERIF,
      fontSize:      '3rem',       // 48px
      fontWeight:    400,
      lineHeight:    '3.5rem',     // 56px
      letterSpacing: '-0.02em',
    },
    // Display mobile
    h2: {
      fontFamily:    SERIF,
      fontSize:      '2.25rem',    // 36px
      fontWeight:    400,
      lineHeight:    '2.75rem',    // 44px
      letterSpacing: '-0.01em',
    },
    // Headline md
    h3: {
      fontFamily:    SERIF,
      fontSize:      '2rem',       // 32px
      fontWeight:    400,
      lineHeight:    '2.5rem',     // 40px
    },
    // Title lg
    h4: {
      fontFamily:    SERIF,
      fontSize:      '1.375rem',   // 22px
      fontWeight:    400,
      lineHeight:    '1.75rem',    // 28px
    },
    h5: {
      fontFamily:    SERIF,
      fontSize:      '1.25rem',
      fontWeight:    400,
      lineHeight:    '1.625rem',
    },
    h6: {
      fontFamily:    SERIF,
      fontSize:      '1.125rem',
      fontWeight:    400,
      lineHeight:    '1.5rem',
    },
    // Body lg
    body1: {
      fontFamily:  SANS,
      fontSize:    '1.125rem',    // 18px
      fontWeight:  400,
      lineHeight:  '1.75rem',    // 28px
    },
    // Body md
    body2: {
      fontFamily: SANS,
      fontSize:   '1rem',        // 16px
      fontWeight: 400,
      lineHeight: '1.5rem',      // 24px
    },
    // Label md
    subtitle1: {
      fontFamily:    SANS,
      fontSize:      '0.875rem',  // 14px
      fontWeight:    600,
      lineHeight:    '1.25rem',   // 20px
      letterSpacing: '0.05em',
    },
    // Label sm
    subtitle2: {
      fontFamily:    SANS,
      fontSize:      '0.75rem',   // 12px
      fontWeight:    500,
      lineHeight:    '1rem',      // 16px
      letterSpacing: '0.08em',
    },
    // Button labels — tracked out, pill-shaped buttons
    button: {
      fontFamily:    SANS,
      fontSize:      '0.875rem',
      fontWeight:    600,
      lineHeight:    '1.25rem',
      letterSpacing: '0.05em',
      textTransform: 'none',      // evitar ALL CAPS
    },
    caption: {
      fontFamily:    SANS,
      fontSize:      '0.75rem',
      fontWeight:    400,
      lineHeight:    '1rem',
      letterSpacing: '0.04em',
    },
    overline: {
      fontFamily:    SANS,
      fontSize:      '0.625rem',
      fontWeight:    500,
      lineHeight:    '1rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },

  // ── Shape (orgânico, "Cloud" metaphor) ──────────────────────────────────────
  shape: {
    borderRadius: 8, // base 0.5rem
  },

  // ── Shadows — rose-tinted, soft, 5-8% opacity ──────────────────────────────
  shadows: [
    'none',
    `0 1px 3px ${alpha(palette.primary, 0.06)}, 0 1px 2px ${alpha(palette.primary, 0.04)}`,
    `0 2px 6px ${alpha(palette.primary, 0.07)}, 0 1px 3px ${alpha(palette.primary, 0.05)}`,
    `0 4px 12px ${alpha(palette.primary, 0.08)}, 0 2px 4px ${alpha(palette.primary, 0.05)}`,
    `0 6px 16px ${alpha(palette.primary, 0.08)}, 0 3px 6px ${alpha(palette.primary, 0.05)}`,
    `0 8px 24px ${alpha(palette.primary, 0.09)}, 0 4px 8px ${alpha(palette.primary, 0.06)}`,
    `0 10px 28px ${alpha(palette.primary, 0.09)}`,
    `0 12px 32px ${alpha(palette.primary, 0.10)}`,
    `0 14px 36px ${alpha(palette.primary, 0.10)}`,
    `0 16px 40px ${alpha(palette.primary, 0.11)}`,
    `0 18px 44px ${alpha(palette.primary, 0.11)}`,
    `0 20px 48px ${alpha(palette.primary, 0.12)}`,
    `0 22px 52px ${alpha(palette.primary, 0.12)}`,
    `0 24px 56px ${alpha(palette.primary, 0.13)}`,
    `0 26px 60px ${alpha(palette.primary, 0.13)}`,
    `0 28px 64px ${alpha(palette.primary, 0.14)}`,
    `0 30px 68px ${alpha(palette.primary, 0.14)}`,
    `0 32px 72px ${alpha(palette.primary, 0.15)}`,
    `0 34px 76px ${alpha(palette.primary, 0.15)}`,
    `0 36px 80px ${alpha(palette.primary, 0.16)}`,
    `0 38px 84px ${alpha(palette.primary, 0.16)}`,
    `0 40px 88px ${alpha(palette.primary, 0.17)}`,
    `0 42px 92px ${alpha(palette.primary, 0.17)}`,
    `0 44px 96px ${alpha(palette.primary, 0.18)}`,
    `0 46px 100px ${alpha(palette.primary, 0.18)}`,
  ],

  // ── Component overrides ─────────────────────────────────────────────────────
  components: {

    // ── CssBaseline ────────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        html: { scrollBehavior: 'smooth' },
        body: {
          backgroundColor: palette.background,
          color:           palette.onBackground,
          fontFamily:      SANS,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        // thin scrollbar
        '::-webkit-scrollbar':       { width: '6px', height: '6px' },
        '::-webkit-scrollbar-track': { background: palette.surfaceContainerLow },
        '::-webkit-scrollbar-thumb': {
          background:   palette.outlineVariant,
          borderRadius: '9999px',
          '&:hover':    { background: palette.outline },
        },
      },
    },

    // ── Button — pill-shaped, rose gold gradient ────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          padding:      '10px 28px',
          fontFamily:   SANS,
          fontSize:     '0.875rem',
          fontWeight:   600,
          letterSpacing:'0.05em',
          textTransform:'none',
          transition:   'all 0.25s ease',
          // contained primary
          '&.MuiButton-containedPrimary': {
            background:   `linear-gradient(135deg, ${palette.primaryContainer} 0%, ${palette.primary} 100%)`,
            color:        palette.onPrimaryContainer,
            border:       'none',
            '&:hover': {
              background: `linear-gradient(135deg, ${palette.primaryContainer} 0%, ${palette.primary} 100%)`,
              boxShadow:  `0 0 0 4px ${alpha(palette.primary, 0.18)}, 0 4px 16px ${alpha(palette.primary, 0.25)}`,
              transform:  'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
          // outlined primary
          '&.MuiButton-outlinedPrimary': {
            border:     `1px solid ${palette.primaryContainer}`,
            color:      palette.primary,
            background: 'transparent',
            '&:hover': {
              background:  alpha(palette.primary, 0.06),
              borderColor: palette.primary,
              boxShadow:   `0 0 0 3px ${alpha(palette.primary, 0.10)}`,
            },
          },
          // text primary
          '&.MuiButton-textPrimary': {
            color: palette.primary,
            '&:hover': { background: alpha(palette.primary, 0.06) },
          },
        },
        sizeSmall: {
          padding:  '6px 18px',
          fontSize: '0.75rem',
        },
        sizeLarge: {
          padding:  '14px 36px',
          fontSize: '1rem',
        },
      },
    },

    // ── IconButton ─────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          transition:   'all 0.2s ease',
          '&:hover': {
            background:  alpha(palette.primary, 0.08),
            boxShadow:   `0 0 0 8px ${alpha(palette.primary, 0.06)}`,
          },
        },
      },
    },

    // ── Fab ────────────────────────────────────────────────────────────────
    MuiFab: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${palette.primaryContainer} 0%, ${palette.primary} 100%)`,
          color:      palette.onPrimaryContainer,
          boxShadow:  `0 6px 24px ${alpha(palette.primary, 0.30)}`,
          '&:hover': {
            boxShadow: `0 8px 32px ${alpha(palette.primary, 0.40)}`,
          },
        },
      },
    },

    // ── Card — "Cloud" container ────────────────────────────────────────────
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: palette.surfaceContainerLow,
          borderRadius:    '1rem',   // 16px
          border:          `1px solid ${alpha(palette.onSurface, 0.06)}`,
          boxShadow:       `0 4px 20px ${alpha(palette.primary, 0.07)}, 0 1px 4px ${alpha(palette.primary, 0.05)}`,
          transition:      'box-shadow 0.3s ease, transform 0.3s ease',
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

    // ── Paper ───────────────────────────────────────────────────────────────
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius:    '0.75rem',
          border:          `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
        },
        elevation1: {
          boxShadow: `0 2px 8px ${alpha(palette.primary, 0.07)}`,
        },
        elevation2: {
          boxShadow: `0 4px 16px ${alpha(palette.primary, 0.09)}`,
        },
        elevation3: {
          boxShadow: `0 8px 28px ${alpha(palette.primary, 0.11)}`,
        },
      },
    },

    // ── TextField / Input — Tertiary fill, focus glow ──────────────────────
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius:    '0.5rem',
          backgroundColor: palette.surfaceContainerLow,
          fontFamily:      SANS,
          transition:      'box-shadow 0.2s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.outlineVariant,
            transition:  'border-color 0.2s ease, box-shadow 0.2s ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.outline,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(palette.primary, 0.15)}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.primary,
              borderWidth:  '1.5px',
            },
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.error,
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: palette.surfaceContainerLow,
          borderRadius:    '0.5rem 0.5rem 0 0',
          '&:hover': { backgroundColor: palette.surfaceContainer },
          '&.Mui-focused': { backgroundColor: palette.surfaceContainerLow },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily:    SANS,
          fontSize:      '0.75rem',
          fontWeight:    500,
          letterSpacing: '0.08em',
          color:         palette.onSurfaceVariant,
          '&.Mui-focused': { color: palette.primary },
        },
      },
    },

    // ── Chip — pill, flavor tags ────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius:  '9999px',
          fontFamily:    SANS,
          fontSize:      '0.75rem',
          fontWeight:    500,
          letterSpacing: '0.04em',
          backgroundColor: palette.secondaryContainer,
          color:           palette.onSecondaryContainer,
          border:          `1px solid ${alpha(palette.secondary, 0.20)}`,
          transition:      'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(palette.secondary, 0.20),
            boxShadow:       `0 2px 8px ${alpha(palette.secondary, 0.15)}`,
          },
        },
        colorPrimary: {
          backgroundColor: palette.primaryContainer,
          color:           palette.onPrimaryContainer,
          border:          `1px solid ${alpha(palette.primary, 0.20)}`,
        },
        outlined: {
          backgroundColor: 'transparent',
          border:          `1px solid ${palette.outlineVariant}`,
          color:           palette.onSurfaceVariant,
        },
      },
    },

    // ── AppBar / Toolbar — glassmorphism ────────────────────────────────────
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor:     alpha(palette.surfaceContainerLow, 0.72),
          backdropFilter:      'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          borderBottom:        `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
          color:               palette.onSurface,
          backgroundImage:     'none',
        },
        colorPrimary: {
          backgroundColor: alpha(palette.surfaceContainerLow, 0.72),
          color:           palette.onSurface,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: '64px !important' },
      },
    },

    // ── Drawer — glassmorphism ──────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor:     alpha(palette.surfaceContainerLow, 0.90),
          backdropFilter:      'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          border:              `1px solid ${alpha(palette.outlineVariant, 0.40)}`,
          backgroundImage:     'none',
        },
      },
    },

    // ── Dialog — glass overlay ──────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius:        '1.5rem',
          backgroundColor:     alpha(palette.surfaceContainerLow, 0.95),
          backdropFilter:      'blur(16px)',
          WebkitBackdropFilter:'blur(16px)',
          border:              `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
          boxShadow:           `0 24px 64px ${alpha(palette.primary, 0.18)}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: SERIF,
          fontSize:   '1.375rem',
          fontWeight: 400,
          padding:    '24px 28px 12px',
        },
      },
    },

    // ── Menu / Popover ───────────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius:        '0.75rem',
          backgroundColor:     alpha(palette.surfaceContainerLow, 0.95),
          backdropFilter:      'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          border:              `1px solid ${alpha(palette.outlineVariant, 0.5)}`,
          boxShadow:           `0 8px 32px ${alpha(palette.primary, 0.12)}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily:   SANS,
          borderRadius: '0.5rem',
          margin:       '2px 6px',
          padding:      '10px 12px',
          transition:   'background 0.15s ease',
          '&:hover': { backgroundColor: alpha(palette.primary, 0.08) },
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary, 0.12),
            '&:hover': { backgroundColor: alpha(palette.primary, 0.16) },
          },
        },
      },
    },

    // ── Tabs ────────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily:    SANS,
          fontWeight:    600,
          fontSize:      '0.875rem',
          letterSpacing: '0.04em',
          textTransform: 'none',
          color:         palette.onSurfaceVariant,
          '&.Mui-selected': { color: palette.primary },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: palette.primary,
          height:          '2px',
          borderRadius:    '2px 2px 0 0',
        },
      },
    },

    // ── Badge ───────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontFamily:    SANS,
          fontSize:      '0.625rem',
          fontWeight:    700,
          letterSpacing: '0.02em',
          background:    `linear-gradient(135deg, ${palette.primaryContainer}, ${palette.primary})`,
          color:         palette.onPrimaryContainer,
        },
      },
    },

    // ── Avatar ──────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.primaryContainer,
          color:           palette.onPrimaryContainer,
          fontFamily:      SANS,
          fontWeight:      600,
        },
      },
    },

    // ── Alert ───────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          fontFamily:   SANS,
          fontSize:     '0.875rem',
          '&.MuiAlert-standardError': {
            backgroundColor: palette.errorContainer,
            color:           palette.onErrorContainer,
          },
        },
      },
    },

    // ── Tooltip ─────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.inverseSurface,
          color:           palette.inverseOnSurface,
          fontFamily:      SANS,
          fontSize:        '0.75rem',
          fontWeight:      500,
          borderRadius:    '0.5rem',
          padding:         '6px 12px',
          boxShadow:       `0 4px 12px ${alpha(palette.onSurface, 0.15)}`,
        },
        arrow: { color: palette.inverseSurface },
      },
    },

    // ── Switch ──────────────────────────────────────────────────────────────
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

    // ── Checkbox & Radio ────────────────────────────────────────────────────
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: palette.outline,
          '&.Mui-checked': { color: palette.primary },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: palette.outline,
          '&.Mui-checked': { color: palette.primary },
        },
      },
    },

    // ── Slider ──────────────────────────────────────────────────────────────
    MuiSlider: {
      styleOverrides: {
        root: { color: palette.primary },
        thumb: {
          boxShadow: `0 0 0 8px ${alpha(palette.primary, 0.10)}`,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 12px ${alpha(palette.primary, 0.14)}`,
          },
        },
        track: { background: `linear-gradient(90deg, ${palette.primaryContainer}, ${palette.primary})` },
        rail:  { backgroundColor: palette.outlineVariant },
      },
    },

    // ── CircularProgress & LinearProgress ──────────────────────────────────
    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: { color: palette.primary },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: palette.surfaceContainerHigh, borderRadius: '9999px', height: '4px' },
        bar:  { background: `linear-gradient(90deg, ${palette.primaryContainer}, ${palette.primary})`, borderRadius: '9999px' },
      },
    },

    // ── Divider ─────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: palette.outlineVariant },
      },
    },

    // ── List ────────────────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          margin:       '2px 0',
          transition:   'background 0.15s ease',
          '&:hover': { backgroundColor: alpha(palette.primary, 0.07) },
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary, 0.12),
            '&:hover': { backgroundColor: alpha(palette.primary, 0.16) },
          },
        },
      },
    },

    // ── Snackbar ────────────────────────────────────────────────────────────
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: palette.inverseSurface,
          color:           palette.inverseOnSurface,
          fontFamily:      SANS,
          borderRadius:    '0.75rem',
          boxShadow:       `0 8px 24px ${alpha(palette.onSurface, 0.20)}`,
        },
      },
    },

    // ── Accordion ───────────────────────────────────────────────────────────
    MuiAccordion: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: palette.surfaceContainerLow,
          borderRadius:    '0.75rem !important',
          border:          `1px solid ${palette.outlineVariant}`,
          marginBottom:    '8px',
          '&:before':      { display: 'none' },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          fontFamily: SANS,
          fontWeight: 600,
          '&:hover':  { backgroundColor: alpha(palette.primary, 0.04) },
        },
      },
    },

    // ── Select ──────────────────────────────────────────────────────────────
    MuiSelect: {
      styleOverrides: {
        select: { fontFamily: SANS },
      },
    },

    // ── Table ───────────────────────────────────────────────────────────────
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontFamily:      SANS,
            fontWeight:      600,
            fontSize:        '0.75rem',
            letterSpacing:   '0.08em',
            color:           palette.onSurfaceVariant,
            backgroundColor: palette.surfaceContainerHigh,
            textTransform:   'uppercase',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.15s ease',
          '&:hover': {
            backgroundColor: alpha(palette.primary, 0.03),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily:  SANS,
          fontSize:    '0.875rem',
          borderColor: palette.outlineVariant,
          padding:     '14px 16px',
        },
      },
    },

    // ── Skeleton ────────────────────────────────────────────────────────────
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

    // ── Stepper ─────────────────────────────────────────────────────────────
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: palette.outlineVariant,
          '&.Mui-active':    { color: palette.primary },
          '&.Mui-completed': { color: palette.primary },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontFamily: SANS,
          fontSize:   '0.875rem',
          fontWeight: 500,
        },
      },
    },
  },
});
