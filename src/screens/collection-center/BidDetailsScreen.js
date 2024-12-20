import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Icon,
  ListItem,
  Divider,
  Badge,
} from 'react-native-elements';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function BidDetailsScreen({ route, navigation }) {
  const { bid } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id(full_name, email)
        `)
        .eq('id', bid.order_id)
        .single();

      if (error) throw error;
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBid = () => {
    navigation.navigate('UpdateBid', { bid, orderDetails });
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      orderId: bid.order_id,
      otherUserId: orderDetails.buyer_id,
    });
  };

  if (loading || !orderDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Bid Details</Text>
          <Badge
            value={bid.status}
            badgeStyle={{
              backgroundColor: bid.status === 'accepted' ? '#4CAF50' : '#FFC107'
            }}
          />
        </View>

        <Divider style={styles.divider} />

        <ListItem containerStyle={styles.listItem}>
          <Icon name="dollar-sign" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Price Quote</ListItem.Title>
            <ListItem.Subtitle>₹{bid.price} per kg</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="file-text" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Notes</ListItem.Title>
            <ListItem.Subtitle>{bid.notes}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="calendar" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Submitted On</ListItem.Title>
            <ListItem.Subtitle>
              {format(new Date(bid.created_at), 'MMM dd, yyyy HH:mm')}
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        {bid.images && bid.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.imagesTitle}>Product Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bid.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: `${supabase.storageUrl}/bid-images/${image}` }}
                  style={styles.image}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Order Information</Text>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="user" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Buyer</ListItem.Title>
            <ListItem.Subtitle>{orderDetails.buyer.full_name}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="package" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Quantity Required</ListItem.Title>
            <ListItem.Subtitle>{orderDetails.quantity} kg</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="map-pin" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Delivery Location</ListItem.Title>
            <ListItem.Subtitle>{orderDetails.delivery_location}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <View style={styles.buttonContainer}>
          <Button
            title="Update Bid"
            icon={
              <Icon
                name="edit"
                type="feather"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
            onPress={handleUpdateBid}
            containerStyle={[styles.button, { marginRight: 10 }]}
          />
          <Button
            title="Chat with Buyer"
            icon={
              <Icon
                name="message-circle"
                type="feather"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
            onPress={handleChat}
            containerStyle={styles.button}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 10,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    marginVertical: 15,
  },
  listItem: {
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  imagesContainer: {
    marginVertical: 15,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 10,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
}); 