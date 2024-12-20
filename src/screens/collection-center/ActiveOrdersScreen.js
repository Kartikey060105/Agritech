import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Icon,
  ListItem,
  Badge,
} from 'react-native-elements';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function ActiveOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id(full_name),
          bids!inner(id, collection_center_id, status)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter orders where the collection center hasn't placed a bid yet
      const filteredOrders = data.filter(order => 
        !order.bids.some(bid => bid.collection_center_id === user.id)
      );

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {orders.map((order, index) => (
        <Card key={index} containerStyle={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.orderNumber}>Order #{order.id.slice(0, 8)}</Text>
              <Text style={styles.buyer}>by {order.buyer.full_name}</Text>
            </View>
            <Badge
              value={order.status}
              badgeStyle={{ backgroundColor: getStatusColor(order.status) }}
              textStyle={styles.badgeText}
            />
          </View>

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

          <Button
            title="Place Bid"
            icon={
              <Icon
                name="dollar-sign"
                type="feather"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
            onPress={() => navigation.navigate('ManageBids', { orderId: order.id })}
            containerStyle={styles.buttonContainer}
          />
        </Card>
      ))}

      {orders.length === 0 && (
        <View style={styles.emptyState}>
          <Icon
            name="inbox"
            type="feather"
            size={50}
            color="#666"
          />
          <Text style={styles.emptyText}>No active orders available</Text>
        </View>
      )}
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
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buyer: {
    fontSize: 14,
    color: '#666',
  },
  badgeText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  listItem: {
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    marginTop: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
}); 