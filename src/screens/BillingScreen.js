import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { getProducts, getCompanySettings, saveOfflineBill } from '../services/database';
import { apiCall, isOnline } from '../services/api';
import { generateBillPDF, shareBillPDF } from '../services/pdfGenerator';

export default function BillingScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prods = await getProducts();
    const settings = await getCompanySettings();
    setProducts(prods);
    setCompanySettings(settings);
  };

  const addProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { ...product, qty: 1, rate: product.price }]);
    }
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    } else {
      setSelectedProducts(
        selectedProducts.map(p => (p.id === id ? { ...p, qty } : p))
      );
    }
  };

  const calculateTotal = () => {
    const subtotal = selectedProducts.reduce((sum, p) => sum + p.qty * p.rate, 0);
    const tax = (subtotal * (companySettings?.tax_percentage || 15)) / 100;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleGenerateBill = async () => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      const billData = {
        customer_name: customerName,
        products: selectedProducts,
        created_at: new Date().toISOString()
      };

      const online = await isOnline();

      if (online) {
        // Try to save online
        try {
          await apiCall('bills', 'POST', billData);
        } catch (error) {
          // If online save fails, save offline
          await saveOfflineBill(billData);
          Alert.alert('Saved Offline', 'Bill saved locally and will sync when online');
        }
      } else {
        // Save offline
        await saveOfflineBill(billData);
        Alert.alert('Saved Offline', 'Bill saved locally and will sync when online');
      }

      // Generate PDF
      const pdfUri = await generateBillPDF(billData, companySettings);
      
      Alert.alert(
        'Bill Created',
        'Do you want to share the PDF?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            onPress: async () => {
              await shareBillPDF(pdfUri);
            }
          }
        ]
      );

      // Reset form
      setCustomerName('');
      setSelectedProducts([]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-purple-600 p-4">
        <Text className="text-white text-2xl font-bold">New Bill</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
          <Text className="text-gray-700 font-semibold mb-2">Customer Name</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3"
            placeholder="Enter customer name"
            value={customerName}
            onChangeText={setCustomerName}
          />
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
          <Text className="text-gray-700 font-semibold mb-3">Select Products</Text>
          {products.map(product => (
            <TouchableOpacity
              key={product.id}
              onPress={() => addProduct(product)}
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
            >
              <View>
                <Text className="text-gray-800 font-semibold">{product.name}</Text>
                <Text className="text-gray-500 text-sm">Stock: {product.stock}</Text>
              </View>
              <Text className="text-purple-600 font-bold">{product.price} SAR</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedProducts.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
            <Text className="text-gray-700 font-semibold mb-3">Selected Items</Text>
            {selectedProducts.map(product => (
              <View key={product.id} className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold">{product.name}</Text>
                  <Text className="text-gray-500 text-sm">{product.rate} SAR × {product.qty}</Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => updateQty(product.id, product.qty - 1)}
                    className="bg-red-500 w-8 h-8 rounded-full items-center justify-center"
                  >
                    <Text className="text-white font-bold">-</Text>
                  </TouchableOpacity>
                  <Text className="mx-3 font-bold">{product.qty}</Text>
                  <TouchableOpacity
                    onPress={() => updateQty(product.id, product.qty + 1)}
                    className="bg-green-500 w-8 h-8 rounded-full items-center justify-center"
                  >
                    <Text className="text-white font-bold">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View className="mt-4 pt-4 border-t border-gray-200">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Subtotal:</Text>
                <Text className="text-gray-800 font-semibold">{subtotal.toFixed(2)} SAR</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">VAT ({companySettings?.tax_percentage || 15}%):</Text>
                <Text className="text-gray-800 font-semibold">{tax.toFixed(2)} SAR</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-800 font-bold text-lg">Total:</Text>
                <Text className="text-purple-600 font-bold text-lg">{total.toFixed(2)} SAR</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleGenerateBill}
          disabled={loading}
          className="bg-purple-600 rounded-xl py-4 shadow-lg"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">Generate Bill & PDF</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
