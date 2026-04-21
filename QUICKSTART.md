# Quick Start Guide - 5 Minutes Setup

## 🚀 Fastest Way to Get Started

### 1. Install Dependencies (2 minutes)

```bash
cd /home/sastishoppingstore/pos-mobile-app
npm install
```

### 2. Update API URL (30 seconds)

Open: `src/services/api.js`

Change line 6:
```javascript
export const API_URL = 'https://sastishoppingstore.com/whatsapp/api_mobile.php';
```

### 3. Start Development Server (30 seconds)

```bash
npm start
```

### 4. Test on Phone (2 minutes)

1. Install **Expo Go** app on your phone
2. Scan the QR code shown in terminal
3. App will open on your phone

### 5. Login & Test

- Username: `owner`
- Password: `password123`

## ✅ Quick Test Checklist

1. **Login** - Should work
2. **Dashboard** - Should show menu
3. **Settings** - Edit company name, save
4. **Billing** - Create a bill, generate PDF
5. **Offline Test** - Turn off WiFi, create bill, should work
6. **Sync Test** - Turn on WiFi, should auto-sync

## 🎯 Build APK (5 minutes)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform android --profile preview
```

Download APK from the link provided.

## 📱 Install on Phone

1. Download APK to phone
2. Enable "Install from Unknown Sources"
3. Install APK
4. Open app
5. Login with: owner / password123

## 🎉 Done!

Your mobile POS app is ready to use!

## 🐛 If Something Goes Wrong

### "Cannot connect to server"
→ Check API_URL in `src/services/api.js`

### "Expo Go not loading"
→ Make sure phone and computer are on same WiFi

### "Build failed"
→ Run: `npm start --clear`

## 📚 Need More Help?

- Read `SETUP_GUIDE.md` for detailed instructions
- Read `URDU_SUMMARY.md` for Urdu explanation
- Read `README.md` for full documentation

## 🎯 What You Get

✅ Complete offline POS app
✅ Bill generation with PDF
✅ Company settings management
✅ Worker attendance
✅ Salary management
✅ Auto-sync when online
✅ Beautiful UI
✅ Production-ready

**Total Setup Time: ~10 minutes**
