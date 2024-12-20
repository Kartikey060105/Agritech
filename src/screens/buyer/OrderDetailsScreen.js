import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Icon,
  ListItem,
  Badge,
  Divider,
} from 'react-native-elements';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

export default function OrderDetailsScreen({ route, navigation }) {
  const { order } = route.params;
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          collection_center:collection_center_id(full_name, avatar_url)
        `)
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bid) => {
    try {
      // Update bid status
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bid.id);

      if (bidError) throw bidError;

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'in_progress' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      Alert.alert('Success', 'Bid accepted successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFC107';
      case 'active':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderNumber}>Order #{order.id.slice(0, 8)}</Text>
          <Badge
            value={order.status}
            badgeStyle={{ backgroundColor: getStatusColor(order.status) }}
            textStyle={styles.badgeText}
          />
        </View>

        <Divider style={styles.divider} />

        <ListItem containerStyle={styles.listItem}>
          <Icon name="package" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Quantity</ListItem.Title>
            <ListItem.Subtitle>{order.quantity} kg</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="check-circle" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Quality Parameters</ListItem.Title>
            <ListItem.Subtitle>{order.quality_parameters}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="map-pin" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Region</ListItem.Title>
            <ListItem.Subtitle>{order.region}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="calendar" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Loading Date</ListItem.Title>
            <ListItem.Subtitle>
              {format(new Date(order.loading_date), 'MMM dd, yyyy')}
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem containerStyle={styles.listItem}>
          <Icon name="truck" type="feather" size={20} color="#666" />
          <ListItem.Content>
            <ListItem.Title>Delivery Location</ListItem.Title>
            <ListItem.Subtitle>{order.delivery_location}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Bids ({bids.length})</Card.Title>
        {bids.map((bid, index) => (
          <ListItem
            key={index}
            bottomDivider
            onPress={() => navigation.navigate('BidDetails', { bid })}
          >
            <ListItem.Content>
              <View style={styles.bidHeader}>
                <Text style={styles.bidderName}>
                  {bid.collection_center.full_name}
                </Text>
                <Text style={styles.price}>₹{bid.price}/kg</Text>
              </View>
              <Text style={styles.bidTimestamp}>
                {format(new Date(bid.created_at), 'MMM dd, HH:mm')}
              </Text>
              <Text numberOfLines={2} style={styles.notes}>
                {bid.notes}
              </Text>
            </ListItem.Content>
            <Button
              title="Accept"
              type="clear"
              onPress={() => handleAcceptBid(bid)}
              disabled={order.status !== 'active'}
            />
          </ListItem>
        ))}

        {bids.length === 0 && !loading && (
          <Text style={styles.emptyText}>No bids received yet</Text>
        )}
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
    marginHorizontal: 10,
    marginVertical: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 18,
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
  badgeText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  bidTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
}); 