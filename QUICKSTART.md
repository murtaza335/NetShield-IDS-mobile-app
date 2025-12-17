# NetShield Mobile - Quick Start Guide

## 🚀 What Was Built

A complete, production-ready React Native mobile dashboard for your NetShield IDS with:

✅ **5 Main Screens**
- Overview (system health, metrics, charts)
- Alerts (real-time list with filtering)
- Vulnerabilities (CVEs, ports, services)
- Insights (AI recommendations)
- Settings (connection management)

✅ **Professional UI/UX**
- Enterprise dark theme
- Smooth animations (Moti)
- Severity color coding
- Touch-optimized layouts
- Pull-to-refresh

✅ **Real-Time Features**
- WebSocket alert streaming
- Auto-refresh dashboard
- Live connection status
- Real-time charts

✅ **Complete Architecture**
- REST API service layer
- WebSocket service
- Reusable components
- Type-safe interfaces
- Error handling

---

## 📁 Files Created

### Core Screens (app/(tabs)/)
- `overview.tsx` - Dashboard with metrics and timeline
- `alerts.tsx` - Real-time alert list with filters
- `vulnerabilities.tsx` - Security exposure view
- `insights.tsx` - AI recommendations
- `settings.tsx` - Configuration and health

### Navigation
- `app/_layout.tsx` - Root navigation setup
- `app/(tabs)/_layout.tsx` - Bottom tab configuration
- `app/alert-detail.tsx` - Alert detail modal

### Services
- `services/api.ts` - REST API client (Axios)
- `services/websocket.ts` - WebSocket handler (Socket.IO)

### Components (components/shared/)
- `status-badge.tsx` - System status indicator
- `severity-chip.tsx` - Alert severity labels
- `metric-card.tsx` - Animated KPI cards
- `alert-card.tsx` - Alert list item

### Design System
- `constants/ids-theme.ts` - Enterprise dark theme

### Documentation
- `README.md` - Complete project documentation
- `BACKEND_INTEGRATION.md` - API implementation guide
- `QUICKSTART.md` - This file!

---

## ⚡ Next Steps

### 1. Configure Backend URLs

Edit these two files with your server IP:

**File:** `services/api.ts`
```typescript
const API_BASE_URL = 'http://YOUR_SERVER_IP:5000/api';
```

**File:** `services/websocket.ts`
```typescript
const WS_URL = 'http://YOUR_SERVER_IP:5000';
```

### 2. Start Development

```bash
cd my-app
npm start
```

Then press `a` for Android or scan QR with Expo Go.

### 3. Test Backend Connection

1. Open app
2. Go to Settings tab
3. Enter your API URL
4. Tap "Test Connection"
5. Check for green "CONNECTED" status

### 4. Implement Backend APIs

See `BACKEND_INTEGRATION.md` for:
- Required endpoints
- Response formats
- Flask example code
- WebSocket events

---

## 🎯 Testing Without Backend

You can test the UI with mock data:

**Option 1: Mock API Service**

Edit `services/api.ts` and add mock responses:

```typescript
async getDashboardStats(): Promise<DashboardStats> {
  // For testing only
  return {
    totalAlerts: 1247,
    highSeverity: 45,
    mediumSeverity: 312,
    lowSeverity: 890,
    activeSessions: 23,
    packetsAnalyzed: 1542890,
  };
}
```

**Option 2: JSON Server**

Install `json-server`:
```bash
npm install -g json-server
```

Create `mock-api.json`:
```json
{
  "status": {
    "running": true,
    "status": "secure",
    "riskScore": 25
  },
  "alerts": [...]
}
```

Run:
```bash
json-server --watch mock-api.json --port 5000
```

---

## 🎨 Customization

### Change Theme Colors

Edit `constants/ids-theme.ts`:

```typescript
colors: {
  primary: '#00D9FF',  // Change to your brand color
  // ...
}
```

### Add New Screen

1. Create file in `app/(tabs)/newscreen.tsx`
2. Add to `app/(tabs)/_layout.tsx`:

```typescript
<Tabs.Screen
  name="newscreen"
  options={{
    title: 'New Screen',
    tabBarIcon: ({ color }) => <IconSymbol name="star.fill" color={color} />,
  }}
/>
```

### Modify API Endpoints

Edit `services/api.ts` and add new methods:

```typescript
async getCustomData(): Promise<CustomType> {
  const response = await this.client.get('/custom-endpoint');
  return response.data;
}
```

---

## 📊 Screen Features Summary

