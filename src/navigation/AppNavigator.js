import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { useAuth } from '../hooks/useAuth';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Buyer Screens
import BuyerDashboard from '../screens/buyer/BuyerDashboard';
import PlaceOrderScreen from '../screens/buyer/PlaceOrderScreen';
import OrderDetailsScreen from '../screens/buyer/OrderDetailsScreen';

// Collection Center Screens
import CenterDashboard from '../screens/collection-center/CenterDashboard';
import ManageBidsScreen from '../screens/collection-center/ManageBidsScreen';
import BidDetailsScreen from '../screens/collection-center/BidDetailsScreen';

// Common Screens
import ChatListScreen from '../screens/ChatScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Orders':
              iconName = 'shopping-bag';
              break;
            case 'Chat':
              iconName = 'message-circle';
              break;
            case 'Profile':
              iconName = 'user';
              break;
          }
          return <Icon name={iconName} type="feather" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={BuyerDashboard} />
      <Tab.Screen name="Orders" component={PlaceOrderScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function CenterTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
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
          return <Icon name={iconName} type="feather" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={CenterDashboard} />
      <Tab.Screen name="Bids" component={ManageBidsScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen 
            name="Main" 
            component={userType === 'buyer' ? BuyerTabs : CenterTabs} 
          />
          <Stack.Screen 
            name="OrderDetails" 
            component={OrderDetailsScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="BidDetails" 
            component={BidDetailsScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ headerShown: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
} 