import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pos_offline.db');

// Initialize database tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Company settings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS company_settings (
          id INTEGER PRIMARY KEY,
          company_name TEXT,
          company_name_ar TEXT,
          address TEXT,
          address_ar TEXT,
          city TEXT,
          city_ar TEXT,
          phone TEXT,
          email TEXT,
          vat_number TEXT,
          cr_number TEXT,
          tax_percentage REAL,
          updated_at TEXT
        );`
      );

      // Products table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY,
          name TEXT,
          price REAL,
          stock INTEGER
        );`
      );

      // Offline bills queue
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS offline_bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT,
          products TEXT,
          created_at TEXT,
          synced INTEGER DEFAULT 0
        );`
      );

      // Offline attendance queue
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS offline_attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          status TEXT,
          check_in TEXT,
          check_out TEXT,
          synced INTEGER DEFAULT 0
        );`
      );
    }, reject, resolve);
  });
};

// Company Settings
export const saveCompanySettings = (settings) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO company_settings 
        (id, company_name, company_name_ar, address, address_ar, city, city_ar, phone, email, vat_number, cr_number, tax_percentage, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          settings.company_name,
          settings.company_name_ar,
          settings.address,
          settings.address_ar,
          settings.city,
          settings.city_ar,
          settings.phone,
          settings.email,
          settings.vat_number,
          settings.cr_number,
          settings.tax_percentage,
          new Date().toISOString()
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCompanySettings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM company_settings WHERE id = 1',
        [],
        (_, { rows }) => resolve(rows._array[0] || null),
        (_, error) => reject(error)
      );
    });
  });
};

// Products
export const saveProducts = (products) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM products');
      products.forEach(product => {
        tx.executeSql(
          'INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)',
          [product.id, product.name, product.price, product.stock]
        );
      });
    }, reject, resolve);
  });
};

export const getProducts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// Offline Bills
export const saveOfflineBill = (bill) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO offline_bills (customer_name, products, created_at) VALUES (?, ?, ?)',
        [bill.customer_name, JSON.stringify(bill.products), bill.created_at],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUnsyncedBills = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM offline_bills WHERE synced = 0',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const markBillsSynced = (ids) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      ids.forEach(id => {
        tx.executeSql('UPDATE offline_bills SET synced = 1 WHERE id = ?', [id]);
      });
    }, reject, resolve);
  });
};

// Offline Attendance
export const saveOfflineAttendance = (attendance) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO offline_attendance (date, status, check_in, check_out) VALUES (?, ?, ?, ?)',
        [attendance.date, attendance.status, attendance.check_in, attendance.check_out],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUnsyncedAttendance = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM offline_attendance WHERE synced = 0',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const markAttendanceSynced = (ids) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      ids.forEach(id => {
        tx.executeSql('UPDATE offline_attendance SET synced = 1 WHERE id = ?', [id]);
      });
    }, reject, resolve);
  });
};

export default db;
