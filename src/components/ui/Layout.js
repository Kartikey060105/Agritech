import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Animated, { 
  withSpring, 
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

export function Layout({ children, style }) {
  const { theme, isDark } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        theme.colors.background,
        {
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }
      ),
    };
  });

  return (
    <Animated.View style={[styles.safe, animatedStyle]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.container, style]}>{children}</View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
}); 