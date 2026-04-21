import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall('login', 'POST', { username, password });
      
      if (result.success) {
        await AsyncStorage.setItem('token', result.token);
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-purple-600 to-blue-600 justify-center px-6">
      <View className="bg-white rounded-3xl p-8 shadow-2xl">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-2">POS Mobile</Text>
        <Text className="text-center text-gray-500 mb-8">Sign in to continue</Text>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">Username</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-semibold">Password</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-purple-600 rounded-xl py-4 shadow-lg"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>

        <Text className="text-center text-gray-500 mt-6 text-sm">
          Default: owner / password123
        </Text>
      </View>
    </View>
  );
}
