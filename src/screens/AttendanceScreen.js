import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { saveOfflineAttendance } from '../services/database';
import { apiCall, isOnline } from '../services/api';

export default function AttendanceScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const markAttendance = async (status) => {
    setLoading(true);
    try {
      const now = new Date();
      const attendanceData = {
        date: now.toISOString().split('T')[0],
        status: status,
        check_in: status === 'present' ? now.toTimeString().split(' ')[0] : null,
        check_out: null
      };

      const online = await isOnline();

      if (online) {
        try {
          await apiCall('attendance', 'POST', attendanceData);
          Alert.alert('Success', `Marked as ${status}`);
        } catch (error) {
          await saveOfflineAttendance(attendanceData);
          Alert.alert('Saved Offline', 'Attendance saved locally and will sync when online');
        }
      } else {
        await saveOfflineAttendance(attendanceData);
        Alert.alert('Saved Offline', 'Attendance saved locally and will sync when online');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-purple-600 p-4">
        <Text className="text-white text-2xl font-bold">Mark Attendance</Text>
      </View>

      <View className="flex-1 justify-center px-6">
        <View className="bg-white rounded-3xl p-8 shadow-2xl">
          <Text className="text-center text-gray-700 text-lg mb-8">
            Mark your attendance for today
          </Text>

          <TouchableOpacity
            onPress={() => markAttendance('present')}
            disabled={loading}
            className="bg-green-500 rounded-xl py-4 mb-4 shadow-lg"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="items-center">
                <Text className="text-white text-4xl mb-2">✅</Text>
                <Text className="text-white font-bold text-lg">Present</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => markAttendance('absent')}
            disabled={loading}
            className="bg-red-500 rounded-xl py-4 mb-4 shadow-lg"
          >
            <View className="items-center">
              <Text className="text-white text-4xl mb-2">❌</Text>
              <Text className="text-white font-bold text-lg">Absent</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => markAttendance('half_day')}
            disabled={loading}
            className="bg-yellow-500 rounded-xl py-4 mb-4 shadow-lg"
          >
            <View className="items-center">
              <Text className="text-white text-4xl mb-2">⏰</Text>
              <Text className="text-white font-bold text-lg">Half Day</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => markAttendance('leave')}
            disabled={loading}
            className="bg-blue-500 rounded-xl py-4 shadow-lg"
          >
            <View className="items-center">
              <Text className="text-white text-4xl mb-2">🏖️</Text>
              <Text className="text-white font-bold text-lg">Leave</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
