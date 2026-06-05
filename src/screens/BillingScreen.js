import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Modal, StyleSheet
} from 'react-native';
import { getProducts, getCompanySettings, saveCompanySettings, saveOfflineBill } from '../services/database';
import { apiCall, isOnline } from '../services/api';
import { generateBillPDF, shareBillPDF } from '../services/pdfGenerator';

export default function BillingScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(false);
  const [company, setCompany] = useState({
    company_name: '', company_name_ar: '', address: '', address_ar: '',
    city: '', city_ar: '', phone: '', email: '',
    vat_number: '', cr_number: '', tax_percentage: 15
  });
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [prods, settings, net] = await Promise.all([
      getProducts(), getCompanySettings(), isOnline()
    ]);
    if (prods?.length) setProducts(prods);
    if (settings) setCompany(settings);
    setOnline(net);

    if (net) {
      try {
        const r = await apiCall('products', 'GET');
        if (r?.success && r.data?.length) setProducts(r.data);
        const cs = await apiCall('company_settings', 'GET');
        if (cs?.success && cs.data) {
          setCompany(cs.data);
          await saveCompanySettings(cs.data);
        }
      } catch (_) {}
    }
  };

  const addProduct = (p) => {
    const ex = selected.find(x => x.id === p.id);
    if (ex) {
      setSelected(selected.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
    } else {
      setSelected([...selected, { ...p, qty: 1, rate: p.price }]);
    }
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setSelected(selected.filter(x => x.id !== id));
    else setSelected(selected.map(x => x.id === id ? { ...x, qty } : x));
  };

  const totals = () => {
    const sub = selected.reduce((s, p) => s + p.qty * p.rate, 0);
    const tax = (sub * (company?.tax_percentage || 15)) / 100;
    return { sub, tax, total: sub + tax };
  };

  const openEdit = () => { setEditData({ ...company }); setShowEdit(true); };

  const saveEdit = async () => {
    const updated = { ...editData, tax_percentage: parseFloat(editData.tax_percentage) || 15 };
    await saveCompanySettings(updated);
    setCompany(updated);
    setShowEdit(false);
    if (online) {
      try { await apiCall('company_settings', 'POST', updated); } catch (_) {}
    }
    Alert.alert('Saved', 'Company details updated');
  };

  const generateBill = async () => {
    if (!customerName.trim()) return Alert.alert('Error', 'Enter customer name');
    if (!selected.length) return Alert.alert('Error', 'Add at least one product');

    setLoading(true);
    try {
      const bill = { customer_name: customerName, products: selected, created_at: new Date().toISOString() };

      if (online) {
        try { await apiCall('bills', 'POST', bill); }
        catch (_) {
          await saveOfflineBill(bill);
          Alert.alert('Saved Offline', 'Will sync when online');
        }
      } else {
        await saveOfflineBill(bill);
        Alert.alert('Saved Offline', 'Will sync when online');
      }

      const pdfUri = await generateBillPDF(bill, company);
      Alert.alert('Bill Created', 'Share PDF?', [
        { text: 'No', style: 'cancel' },
        { text: 'Share', onPress: () => shareBillPDF(pdfUri) }
      ]);
      setCustomerName('');
      setSelected([]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const { sub, tax, total } = totals();

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.row}>
          <Text style={s.title}>New Bill</Text>
          <View style={s.row}>
            <View style={[s.dot, { backgroundColor: online ? '#4ade80' : '#f87171' }]} />
            <Text style={s.onlineTxt}>{online ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        {/* Company bar - tap to edit */}
        <TouchableOpacity onPress={openEdit} style={s.companyBar}>
          <View>
            <Text style={s.companyName}>{company.company_name || 'Tap to set company name'}</Text>
            {!!company.vat_number && <Text style={s.companyMeta}>VAT: {company.vat_number}</Text>}
          </View>
          <Text style={s.editIcon}>✏️ Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Customer */}
        <View style={s.card}>
          <Text style={s.label}>Customer Name</Text>
          <TextInput style={s.input} placeholder="Enter customer name" value={customerName} onChangeText={setCustomerName} />
        </View>

        {/* Products list */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Products {!online && '(Offline)'}</Text>
          {!products.length ? (
            <Text style={s.empty}>No products. Go online to fetch.</Text>
          ) : products.map(p => (
            <TouchableOpacity key={p.id} onPress={() => addProduct(p)} style={s.productRow}>
              <View>
                <Text style={s.productName}>{p.name}</Text>
                <Text style={s.meta}>Stock: {p.stock}</Text>
              </View>
              <Text style={s.price}>{p.price} SAR</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected items */}
        {!!selected.length && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Selected Items</Text>
            {selected.map(p => (
              <View key={p.id} style={s.selectedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.productName}>{p.name}</Text>
                  <Text style={s.meta}>{p.rate} × {p.qty} = {(p.rate * p.qty).toFixed(2)} SAR</Text>
                </View>
                <View style={s.qtyRow}>
                  <TouchableOpacity onPress={() => updateQty(p.id, p.qty - 1)} style={s.btnRed}>
                    <Text style={s.btnTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qtyNum}>{p.qty}</Text>
                  <TouchableOpacity onPress={() => updateQty(p.id, p.qty + 1)} style={s.btnGreen}>
                    <Text style={s.btnTxt}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={s.totalsBox}>
              <View style={s.totalRow}><Text style={s.totalLbl}>Subtotal</Text><Text style={s.totalVal}>{sub.toFixed(2)} SAR</Text></View>
              <View style={s.totalRow}><Text style={s.totalLbl}>VAT ({company.tax_percentage || 15}%)</Text><Text style={s.totalVal}>{tax.toFixed(2)} SAR</Text></View>
              <View style={s.totalRow}><Text style={s.grandLbl}>Total</Text><Text style={s.grandVal}>{total.toFixed(2)} SAR</Text></View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity onPress={generateBill} disabled={loading} style={s.genBtn}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.genBtnTxt}>Generate Bill & PDF</Text>}
        </TouchableOpacity>
      </View>

      {/* Company Edit Modal */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Edit Company Details</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                ['Company Name', 'company_name'],
                ['Company Name (Arabic)', 'company_name_ar'],
                ['Address', 'address'],
                ['Address (Arabic)', 'address_ar'],
                ['City', 'city'],
                ['City (Arabic)', 'city_ar'],
                ['Phone', 'phone'],
                ['Email', 'email'],
                ['VAT Number', 'vat_number'],
                ['CR Number', 'cr_number'],
                ['Tax %', 'tax_percentage'],
              ].map(([lbl, key]) => (
                <View key={key} style={{ marginBottom: 12 }}>
                  <Text style={s.label}>{lbl}</Text>
                  <TextInput
                    style={s.input}
                    value={String(editData[key] ?? '')}
                    onChangeText={v => setEditData({ ...editData, [key]: v })}
                    keyboardType={key === 'tax_percentage' ? 'decimal-pad' : key === 'phone' ? 'phone-pad' : 'default'}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={s.modalBtns}>
              <TouchableOpacity onPress={() => setShowEdit(false)} style={s.cancelBtn}>
                <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={s.saveBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#9333ea', padding: 16, paddingTop: 48 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  onlineTxt: { color: '#fff', fontSize: 13 },
  companyBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: 10 },
  companyName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  companyMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  editIcon: { color: '#fff', fontSize: 13 },
  scroll: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: '#f9fafb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { color: '#1f2937', fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  empty: { color: '#9ca3af', textAlign: 'center', paddingVertical: 20 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  productName: { color: '#1f2937', fontWeight: '600', fontSize: 15 },
  meta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  price: { color: '#9333ea', fontWeight: 'bold', fontSize: 15 },
  selectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  btnRed: { backgroundColor: '#ef4444', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnGreen: { backgroundColor: '#22c55e', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 18, lineHeight: 22 },
  qtyNum: { marginHorizontal: 12, fontWeight: 'bold', fontSize: 16, minWidth: 20, textAlign: 'center' },
  totalsBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLbl: { color: '#6b7280', fontSize: 14 },
  totalVal: { color: '#1f2937', fontWeight: '600', fontSize: 14 },
  grandLbl: { color: '#1f2937', fontWeight: 'bold', fontSize: 17 },
  grandVal: { color: '#9333ea', fontWeight: 'bold', fontSize: 17 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  genBtn: { backgroundColor: '#9333ea', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  genBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', marginTop: 16, gap: 10 },
  cancelBtn: { flex: 1, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10 },
  saveBtn: { flex: 1, padding: 14, alignItems: 'center', backgroundColor: '#9333ea', borderRadius: 10 },
});
