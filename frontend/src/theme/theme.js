import { createTheme } from '@mui/material/styles'

export const AGENCY_COLORS = {
  yellow: '#FFF200', // เหลืองหลัก
  yellowSub: '#FFC600', // เหลืองรอง
  navy: '#0C2F53', // น้ำเงิน
}

export function createCertifyTheme(mode = 'light') {
  const isDark = mode === 'dark'

  const palette = isDark
    ? {
        mode: 'dark',
        primary: {
          main: AGENCY_COLORS.yellow,
          dark: AGENCY_COLORS.yellowSub,
          light: '#FFF766',
          contrastText: AGENCY_COLORS.navy,
        },
        secondary: {
          main: AGENCY_COLORS.yellowSub,
          dark: '#E0AE00',
          light: AGENCY_COLORS.yellow,
          contrastText: AGENCY_COLORS.navy,
        },
        success: {
          main: '#5ED4A0',
          contrastText: '#071B30',
        },
        warning: {
          main: AGENCY_COLORS.yellowSub,
          contrastText: AGENCY_COLORS.navy,
        },
        error: {
          main: '#F06A6A',
        },
        background: {
          default: '#071B30',
          paper: AGENCY_COLORS.navy,
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#C2D3E4',
        },
        divider: '#1E466E',
        certify: {
          navy: AGENCY_COLORS.navy,
          teal: AGENCY_COLORS.yellow,
          yellow: AGENCY_COLORS.yellow,
          yellowSub: AGENCY_COLORS.yellowSub,
          sun: AGENCY_COLORS.yellow,
          sun2: AGENCY_COLORS.yellowSub,
          ok: '#5ED4A0',
          warn: AGENCY_COLORS.yellowSub,
          line: '#1E466E',
          cam: '#07192D',
          hoverTint: 'rgba(255, 242, 0, 0.08)',
        },
      }
    : {
        mode: 'light',
        primary: {
          main: AGENCY_COLORS.navy,
          dark: '#08203A',
          light: '#164675',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: AGENCY_COLORS.yellowSub,
          dark: '#E0AE00',
          light: AGENCY_COLORS.yellow,
          contrastText: AGENCY_COLORS.navy,
        },
        success: {
          main: '#12724A',
          contrastText: '#FFFFFF',
        },
        warning: {
          main: '#B54708',
          contrastText: '#FFFFFF',
        },
        error: {
          main: '#C62828',
        },
        background: {
          default: '#F5F7FA',
          paper: '#FFFFFF',
        },
        text: {
          primary: AGENCY_COLORS.navy,
          secondary: '#52657A',
        },
        divider: '#D8E0E8',
        certify: {
          navy: AGENCY_COLORS.navy,
          teal: AGENCY_COLORS.navy,
          yellow: AGENCY_COLORS.yellow,
          yellowSub: AGENCY_COLORS.yellowSub,
          sun: AGENCY_COLORS.yellow,
          sun2: AGENCY_COLORS.yellowSub,
          ok: '#12724A',
          warn: '#B54708',
          line: '#D8E0E8',
          cam: '#09213B',
          hoverTint: 'rgba(12, 47, 83, 0.05)',
        },
      }

  return createTheme({
    palette,
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"IBM Plex Sans Thai", system-ui, -apple-system, sans-serif',
      fontSize: 16,
      h1: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.32 },
      h2: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.35 },
      h3: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.4 },
      h4: { fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4 },
      button: { fontWeight: 700, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':focus-visible': {
            outline: `2px solid ${AGENCY_COLORS.yellowSub}`,
            outlineOffset: '2px',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingBlock: 8,
            paddingInline: 16,
            fontSize: '0.95rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: palette.divider,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            borderColor: palette.divider,
            borderRadius: 14,
            boxShadow: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            color: palette.text.secondary,
            borderBottomWidth: 2,
            whiteSpace: 'nowrap',
          },
          body: {
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
  })
}
