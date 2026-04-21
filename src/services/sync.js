import { apiCall, isOnline } from './api';
import {
  getUnsyncedBills,
  getUnsyncedAttendance,
  markBillsSynced,
  markAttendanceSynced,
  saveCompanySettings,
  saveProducts
} from './database';

// Sync offline data to server
export const syncOfflineData = async () => {
  try {
    const online = await isOnline();
    if (!online) {
      return { success: false, message: 'No internet connection' };
    }

    const bills = await getUnsyncedBills();
    const attendance = await getUnsyncedAttendance();

    if (bills.length === 0 && attendance.length === 0) {
      return { success: true, message: 'Nothing to sync' };
    }

    // Prepare data for sync
    const syncData = {
      bills: bills.map(b => ({
        customer_name: b.customer_name,
        products: JSON.parse(b.products),
        created_at: b.created_at
      })),
      attendance: attendance.map(a => ({
        date: a.date,
        status: a.status,
        check_in: a.check_in,
        check_out: a.check_out
      }))
    };

    // Send to server
    const result = await apiCall('sync', 'POST', syncData);

    if (result.success) {
      // Mark as synced
      await markBillsSynced(bills.map(b => b.id));
      await markAttendanceSynced(attendance.map(a => a.id));

      return {
        success: true,
        message: `Synced ${result.synced.bills} bills and ${result.synced.attendance} attendance records`
      };
    }

    return { success: false, message: 'Sync failed' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Fetch latest data from server
export const fetchLatestData = async () => {
  try {
    const online = await isOnline();
    if (!online) {
      return { success: false, message: 'No internet connection' };
    }

    // Fetch company settings
    const settingsResult = await apiCall('company_settings', 'GET');
    if (settingsResult.success && settingsResult.data) {
      await saveCompanySettings(settingsResult.data);
    }

    // Fetch products
    const productsResult = await apiCall('products', 'GET');
    if (productsResult.success && productsResult.data) {
      await saveProducts(productsResult.data);
    }

    return { success: true, message: 'Data updated successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Auto-sync when online
export const startAutoSync = (callback) => {
  const interval = setInterval(async () => {
    const online = await isOnline();
    if (online) {
      const syncResult = await syncOfflineData();
      const fetchResult = await fetchLatestData();
      
      if (callback) {
        callback({ sync: syncResult, fetch: fetchResult });
      }
    }
  }, 60000); // Every 1 minute

  return () => clearInterval(interval);
};
