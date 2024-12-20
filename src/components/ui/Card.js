import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';

export function Card({ children, style, blurred = false }) {
  const { theme, isDark } = useTheme();

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
      {blurred ? (
        <BlurView 
          intensity={isDark ? 40 : 80} 
          style={StyleSheet.absoluteFill} 
        />
      ) : null}
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