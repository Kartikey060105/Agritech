import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Input,
  Button,
  Text,
  Icon,
} from 'react-native-elements';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'yourapp://reset-password',
      });

      if (error) throw error;

      alert('Password reset instructions have been sent to your email');
      navigation.navigate('Login');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Icon
          name="lock"
          type="feather"
          size={50}
          color="#2196F3"
        />
        <Text h3 style={styles.title}>
          Reset Password
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.description}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <Input
          placeholder="Email"
          leftIcon={<Icon name="mail" type="feather" size={20} color="gray" />}
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Button
          title="Send Reset Instructions"
          onPress={handleResetPassword}
          loading={loading}
          containerStyle={styles.button}
        />

        <Button
          title="Back to Login"
          type="clear"
          onPress={() => navigation.navigate('Login')}
          containerStyle={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    marginTop: 20,
    color: '#333',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
  },
}); 