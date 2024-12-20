import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Input,
  Button,
  ListItem,
  Avatar,
  Text,
} from 'react-native-elements';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function ChatScreen({ route }) {
  const { orderId, otherUserId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(full_name, avatar_url),
          receiver:receiver_id(full_name, avatar_url)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: otherUserId,
          order_id: orderId,
          content: newMessage.trim(),
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd()}
        style={styles.messagesContainer}
      >
        {messages.map((message, index) => (
          <ListItem
            key={index}
            containerStyle={[
              styles.messageItem,
              message.sender_id === user.id ? styles.sentMessage : styles.receivedMessage
            ]}
          >
            <Avatar
              rounded
              source={{ uri: message.sender.avatar_url }}
              size="small"
            />
            <ListItem.Content>
              <Text style={styles.senderName}>{message.sender.full_name}</Text>
              <ListItem.Title>{message.content}</ListItem.Title>
              <Text style={styles.timestamp}>
                {new Date(message.created_at).toLocaleTimeString()}
              </Text>
            </ListItem.Content>
          </ListItem>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          containerStyle={styles.input}
        />
        <Button
          icon={{ name: 'send', color: 'white' }}
          onPress={sendMessage}
          containerStyle={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageItem: {
    marginVertical: 5,
    borderRadius: 10,
  },
  sentMessage: {
    backgroundColor: '#DCF8C6',
    marginLeft: 40,
  },
  receivedMessage: {
    backgroundColor: 'white',
    marginRight: 40,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    width: 50,
  },
}); 