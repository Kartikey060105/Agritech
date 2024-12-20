import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(isDark ? '180deg' : '0deg'),
        },
      ],
      backgroundColor: withTiming(
        isDark ? theme.colors.surface : theme.colors.primary,
        {
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }
      ),
      borderColor: theme.colors.primary,
      borderWidth: isDark ? 1 : 0,
    };
  });

  return (
    <AnimatedTouchable
      onPress={toggleTheme}
      style={[styles.button, animatedStyle]}
    >
      <Icon
        name={isDark ? 'moon' : 'sun'}
        type="feather"
        size={24}
        color={isDark ? theme.colors.primary : theme.colors.card}
      />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 