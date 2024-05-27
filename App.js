import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native';

import HomeScreen from './Component/HomeScreen';
import ItemScreen from './Component/ItemScreen';
import DashboardScreen from './Component/DashboardScreen';
import Navbar from './Component/Navbar';
import BillScreen from './Component/BillScreen';

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
    
       
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Item"
            component={ItemScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="BillScreen"
            component={BillScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
     
    </NavigationContainer>
  );
}
