import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { getCompanySettings, saveCompanySettings } from '../services/database';
import { apiCall, isOnline } from '../services/api';

export default function SettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company_name: '',
    company_name_ar: '',
    address: '',
    address_ar: '',
    city: '',
    city_ar: '',
    phone: '',
    email: '',
    vat_number: '',
    cr_number: '',
    tax_percentage: '15'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getCompanySettings();
    if (data) {
      setSettings({
        company_name: data.company_name || '',
        company_name_ar: data.company_name_ar || '',
        address: data.address || '',
        address_ar: data.address_ar || '',
        city: data.city || '',
        city_ar: data.city_ar || '',
        phone: data.phone || '',
        email: data.email || '',
        vat_number: data.vat_number || '',
        cr_number: data.cr_number || '',
        tax_percentage: String(data.tax_percentage || 15)
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save locally first
      await saveCompanySettings({
        ...settings,
        tax_percentage: parseFloat(settings.tax_percentage)
      });

      // Try to sync online
      const online = await isOnline();
      if (online) {
        try {
          await apiCall('company_settings', 'POST', {
            ...settings,
            tax_percentage: parseFloat(settings.tax_percentage)
          });
          Alert.alert('Success', 'Settings saved and synced online');
        } catch (error) {
          Alert.alert('Saved Offline', 'Settings saved locally. Will sync when online.');
        }
      } else {
        Alert.alert('Saved Offline', 'Settings saved locally. Will sync when online.');
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
        <Text className="text-white text-2xl font-bold">Company Settings</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
          <Text className="text-gray-700 font-bold mb-4 text-lg">English Information</Text>
          
          <Text className="text-gray-600 mb-2">Company Name</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.company_name}
            onChangeText={(text) => setSettings({ ...settings, company_name: text })}
          />

          <Text className="text-gray-600 mb-2">Address</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.address}
            onChangeText={(text) => setSettings({ ...settings, address: text })}
          />

          <Text className="text-gray-600 mb-2">City</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.city}
            onChangeText={(text) => setSettings({ ...settings, city: text })}
          />
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
          <Text className="text-gray-700 font-bold mb-4 text-lg">المعلومات بالعربية</Text>
          
          <Text className="text-gray-600 mb-2">اسم الشركة</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.company_name_ar}
            onChangeText={(text) => setSettings({ ...settings, company_name_ar: text })}
          />

          <Text className="text-gray-600 mb-2">العنوان</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.address_ar}
            onChangeText={(text) => setSettings({ ...settings, address_ar: text })}
          />

          <Text className="text-gray-600 mb-2">المدينة</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.city_ar}
            onChangeText={(text) => setSettings({ ...settings, city_ar: text })}
          />
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
          <Text className="text-gray-700 font-bold mb-4 text-lg">Contact & Tax Info</Text>
          
          <Text className="text-gray-600 mb-2">Phone</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.phone}
            onChangeText={(text) => setSettings({ ...settings, phone: text })}
            keyboardType="phone-pad"
          />

          <Text className="text-gray-600 mb-2">Email</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.email}
            onChangeText={(text) => setSettings({ ...settings, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text className="text-gray-600 mb-2">VAT Number</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.vat_number}
            onChangeText={(text) => setSettings({ ...settings, vat_number: text })}
          />

          <Text className="text-gray-600 mb-2">CR Number</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.cr_number}
            onChangeText={(text) => setSettings({ ...settings, cr_number: text })}
          />

          <Text className="text-gray-600 mb-2">Tax Percentage (%)</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-4"
            value={settings.tax_percentage}
            onChangeText={(text) => setSettings({ ...settings, tax_percentage: text })}
            keyboardType="decimal-pad"
          />
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-purple-600 rounded-xl py-4 shadow-lg"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
