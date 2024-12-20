import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Input, Text, Icon } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../lib/supabase';
import CustomButton from '../../components/CustomButton';

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'buyer',
  });

  const handleRegister = async () => {
    if (loading) return;

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      setLoading(true);

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            user_type: formData.userType,
          },
        ]);

      if (profileError) throw profileError;

      alert('Registration successful! Please check your email for verification.');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text h3 style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join AgriMarket today</Text>

        <View style={styles.form}>
          <Input
            placeholder="Full Name"
            leftIcon={<Icon name="user" type="feather" size={20} color="gray" />}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            value={formData.fullName}
          />

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

          <Input
            placeholder="Confirm Password"
            leftIcon={<Icon name="lock" type="feather" size={20} color="gray" />}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            value={formData.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.label}>I am a:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.userType}
              onValueChange={(value) => setFormData({ ...formData, userType: value })}
              style={styles.picker}
            >
              <Picker.Item label="Buyer" value="buyer" />
              <Picker.Item label="Collection Center" value="collection_center" />
            </Picker>
          </View>

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            icon={<Icon name="user-plus" type="feather" size={20} color="white" style={{ marginRight: 10 }} />}
          />

          <CustomButton
            title="Back to Login"
            onPress={() => navigation.goBack()}
            type="outline"
            containerStyle={styles.secondaryButton}
            icon={<Icon name="arrow-left" type="feather" size={20} color="#2196F3" style={{ marginRight: 10 }} />}
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
  title: {
    textAlign: 'center',
    color: '#333',
    marginTop: 40,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#86939e',
    marginLeft: 10,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e8ee',
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  secondaryButton: {
    marginTop: 10,
  },
}); 