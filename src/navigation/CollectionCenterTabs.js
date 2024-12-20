import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';

import ActiveOrdersScreen from '../screens/collection-center/ActiveOrdersScreen';
import ManageBidsScreen from '../screens/collection-center/ManageBidsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function CollectionCenterTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Orders':
              iconName = 'list';
              break;
            case 'Bids':
              iconName = 'dollar-sign';
              break;
            case 'Chat':
              iconName = 'message-circle';
              break;
            case 'Profile':
              iconName = 'user';
              break;
          }

          return (
            <Icon
              name={iconName}
              type="feather"
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Orders" component={ActiveOrdersScreen} />
      <Tab.Screen name="Bids" component={ManageBidsScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
} 