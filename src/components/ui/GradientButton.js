import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function GradientButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
}) {
  const { theme, isDark } = useTheme();

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(disabled || loading ? 0.95 : 1)
        }
      ],
      opacity: withSpring(disabled ? 0.5 : 1)
    };
  });

  const getGradientColors = () => {
    if (variant === 'primary') {
      return isDark 
        ? ['#00E676', '#004D40']
        : ['#69F0AE', '#00E676'];
    }
    return isDark
      ? ['#1E1E1E', '#262626']
      : ['#FFFFFF', '#F5F5F5'];
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, styles[size], buttonStyle, style]}
    >
      <AnimatedGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`]
          ]}>
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#00E676',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
}); 