import * as SQLite from 'expo-sqlite';

// expo-sqlite v14 - new API
const db = SQLite.openDatabaseSync('pos_offline.db');

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY, company_name TEXT, company_name_ar TEXT,
      address TEXT, address_ar TEXT, city TEXT, city_ar TEXT,
      phone TEXT, email TEXT, vat_number TEXT, cr_number TEXT,
      tax_percentage REAL, updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER
    );
    CREATE TABLE IF NOT EXISTS offline_bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT, customer_name TEXT,
      products TEXT, created_at TEXT, synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS offline_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, status TEXT,
      check_in TEXT, check_out TEXT, synced INTEGER DEFAULT 0
    );
  `);
};

export const saveCompanySettings = async (settings) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO company_settings
    (id, company_name, company_name_ar, address, address_ar, city, city_ar,
     phone, email, vat_number, cr_number, tax_percentage, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [settings.company_name, settings.company_name_ar, settings.address,
     settings.address_ar, settings.city, settings.city_ar, settings.phone,
     settings.email, settings.vat_number, settings.cr_number,
     settings.tax_percentage, new Date().toISOString()]
  );
};

export const getCompanySettings = async () => {
  return await db.getFirstAsync('SELECT * FROM company_settings WHERE id = 1');
};

export const saveProducts = async (products) => {
  await db.runAsync('DELETE FROM products');
  for (const p of products) {
    await db.runAsync(
      'INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)',
      [p.id, p.name, p.price, p.stock]
    );
  }
};

export const getProducts = async () => {
  return await db.getAllAsync('SELECT * FROM products');
};

export const saveOfflineBill = async (bill) => {
  const r = await db.runAsync(
    'INSERT INTO offline_bills (customer_name, products, created_at) VALUES (?, ?, ?)',
    [bill.customer_name, JSON.stringify(bill.products), bill.created_at]
  );
  return r.lastInsertRowId;
};

export const getUnsyncedBills = async () => {
  return await db.getAllAsync('SELECT * FROM offline_bills WHERE synced = 0');
};

export const markBillsSynced = async (ids) => {
  for (const id of ids) {
    await db.runAsync('UPDATE offline_bills SET synced = 1 WHERE id = ?', [id]);
  }
};

export const saveOfflineAttendance = async (attendance) => {
  const r = await db.runAsync(
    'INSERT INTO offline_attendance (date, status, check_in, check_out) VALUES (?, ?, ?, ?)',
    [attendance.date, attendance.status, attendance.check_in, attendance.check_out]
  );
  return r.lastInsertRowId;
};

export const getUnsyncedAttendance = async () => {
  return await db.getAllAsync('SELECT * FROM offline_attendance WHERE synced = 0');
};

export const markAttendanceSynced = async (ids) => {
  for (const id of ids) {
    await db.runAsync('UPDATE offline_attendance SET synced = 1 WHERE id = ?', [id]);
  }
};

export default db;
