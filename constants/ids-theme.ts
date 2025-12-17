/**
 * NetShield IDS - Enterprise Dark Theme
 * Security-focused, high-contrast design system
 */

export const IDSTheme = {
  colors: {
    // Background layers
    background: '#0A0E14',
    surface: '#111620',
    surfaceElevated: '#1A1F2E',
    surfaceHover: '#222938',
    
    // Primary - Security Blue
    primary: '#00D9FF',
    primaryDark: '#00A8CC',
    primaryLight: '#33E0FF',
    
    // Status colors
    success: '#00E676',
    warning: '#FFB300',
    error: '#FF3D00',
    critical: '#D32F2F',
    
    // Severity indicators
    severity: {
      high: '#FF3D00',
      medium: '#FFB300',
      low: '#00E676',
      info: '#00D9FF',
    },
    
    // Text hierarchy
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
      tertiary: '#78909C',
      disabled: '#546E7A',
    },
    
    // Borders and dividers
    border: '#263238',
    divider: '#1E2832',
    
    // Chart colors
    chart: {
      gradient1: ['#00D9FF', '#0077FF'],
      gradient2: ['#FF3D00', '#FFB300'],
      line: '#00D9FF',
      area: 'rgba(0, 217, 255, 0.2)',
    },
    
    // Status badges
    badge: {
      secure: '#00E676',
      warning: '#FFB300',
      critical: '#FF3D00',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      color: '#B0BEC5',
    },
    label: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

export type IDSThemeType = typeof IDSTheme;
