import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Input, Text, Icon } from 'react-native-elements';
import { supabase } from '../../lib/supabase';
import CustomButton from '../../components/CustomButton';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
          />
          <Text h3 style={styles.title}>
            Welcome Back
          </Text>
          <Text style={styles.subtitle}>
            Sign in to continue to AgriMarket
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Email"
            leftIcon={<Icon name="mail" type="feather" size={20} color="gray" />}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            value={formData.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            placeholder="Password"
            leftIcon={<Icon name="lock" type="feather" size={20} color="gray" />}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            value={formData.password}
            secureTextEntry
            autoCapitalize="none"
          />

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            icon={<Icon name="log-in" type="feather" size={20} color="white" style={{ marginRight: 10 }} />}
          />

          <CustomButton
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            type="outline"
            containerStyle={styles.secondaryButton}
            icon={<Icon name="user-plus" type="feather" size={20} color="#2196F3" style={{ marginRight: 10 }} />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  secondaryButton: {
    marginTop: 10,
  },
}); 