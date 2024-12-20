import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  ListItem,
  Avatar,
  Text,
  Icon,
  Badge,
} from 'react-native-elements';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      // Fetch all orders where the user is involved
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          buyer_id,
          status,
          quantity,
          delivery_location,
          buyer:buyer_id(full_name, avatar_url),
          bids!inner(
            id,
            collection_center_id,
            price,
            collection_center:collection_center_id(full_name, avatar_url)
          )
        `)
        .or(`buyer_id.eq.${user.id},bids.collection_center_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get latest messages for each order
      const chatsWithMessages = await Promise.all(
        orders.map(async (order) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const otherUser = user.id === order.buyer_id
            ? order.bids[0].collection_center
            : order.buyer;

          return {
            orderId: order.id,
            otherUser,
            lastMessage: messages?.[0],
            orderDetails: {
              status: order.status,
              quantity: order.quantity,
              location: order.delivery_location,
            },
          };
        })
      );

      setChats(chatsWithMessages);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <ListItem
      onPress={() => navigation.navigate('Chat', {
        orderId: item.orderId,
        otherUserId: item.otherUser.id,
      })}
      bottomDivider
      containerStyle={styles.listItem}
    >
      <Avatar
        rounded
        source={{ uri: item.otherUser.avatar_url }}
        size="medium"
        title={item.otherUser.full_name.charAt(0)}
      />
      <ListItem.Content>
        <View style={styles.headerContainer}>
          <ListItem.Title style={styles.userName}>
            {item.otherUser.full_name}
          </ListItem.Title>
          {item.lastMessage && (
            <Text style={styles.timestamp}>
              {format(new Date(item.lastMessage.created_at), 'MMM dd, HH:mm')}
            </Text>
          )}
        </View>
        <View style={styles.messageContainer}>
          <ListItem.Subtitle numberOfLines={1} style={styles.lastMessage}>
            {item.lastMessage?.content || 'No messages yet'}
          </ListItem.Subtitle>
          <Badge
            value={item.orderDetails.status}
            badgeStyle={[
              styles.badge,
              { backgroundColor: getStatusColor(item.orderDetails.status) }
            ]}
            textStyle={styles.badgeText}
          />
        </View>
        <Text style={styles.orderDetails}>
          Order: {item.orderDetails.quantity}kg • {item.orderDetails.location}
        </Text>
      </ListItem.Content>
      <Icon name="chevron-right" type="feather" color="#ccc" />
    </ListItem>
  );

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
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.orderId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon
              name="message-circle"
              type="feather"
              size={50}
              color="#ccc"
            />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listItem: {
    paddingVertical: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    flex: 1,
    color: '#666',
    marginRight: 8,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  orderDetails: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
}); 