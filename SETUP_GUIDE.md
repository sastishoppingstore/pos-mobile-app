# Complete Setup Guide - POS Mobile App

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Expo CLI** (will be installed automatically)
4. **Android Studio** (for Android development) OR **Xcode** (for iOS development)
5. **Expo Go app** on your phone (for testing)

## 🚀 Step-by-Step Setup

### Step 1: Backend Setup (Already Done ✅)

Your backend API is already created at:
`/home/sastishoppingstore/whatsapp/api_mobile.php`

Make sure it's accessible at:
`https://yourdomain.com/whatsapp/api_mobile.php`

### Step 2: Install Dependencies

\`\`\`bash
cd /home/sastishoppingstore/pos-mobile-app
npm install
\`\`\`

This will install all required packages:
- React Native & Expo
- SQLite for offline database
- AsyncStorage for token storage
- Axios for API calls
- expo-print for PDF generation
- expo-sharing for sharing PDFs
- NativeWind for Tailwind CSS styling

### Step 3: Configure API URL

Open `src/services/api.js` and update the API URL:

\`\`\`javascript
// Replace 'yourdomain.com' with your actual domain
export const API_URL = 'https://sastishoppingstore.com/whatsapp/api_mobile.php';
\`\`\`

### Step 4: Test on Development

#### Option A: Using Expo Go (Easiest)

1. Install Expo Go app on your phone:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Scan the QR code with:
   - **Android:** Expo Go app
   - **iOS:** Camera app (will open in Expo Go)

#### Option B: Using Android Emulator

1. Open Android Studio
2. Start an Android Virtual Device (AVD)
3. Run:
   \`\`\`bash
   npm run android
   \`\`\`

#### Option C: Using iOS Simulator (Mac only)

\`\`\`bash
npm run ios
\`\`\`

### Step 5: Build Production APK

#### Method 1: Using EAS Build (Recommended)

1. Install EAS CLI:
   \`\`\`bash
   npm install -g eas-cli
   \`\`\`

2. Login to Expo:
   \`\`\`bash
   eas login
   \`\`\`

3. Configure build:
   \`\`\`bash
   eas build:configure
   \`\`\`

4. Build APK:
   \`\`\`bash
   eas build --platform android --profile preview
   \`\`\`

5. Download APK from the link provided

#### Method 2: Using Expo Build (Classic)

\`\`\`bash
expo build:android -t apk
\`\`\`

### Step 6: Install APK on Phone

1. Download the APK to your phone
2. Enable "Install from Unknown Sources" in Settings
3. Open the APK file and install

## 🔧 Configuration Options

### Changing App Name

Edit `app.json`:
\`\`\`json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
\`\`\`

### Changing App Icon

Replace these files in `assets/` folder:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash.png` (1284x2778)

### Changing Colors

Edit Tailwind classes in screen files or add custom colors in `tailwind.config.js`

## 📱 Testing Offline Features

1. **Test Offline Bill Creation:**
   - Turn off WiFi/Mobile Data
   - Create a new bill
   - Bill should save locally
   - Turn on internet
   - Bill should auto-sync

2. **Test Offline Attendance:**
   - Turn off internet
   - Mark attendance
   - Should save locally
   - Turn on internet
   - Should auto-sync

3. **Test PDF Generation:**
   - Create a bill (online or offline)
   - PDF should generate without internet
   - Share via WhatsApp/Email

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to server"

**Solution:**
- Check API_URL in `src/services/api.js`
- Verify `api_mobile.php` is accessible
- Check CORS headers in PHP file
- Test API URL in browser

### Issue 2: "Expo Go not loading"

**Solution:**
- Make sure phone and computer are on same WiFi
- Restart Expo server: `npm start --clear`
- Update Expo Go app to latest version

### Issue 3: "PDF not generating"

**Solution:**
- Check company settings are loaded
- Verify internet for QR code API
- Check expo-print is installed: `npm list expo-print`

### Issue 4: "Build failed"

**Solution:**
- Clear cache: `expo start --clear`
- Delete node_modules: `rm -rf node_modules && npm install`
- Update Expo: `npm install expo@latest`

### Issue 5: "Database not working"

**Solution:**
- Check SQLite is installed: `npm list expo-sqlite`
- Clear app data and reinstall
- Check database initialization in App.js

## 📊 Database Schema

The app creates these SQLite tables:

### company_settings
- Stores company information locally
- Syncs with backend

### products
- Cached product list
- Updated when online

### offline_bills
- Queue for bills created offline
- Synced when online

### offline_attendance
- Queue for attendance marked offline
- Synced when online

## 🔄 Sync Logic

1. **Auto-Sync:** Runs every 60 seconds when online
2. **Manual Sync:** Tap "Sync Now" button on dashboard
3. **On Login:** Fetches latest data from server
4. **On Create:** Tries online first, falls back to offline

## 🎨 Customization

### Change Theme Colors

Edit screen files and replace Tailwind classes:
- `bg-purple-600` → Your primary color
- `bg-blue-600` → Your secondary color
- `text-purple-600` → Your accent color

### Add New Features

1. Create new screen in `src/screens/`
2. Add route in `App.js`
3. Add navigation button in `DashboardScreen.js`

### Modify PDF Layout

Edit `src/services/pdfGenerator.js`:
- Change HTML structure
- Modify CSS styles
- Add/remove fields

## 📞 Support

For issues or questions:
1. Check this guide first
2. Check Expo documentation: https://docs.expo.dev
3. Check React Native documentation: https://reactnative.dev

## 🎯 Next Steps

After setup:
1. Test all features thoroughly
2. Customize branding (colors, logo, name)
3. Test offline functionality
4. Build production APK
5. Distribute to users

## 📝 Notes

- **Internet Required:** First login, salary view, dashboard stats
- **Works Offline:** Billing, attendance, settings, PDF generation
- **Auto-Sync:** Happens automatically when online
- **Data Safety:** All data stored locally until synced
- **Security:** Token-based authentication

## ✅ Checklist

Before going live:
- [ ] Update API_URL with production domain
- [ ] Test login with real credentials
- [ ] Test bill creation and PDF generation
- [ ] Test offline mode thoroughly
- [ ] Test sync functionality
- [ ] Customize app name and icon
- [ ] Build production APK
- [ ] Test APK on real device
- [ ] Train users on how to use app
