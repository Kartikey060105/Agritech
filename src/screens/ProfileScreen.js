import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Avatar,
  ListItem,
  Button,
  Text,
  Icon,
  Input,
} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    avatar_url: null,
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, {
            uri: file.uri,
            type: `image/${fileExt}`,
            name: fileName,
          });

        if (uploadError) throw uploadError;

        // Update user profile with new avatar URL
        const { error: updateError } = await supabase
          .from('users')
          .update({
            avatar_url: `${supabase.storageUrl}/avatars/${filePath}`,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Refresh profile
        fetchProfile();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          size="xlarge"
          rounded
          source={{ uri: profile.avatar_url }}
          title={profile.full_name?.charAt(0)}
          onPress={handlePickImage}
        >
          <Avatar.Accessory size={24} onPress={handlePickImage} />
        </Avatar>
        <Text h4 style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.section}>
        <ListItem containerStyle={styles.listHeader}>
          <ListItem.Content>
            <ListItem.Title style={styles.sectionTitle}>
              Personal Information
            </ListItem.Title>
          </ListItem.Content>
          <Button
            type="clear"
            icon={
              <Icon
                name={editing ? 'check' : 'edit-2'}
                type="feather"
                size={20}
                color="#2196F3"
              />
            }
            onPress={() => editing ? handleUpdateProfile() : setEditing(true)}
            loading={loading}
          />
        </ListItem>

        <Input
          label="Full Name"
          value={profile.full_name}
          onChangeText={(text) => setProfile({ ...profile, full_name: text })}
          disabled={!editing}
          leftIcon={<Icon name="user" type="feather" size={20} color="#666" />}
        />

        <Input
          label="Phone"
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          disabled={!editing}
          leftIcon={<Icon name="phone" type="feather" size={20} color="#666" />}
          keyboardType="phone-pad"
        />

        <Input
          label="Address"
          value={profile.address}
          onChangeText={(text) => setProfile({ ...profile, address: text })}
          disabled={!editing}
          leftIcon={<Icon name="map-pin" type="feather" size={20} color="#666" />}
          multiline
        />
      </View>

      <View style={styles.section}>
        <ListItem containerStyle={styles.listHeader}>
          <ListItem.Content>
            <ListItem.Title style={styles.sectionTitle}>
              Account Settings
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>

        <Button
          title="Change Password"
          type="outline"
          icon={
            <Icon
              name="lock"
              type="feather"
              size={20}
              color="#2196F3"
              style={{ marginRight: 10 }}
            />
          }
          containerStyle={styles.button}
        />

        <Button
          title="Sign Out"
          type="outline"
          icon={
            <Icon
              name="log-out"
              type="feather"
              size={20}
              color="#F44336"
              style={{ marginRight: 10 }}
            />
          }
          containerStyle={styles.button}
          buttonStyle={{ borderColor: '#F44336' }}
          titleStyle={{ color: '#F44336' }}
          onPress={handleSignOut}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    marginTop: 15,
    marginBottom: 5,
  },
  email: {
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  listHeader: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    marginHorizontal: 15,
    marginVertical: 5,
  },
}); 