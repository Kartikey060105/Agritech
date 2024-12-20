import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaceOrderScreen from './src/screens/buyer/PlaceOrderScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="PlaceOrder" component={PlaceOrderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
} 