const lightColors = {
  primary: '#00E676',
  secondary: '#69F0AE',
  success: '#00C853',
  error: '#FF5252',
  warning: '#FFD740',
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#212121',
  subtext: '#757575',
  border: '#E0E0E0',
  input: '#F5F5F5',
  icon: '#757575',
  accent: '#B9F6CA',
};

const darkColors = {
  primary: '#00E676',
  secondary: '#69F0AE',
  success: '#00C853',
  error: '#FF5252',
  warning: '#FFD740',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  subtext: '#B0B0B0',
  border: '#2C2C2C',
  input: '#2C2C2C',
  icon: '#69F0AE',
  accent: '#004D40',
  surface: '#262626',
  elevation: {
    1: '#1E1E1E',
    2: '#222222',
    3: '#242424',
    4: '#272727',
  },
};

const darkShadows = {
  small: {
    shadowColor: '#00E676',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#00E676',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
};

export const createTheme = (isDark = false) => ({
  colors: isDark ? darkColors : lightColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? darkColors.text : lightColors.text,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? darkColors.text : lightColors.text,
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? darkColors.text : lightColors.text,
    },
    body: {
      fontSize: 16,
      color: isDark ? darkColors.text : lightColors.text,
    },
    caption: {
      fontSize: 14,
      color: isDark ? darkColors.subtext : lightColors.subtext,
    },
  },
  shadows: isDark ? darkShadows : {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
}); 