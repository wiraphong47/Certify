import { createTheme } from '@mui/material/styles'

export function createCertifyTheme(mode = 'light') {
  const isDark = mode === 'dark'

  const palette = isDark
    ? {
        mode: 'dark',
        primary: {
          main: '#4A78A8',
          dark: '#355B82',
          light: '#6D99C7',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#FFC600',
          dark: '#E0AC00',
          light: '#FFF200',
          contrastText: '#0C2F53',
        },
        success: {
          main: '#5ED4A0',
          contrastText: '#0B1722',
        },
        warning: {
          main: '#F5A35C',
          contrastText: '#0B1722',
        },
        error: {
          main: '#F06A6A',
        },
        background: {
          default: '#0B1722',
          paper: '#13273A',
        },
        text: {
          primary: '#EAF2F8',
          secondary: '#9FB3C5',
        },
        divider: '#2A4258',
        certify: {
          navy: '#0C2F53',
          teal: '#4A78A8',
          sun: '#FFF200',
          sun2: '#FFC600',
          ok: '#5ED4A0',
          warn: '#F5A35C',
          line: '#2A4258',
          cam: '#071018',
          hoverTint: 'rgba(74, 120, 168, 0.14)',
        },
      }
    : {
        mode: 'light',
        primary: {
          main: '#0C2F53',
          dark: '#08203A',
          light: '#1B4D7E',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#FFC600',
          dark: '#E0AC00',
          light: '#FFF200',
          contrastText: '#0C2F53',
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
          default: '#F7F8FA',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#0C2F53',
          secondary: '#53677B',
        },
        divider: '#D6DEE7',
        certify: {
          navy: '#0C2F53',
          teal: '#0C2F53',
          sun: '#FFF200',
          sun2: '#FFC600',
          ok: '#12724A',
          warn: '#B54708',
          line: '#D6DEE7',
          cam: '#0C1A28',
          hoverTint: 'rgba(14, 124, 134, 0.07)',
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
      h1: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.35 },
      h2: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.35 },
      h3: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.4 },
      h4: { fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4 },
      button: { fontWeight: 700, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':focus-visible': {
            outline: '3px solid #FFF200',
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
            borderRadius: 8,
            paddingBlock: 8,
            paddingInline: 16,
            fontSize: '0.95rem',
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
            borderRadius: 12,
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
