import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOnline } from '../services/api';
import { syncOfflineData, fetchLatestData } from '../services/sync';
import { getUnsyncedBills, getUnsyncedAttendance } from '../services/database';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    loadUser();
    checkOnlineStatus();
    checkUnsyncedData();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const checkOnlineStatus = async () => {
    const status = await isOnline();
    setOnline(status);
  };

  const checkUnsyncedData = async () => {
    const bills = await getUnsyncedBills();
    const attendance = await getUnsyncedAttendance();
    setUnsyncedCount(bills.length + attendance.length);
  };

  const handleSync = async () => {
    const syncResult = await syncOfflineData();
    const fetchResult = await fetchLatestData();
    
    Alert.alert(
      'Sync Complete',
      `${syncResult.message}\n${fetchResult.message}`
    );
    
    checkUnsyncedData();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 pb-12">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Welcome!</Text>
            <Text className="text-white text-lg">{user?.full_name || user?.username}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} className="bg-white/20 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row items-center">
          <View className={`w-3 h-3 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'} mr-2`} />
          <Text className="text-white">{online ? 'Online' : 'Offline'}</Text>
          {unsyncedCount > 0 && (
            <Text className="text-yellow-300 ml-4">
              {unsyncedCount} items pending sync
            </Text>
          )}
        </View>
      </View>

      <View className="px-4 -mt-8">
        {online && unsyncedCount > 0 && (
          <TouchableOpacity
            onPress={handleSync}
            className="bg-yellow-500 rounded-xl p-4 mb-4 shadow-lg"
          >
            <Text className="text-white text-center font-bold">
              🔄 Sync Now ({unsyncedCount} items)
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate('Billing')}
            className="bg-white rounded-xl p-6 mb-4 shadow-md w-[48%]"
          >
            <Text className="text-4xl mb-2">📝</Text>
            <Text className="text-gray-800 font-bold text-lg">New Bill</Text>
            <Text className="text-gray-500 text-sm">Create invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Attendance')}
            className="bg-white rounded-xl p-6 mb-4 shadow-md w-[48%]"
          >
            <Text className="text-4xl mb-2">✅</Text>
            <Text className="text-gray-800 font-bold text-lg">Attendance</Text>
            <Text className="text-gray-500 text-sm">Mark present</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Salary')}
            className="bg-white rounded-xl p-6 mb-4 shadow-md w-[48%]"
          >
            <Text className="text-4xl mb-2">💰</Text>
            <Text className="text-gray-800 font-bold text-lg">Salary</Text>
            <Text className="text-gray-500 text-sm">View payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            className="bg-white rounded-xl p-6 mb-4 shadow-md w-[48%]"
          >
            <Text className="text-4xl mb-2">⚙️</Text>
            <Text className="text-gray-800 font-bold text-lg">Settings</Text>
            <Text className="text-gray-500 text-sm">Company info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