### Overview Screen
- ✅ System status badge
- ✅ Risk score (0-100) with circular progress
- ✅ Alert count metrics (Total/High/Medium/Low)
- ✅ 60-minute timeline chart
- ✅ Packets analyzed counter
- ✅ Auto-refresh (30s)
- ✅ Pull-to-refresh

### Alerts Screen
- ✅ Real-time WebSocket streaming
- ✅ Severity filters (All/High/Medium/Low)
- ✅ Alert cards with icons
- ✅ Tap to view details
- ✅ Live connection indicator
- ✅ Pull-to-refresh
- ✅ Empty state handling

### Alert Detail Screen
- ✅ Full signature display
- ✅ Attack category
- ✅ Network details (IPs, ports)
- ✅ Protocol information
- ✅ Payload viewer
- ✅ AI mitigation advice
- ✅ Back navigation

### Vulnerabilities Screen
- ✅ CVE vulnerabilities with severity
- ✅ Expandable detail cards
- ✅ Open ports grid
- ✅ Service listings
- ✅ Risk color coding
- ✅ Empty states
- ✅ Pull-to-refresh

### Insights Screen
- ✅ AI recommendations
- ✅ Priority badges
- ✅ Actionable advice
- ✅ Related alerts count
- ✅ Acknowledge button
- ✅ Timestamp display
- ✅ Empty state

### Settings Screen
- ✅ API connection status
- ✅ WebSocket status
- ✅ Latency monitoring
- ✅ URL configuration
- ✅ Auto-refresh toggle
- ✅ Interval selector
- ✅ Health check button
- ✅ App info

---

## 🔧 Common Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Clear cache
npm start --clear

# Lint code
npm run lint

# Install new package
npm install package-name
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Backend not running
- Wrong IP address
- Firewall blocking port 5000
- Not on same network

**Fix:** Check Settings → Test Connection

### "WebSocket disconnected"
- WebSocket URL wrong (should exclude `/api`)
- Backend Socket.IO not configured
- Network change

**Fix:** Tap "Reconnect" in Settings

### Charts not showing
- Timeline data empty
- Invalid data format
- Chart library issue

**Fix:** Check console for errors, verify data structure

### App crashes on launch
- Dependency issue
- Cache corruption

**Fix:** 
```bash
npm start --clear
rm -rf node_modules
npm install
```

---

## 📚 Key Technologies Used

- **Expo SDK 54**: React Native framework
- **Expo Router**: File-based navigation
- **Axios**: HTTP client
- **Socket.IO**: WebSocket client
- **Moti**: Animation library
- **react-native-chart-kit**: Charts
- **AsyncStorage**: Local storage

---

## 🎓 For FYP/Academic Use

### Presentation Points

✓ **Mobile-first design** - Optimized for security operations on-the-go  
✓ **Real-time monitoring** - WebSocket for instant alert delivery  
✓ **Enterprise UI** - Professional dark theme for SOC environments  
✓ **Separation of concerns** - Clean architecture with services layer  
✓ **Performance** - Virtualized lists, memoization, optimized rendering  
✓ **User experience** - Pull-to-refresh, smooth animations, intuitive navigation  

### Demo Flow

1. Show Overview → System health at a glance
2. Navigate to Alerts → Real-time filtering
3. Tap alert → Detailed analysis
4. Show Vulnerabilities → Security exposure
5. Check Insights → AI recommendations
6. Settings → Backend integration

---

## 🚀 Deployment (Production)

### Build APK

```bash
# EAS Build (recommended)
npm install -g eas-cli
eas build --platform android

# Or local build
npx expo build:android
```

### Environment Variables

Create `.env`:
```
API_BASE_URL=https://your-production-api.com/api
WS_URL=https://your-production-api.com
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Enable API key validation
- [ ] Restrict CORS origins
- [ ] Use secure WebSocket (wss://)

---

## ✅ Final Checklist

- [x] All 5 screens implemented
- [x] Navigation configured
- [x] API service ready
- [x] WebSocket service ready
- [x] Shared components created
- [x] Dark theme applied
- [x] Documentation complete
- [ ] Backend URLs configured
- [ ] Backend APIs implemented
- [ ] App tested on device
- [ ] Connection verified
- [ ] Ready to demo!

---

## 📞 Support

For issues or questions:

1. Check `README.md` for detailed docs
2. Review `BACKEND_INTEGRATION.md` for API help
3. Inspect browser console for errors
4. Test backend endpoints with curl/Postman

---

**You're all set! 🎉**

Your NetShield Mobile dashboard is ready. Just configure your backend URLs and start monitoring your IDS from anywhere!

*Happy coding and stay secure!* 🛡️
