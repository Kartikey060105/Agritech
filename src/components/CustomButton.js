import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

export default function CustomButton({ title, onPress, type = 'solid', loading = false, icon, containerStyle }) {
  return (
    <Button
      title={title}
      onPress={onPress}
      type={type}
      loading={loading}
      icon={icon}
      raised
      containerStyle={[styles.container, containerStyle]}
      buttonStyle={[
        styles.button,
        type === 'outline' && styles.outlineButton,
      ]}
      titleStyle={[
        styles.title,
        type === 'outline' && styles.outlineTitle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 12,
    backgroundColor: '#2196F3',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  outlineTitle: {
    color: '#2196F3',
  },
}); 