import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Card, Text, Icon, Button, Divider } from 'react-native-elements';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';

export default function AvailableOrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:users!buyer_id(full_name),
          bids(id, collection_center_id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out orders where the collection center has already bid
      const availableOrders = data.filter(
        order => !order.bids.some(bid => bid.collection_center_id === user.id)
      );

      setOrders(availableOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {orders.length === 0 ? (
        <Card containerStyle={styles.emptyCard}>
          <Icon
            name="inbox"
            type="feather"
            size={50}
            color="#666"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No available orders at the moment</Text>
        </Card>
      ) : (
        orders.map((order, index) => (
          <Card key={index} containerStyle={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.orderNumber}>
                  Order #{order.id.slice(0, 8)}
                </Text>
                <Text style={styles.buyer}>by {order.buyer.full_name}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{order.region}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.details}>
              <DetailItem
                icon="package"
                label="Quantity"
                value={`${order.quantity} kg`}
              />
              <DetailItem
                icon="calendar"
                label="Loading Date"
                value={format(new Date(order.loading_date), 'dd MMM yyyy')}
              />
              <DetailItem
                icon="map-pin"
                label="Delivery Location"
                value={order.delivery_location}
              />
            </View>

            {order.quality_parameters && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.sectionTitle}>Quality Parameters</Text>
                <View style={styles.qualityParams}>
                  {Object.entries(JSON.parse(order.quality_parameters)).map(([key, value]) => (
                    <Text key={key} style={styles.qualityParam}>
                      • {key}: {value}
                    </Text>
                  ))}
                </View>
              </>
            )}

            <Button
              title="Submit Bid"
              icon={
                <Icon
                  name="tag"
                  type="feather"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
              }
              onPress={() => navigation.navigate('SubmitBid', { order })}
              containerStyle={styles.button}
            />
          </Card>
        ))
      )}
    </ScrollView>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <View style={styles.detailItem}>
      <Icon name={icon} type="feather" size={16} color="#666" />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buyer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 15,
  },
  details: {
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  qualityParams: {
    marginBottom: 15,
  },
  qualityParam: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
  },
  emptyCard: {
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 