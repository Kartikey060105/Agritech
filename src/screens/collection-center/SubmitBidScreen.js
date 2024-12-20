import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input, Text, Icon, Card } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/CustomButton';

export default function SubmitBidScreen({ route, navigation }) {
  const { order } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    notes: '',
    images: [],
  });

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          base64: asset.base64,
        }));
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const uploadImage = async (base64Image) => {
    try {
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('bid-images')
        .upload(fileName, decode(base64Image), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('bid-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!formData.price) {
      Alert.alert('Error', 'Please enter a price');
      return;
    }

    try {
      setLoading(true);

      // Upload images first
      const imageUrls = await Promise.all(
        formData.images.map(img => uploadImage(img.base64))
      );

      // Create bid
      const { error } = await supabase
        .from('bids')
        .insert([{
          order_id: order.id,
          collection_center_id: user.id,
          price: parseFloat(formData.price),
          notes: formData.notes,
          images: imageUrls,
          status: 'pending',
        }]);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Bid submitted successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
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
        <Card containerStyle={styles.card}>
          <Card.Title>Submit Bid</Card.Title>

          <View style={styles.orderInfo}>
            <Text style={styles.orderTitle}>Order Details</Text>
            <Text>Quantity: {order.quantity} kg</Text>
            <Text>Region: {order.region}</Text>
          </View>

          <Input
            label="Price per kg (₹) *"
            placeholder="Enter your price"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            leftIcon={<Icon name="tag" type="feather" size={20} color="#666" />}
          />

          <Input
            label="Notes"
            placeholder="Add any additional notes or terms"
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            leftIcon={<Icon name="file-text" type="feather" size={20} color="#666" />}
          />

          <Text style={styles.label}>Product Images</Text>
          <ScrollView horizontal style={styles.imageContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="x" type="feather" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleImagePick}
            >
              <Icon name="plus" type="feather" size={30} color="#666" />
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Submit Bid"
              onPress={handleSubmit}
              loading={loading}
              icon={<Icon name="check" type="feather" size={20} color="white" style={{ marginRight: 10 }} />}
            />
            <CustomButton
              title="Cancel"
              type="outline"
              onPress={() => navigation.goBack()}
              containerStyle={styles.cancelButton}
              icon={<Icon name="x" type="feather" size={20} color="#2196F3" style={{ marginRight: 10 }} />}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 10,
  },
  card: {
    borderRadius: 10,
    marginBottom: 20,
  },
  orderInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#86939e',
    marginLeft: 10,
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  imageWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e8ee',
    borderStyle: 'dashed',
  },
  buttonContainer: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
}); 