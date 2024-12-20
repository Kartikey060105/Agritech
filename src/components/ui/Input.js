import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-elements';
import { useTheme } from '../../contexts/ThemeContext';

export function Input({
  label,
  error,
  icon,
  containerStyle,
  ...props
}) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = new Animated.Value(0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.subtext }]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: theme.colors.input,
          },
          error && { borderColor: theme.colors.error },
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            {React.cloneElement(icon, {
              color: error ? theme.colors.error : theme.colors.icon,
            })}
          </View>
        )}
        <TextInput
          {...props}
          style={[
            styles.input,
            {
              color: theme.colors.text,
            },
            icon && styles.inputWithIcon,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.subtext}
        />
      </Animated.View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#86939e',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  iconContainer: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  errorBorder: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
}); 