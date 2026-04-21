# POS Mobile App - React Native Expo

Complete mobile POS application with offline capabilities for your PHP/MySQL system.

## Features

✅ **Offline-First Architecture**
- Works completely offline
- Auto-syncs when internet is available
- Local SQLite database for offline storage

✅ **Billing System**
- Create bills with product selection
- Dynamic tax calculation
- Offline PDF generation with ZATCA QR code
- Share bills via WhatsApp, Email, etc.

✅ **Company Settings**
- Edit company information (English & Arabic)
- VAT, CR, Tax percentage
- Syncs with backend

✅ **Worker Attendance**
- Mark daily attendance (Present/Absent/Half Day/Leave)
- Offline support with auto-sync

✅ **Salary Management**
- View monthly salary
- Payment history

✅ **Background Sync**
- Automatically syncs offline data every minute when online
- Queue system for pending bills and attendance

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
cd pos-mobile-app
npm install
\`\`\`

### 2. Configure API URL

Edit `src/services/api.js` and replace with your actual domain:

\`\`\`javascript
export const API_URL = 'https://yourdomain.com/whatsapp/api_mobile.php';
\`\`\`

### 3. Run the App

**For Android:**
\`\`\`bash
npm run android
\`\`\`

**For iOS:**
\`\`\`bash
npm run ios
\`\`\`

**For Web (Testing):**
\`\`\`bash
npm run web
\`\`\`

### 4. Build APK for Production

\`\`\`bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
\`\`\`

## Default Login Credentials

- **Username:** owner
- **Password:** password123

## How It Works

### Offline Mode
1. All data is stored in local SQLite database
2. Bills and attendance are queued for sync
3. Company settings and products are cached locally
4. PDF generation works completely offline

### Online Mode
1. App automatically detects internet connection
2. Syncs pending bills and attendance to server
3. Fetches latest company settings and products
4. Background sync runs every 60 seconds

### PDF Generation
- Uses `expo-print` for offline PDF generation
- Matches your `print_bill.php` design exactly
- Includes ZATCA QR code
- Bilingual (Arabic/English)
- Can be shared via any app

## Project Structure

\`\`\`
pos-mobile-app/
├── App.js                          # Main app with navigation
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js          # Login page
│   │   ├── DashboardScreen.js      # Main dashboard
│   │   ├── BillingScreen.js        # Create bills
│   │   ├── AttendanceScreen.js     # Mark attendance
│   │   ├── SalaryScreen.js         # View salary
│   │   └── SettingsScreen.js       # Company settings
│   └── services/
│       ├── api.js                  # API configuration
│       ├── database.js             # SQLite operations
│       ├── sync.js                 # Background sync
│       └── pdfGenerator.js         # Offline PDF generation
├── package.json
├── app.json
└── README.md
\`\`\`

## Backend API Endpoints

The app uses these endpoints from `api_mobile.php`:

- `POST /api_mobile.php?action=login` - User authentication
- `GET /api_mobile.php?action=company_settings` - Fetch company info
- `POST /api_mobile.php?action=company_settings` - Update company info
- `GET /api_mobile.php?action=products` - Fetch products
- `POST /api_mobile.php?action=bills` - Create bill
- `POST /api_mobile.php?action=attendance` - Mark attendance
- `GET /api_mobile.php?action=salary` - Get salary info
- `POST /api_mobile.php?action=sync` - Batch sync offline data

## Troubleshooting

### App not connecting to server
- Check API_URL in `src/services/api.js`
- Ensure `api_mobile.php` is uploaded to your cPanel
- Check CORS headers in PHP file

### PDF not generating
- Make sure `expo-print` is installed
- Check company settings are loaded
- Verify internet connection for QR code API

### Sync not working
- Check internet connection
- Verify token is valid
- Check backend API logs

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **SQLite** - Offline database
- **AsyncStorage** - Token storage
- **Axios** - HTTP requests
- **expo-print** - PDF generation
- **expo-sharing** - Share functionality
- **NativeWind** - Tailwind CSS for React Native

## License

Open source - Free to use and modify
