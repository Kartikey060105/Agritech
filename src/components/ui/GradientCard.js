import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

export function GradientCard({ children, style, intensity = 'medium' }) {
  const { theme, isDark } = useTheme();

  const gradientIntensities = {
    light: {
      colors: isDark 
        ? ['#00E67610', '#004D4020']
        : ['#B9F6CA20', '#00E67610'],
      locations: [0, 1],
    },
    medium: {
      colors: isDark
        ? ['#00E67620', '#004D4040']
        : ['#B9F6CA40', '#00E67620'],
      locations: [0, 1],
    },
    strong: {
      colors: isDark
        ? ['#00E67640', '#004D4080']
        : ['#B9F6CA60', '#00E67640'],
      locations: [0, 1],
    },
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        {
          backgroundColor: theme.colors.card,
          borderColor: isDark ? theme.colors.border : 'transparent',
          ...theme.shadows.small,
        },
        style
      ]}
    >
      <LinearGradient
        {...gradientIntensities[intensity]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
}); 