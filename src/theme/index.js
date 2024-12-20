import { extendTheme } from 'react-native-elements';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
    },
    secondary: {
      50: '#F3E5F5',
      500: '#9C27B0',
      600: '#8E24AA',
    },
    success: {
      50: '#E8F5E9',
      500: '#4CAF50',
    },
    error: {
      50: '#FFEBEE',
      500: '#F44336',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  components: {
    Button: {
      variants: {
        solid: {
          backgroundColor: 'primary.500',
          borderRadius: 8,
        },
        outline: {
          borderColor: 'primary.500',
          borderRadius: 8,
        },
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
    },
  },
}); 