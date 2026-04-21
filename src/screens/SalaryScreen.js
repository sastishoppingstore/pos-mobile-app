import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { apiCall, isOnline } from '../services/api';

export default function SalaryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [salary, setSalary] = useState(0);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadSalaryData();
  }, []);

  const loadSalaryData = async () => {
    try {
      const online = await isOnline();
      if (!online) {
        Alert.alert('Offline', 'Please connect to internet to view salary information');
        setLoading(false);
        return;
      }

      const result = await apiCall('salary', 'GET');
      if (result.success) {
        setSalary(result.salary);
        setPayments(result.payments);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-purple-600 p-4">
        <Text className="text-white text-2xl font-bold">Salary Information</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-6 mb-4 shadow-2xl">
          <Text className="text-white text-sm mb-2">Monthly Salary</Text>
          <Text className="text-white text-4xl font-bold">{salary.toFixed(2)} SAR</Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-md">
          <Text className="text-gray-700 font-bold text-lg mb-4">Payment History</Text>
          
          {payments.length === 0 ? (
            <Text className="text-gray-500 text-center py-8">No payment history</Text>
          ) : (
            payments.map((payment, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center py-4 border-b border-gray-200"
              >
                <View>
                  <Text className="text-gray-800 font-semibold">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {payment.month} • {payment.payment_method}
                  </Text>
                  {payment.notes && (
                    <Text className="text-gray-400 text-xs mt-1">{payment.notes}</Text>
                  )}
                </View>
                <Text className="text-green-600 font-bold text-lg">
                  {parseFloat(payment.amount).toFixed(2)} SAR
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
