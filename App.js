import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeWindStyleSheet } from 'nativewind';
import { initDatabase } from './src/services/database';
import { startAutoSync } from './src/services/sync';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import BillingScreen from './src/screens/BillingScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import SalaryScreen from './src/screens/SalaryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

NativeWindStyleSheet.setOutput({ default: 'native' });

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setInitialRoute('Dashboard');
          startAutoSync();
        }
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  if (!isReady) return null;

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Billing" component={BillingScreen} />
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
          <Stack.Screen name="Salary" component={SalaryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
