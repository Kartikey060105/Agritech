import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import {
  Input,
  Button,
  Text,
  Icon,
  Card,
} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function UpdateBidScreen({ route, navigation }) {
  const { bid, orderDetails } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: bid.price.toString(),
    notes: bid.notes || '',
    images: bid.images || [],
  });

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // Upload new images
      const uploadedImages = await Promise.all(
        formData.images
          .filter(uri => uri.startsWith('file://'))
          .map(async (uri) => {
            const fileName = `${Math.random()}.jpg`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('bid-images')
              .upload(filePath, {
                uri,
                type: 'image/jpeg',
                name: fileName,
              });

            if (uploadError) throw uploadError;

            return `${supabase.storageUrl}/bid-images/${filePath}`;
          })
      );

      // Update bid
      const { error } = await supabase
        .from('bids')
        .update({
          price: parseFloat(formData.price),
          notes: formData.notes,
          images: [
            ...formData.images.filter(uri => !uri.startsWith('file://')),
            ...uploadedImages,
          ],
        })
        .eq('id', bid.id);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Bid updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Card.Title>Update Bid</Card.Title>

        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>Order Details</Text>
          <Text>Quantity: {orderDetails.quantity}kg</Text>
          <Text>Region: {orderDetails.region}</Text>
          <Text>Delivery: {orderDetails.delivery_location}</Text>
        </View>

        <Input
          label="Price per kg (₹)"
          keyboardType="numeric"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          leftIcon={<Icon name="dollar-sign" type="feather" size={20} color="#666" />}
        />

        <Input
          label="Notes"
          multiline
          numberOfLines={3}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          leftIcon={<Icon name="file-text" type="feather" size={20} color="#666" />}
        />

        <Text style={styles.label}>Product Images</Text>
        <ScrollView horizontal style={styles.imageContainer}>
          {formData.images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <Button
                icon={<Icon name="x" type="feather" size={20} color="white" />}
                onPress={() => handleRemoveImage(index)}
                containerStyle={styles.removeButton}
              />
            </View>
          ))}
          <Button
            icon={<Icon name="plus" type="feather" size={40} color="#2196F3" />}
            type="clear"
            onPress={handlePickImage}
            containerStyle={styles.addButton}
          />
        </ScrollView>

        <Button
          title="Update Bid"
          onPress={handleSubmit}
          loading={loading}
          icon={<Icon name="check" type="feather" size={20} color="white" />}
          containerStyle={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    margin: 10,
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
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: 20,
  },
}); 