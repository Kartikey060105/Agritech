import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Input,
  ListItem,
  Icon,
} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function ManageBidsScreen({ route, navigation }) {
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState({
    price: '',
    notes: '',
    images: [],
  });

  const { orderId } = route.params;

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('order_id', orderId);
      
      if (error) throw error;
      setBids(data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewBid(prev => ({
        ...prev,
        images: [...prev.images, ...result.assets.map(asset => asset.uri)]
      }));
    }
  };

  const submitBid = async () => {
    try {
      // Upload images to Supabase storage
      const imageUrls = await Promise.all(
        newBid.images.map(async (uri) => {
          const filename = uri.split('/').pop();
          const response = await fetch(uri);
          const blob = await response.blob();
          
          const { data, error } = await supabase.storage
            .from('bid-images')
            .upload(`${Date.now()}-${filename}`, blob);

          if (error) throw error;
          return data.path;
        })
      );

      // Create bid record
      const { data, error } = await supabase
        .from('bids')
        .insert([{
          order_id: orderId,
          price: parseFloat(newBid.price),
          notes: newBid.notes,
          images: imageUrls,
          status: 'pending'
        }]);

      if (error) throw error;

      // Reset form and refresh bids
      setNewBid({ price: '', notes: '', images: [] });
      fetchBids();
    } catch (error) {
      console.error('Error submitting bid:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title>Submit New Bid</Card.Title>
        <Input
          label="Price Quote"
          keyboardType="numeric"
          value={newBid.price}
          onChangeText={(value) => setNewBid(prev => ({ ...prev, price: value }))}
          placeholder="Enter price per unit"
        />
        
        <Input
          label="Additional Notes"
          multiline
          value={newBid.notes}
          onChangeText={(value) => setNewBid(prev => ({ ...prev, notes: value }))}
          placeholder="Add quality details or notes"
        />

        <Button
          icon={<Icon name="image" type="feather" color="white" />}
          title="Upload Images"
          onPress={pickImage}
          containerStyle={styles.buttonContainer}
        />

        {newBid.images.length > 0 && (
          <ScrollView horizontal style={styles.imagePreview}>
            {newBid.images.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.previewImage}
              />
            ))}
          </ScrollView>
        )}

        <Button
          title="Submit Bid"
          onPress={submitBid}
          containerStyle={styles.buttonContainer}
        />
      </Card>

      <Card>
        <Card.Title>Your Bids</Card.Title>
        {bids.map((bid, index) => (
          <ListItem key={index} bottomDivider>
            <ListItem.Content>
              <ListItem.Title>₹{bid.price}</ListItem.Title>
              <ListItem.Subtitle>{bid.notes}</ListItem.Subtitle>
              <Text style={styles.status}>{bid.status}</Text>
            </ListItem.Content>
            <Button
              title="View Details"
              type="clear"
              onPress={() => navigation.navigate('BidDetails', { bid })}
            />
          </ListItem>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  imagePreview: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  status: {
    marginTop: 5,
    color: '#666',
    textTransform: 'capitalize',
  },
}); 