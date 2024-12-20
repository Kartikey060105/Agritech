import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-elements';
import Animated, { 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
}) {
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

  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        buttonStyle,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#2196F3'} />
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
  },
  primary: {
    backgroundColor: '#2196F3',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
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
    color: '#2196F3',
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