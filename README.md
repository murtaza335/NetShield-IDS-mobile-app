# NetShield IDS - Mobile Dashboard

A professional, enterprise-grade React Native mobile application for monitoring the NetShield Intrusion Detection System. Built with Expo for Android devices.

## 🎯 Overview

NetShield Mobile is a **read-only monitoring dashboard** that provides real-time visibility into your IDS operations. It does NOT run Suricata itself—it consumes REST APIs and WebSocket streams from your desktop/server IDS application.

### Target Users
- Network Administrators
- Security Analysts  
- SOC Personnel
- FYP Evaluators

## 📱 Features

### 1. Overview Screen
- System status (Secure/Warning/Critical)
- Risk score with circular progress indicator
- Total alerts and severity breakdown (High/Medium/Low)
- 60-minute alerts timeline chart
- Real-time packet analysis statistics
- Auto-refresh every 30 seconds

### 2. Alerts Screen
- Real-time alert streaming via WebSocket
- Filter by severity (All/High/Medium/Low)
- Pull-to-refresh
- Tap alert for detailed view
- Severity color coding
- Attack type icons

### 3. Alert Detail Screen
- Full signature and category
- Source/Destination IP and ports
- Protocol information
- Timestamp
- Payload (if available)
- AI-powered mitigation recommendations

### 4. Vulnerabilities Screen
- Known CVE vulnerabilities
- Open ports with risk levels
- Running services
- Expandable detail cards
- Risk color coding

### 5. Insights (AI) Screen
- AI-generated security recommendations
- Priority tagging (Critical/High/Medium/Low)
- Actionable advice
- Acknowledgement tracking
- Related alerts linking

### 6. Settings Screen
- Backend connection status
- API latency monitoring
- WebSocket connection status
- Configurable API/WebSocket URLs
- Auto-refresh interval selector
- Connection health checks

## 🏗️ Architecture

### Technology Stack
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: Expo Router with bottom tabs
- **State Management**: React hooks
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Charts**: react-native-chart-kit
- **Animations**: Moti (powered by Reanimated)
- **Storage**: AsyncStorage

### Project Structure
```
my-app/
├── app/
│   ├── (tabs)/              # Bottom tab screens
│   │   ├── overview.tsx
│   │   ├── alerts.tsx
│   │   ├── vulnerabilities.tsx
│   │   ├── insights.tsx
│   │   └── settings.tsx
│   ├── alert-detail.tsx     # Alert detail modal
│   └── _layout.tsx          # Root navigation
├── components/
│   └── shared/              # Reusable UI components
│       ├── status-badge.tsx
│       ├── severity-chip.tsx
│       ├── metric-card.tsx
│       └── alert-card.tsx
├── services/
│   ├── api.ts              # REST API service
│   └── websocket.ts        # WebSocket service
├── constants/
│   └── ids-theme.ts        # Enterprise dark theme
└── package.json
```

## 🎨 Design System

### Color Palette (Enterprise Dark Mode)
- **Background**: `#0A0E14` (Deep space)
- **Surface**: `#111620` (Elevated panels)
- **Primary**: `#00D9FF` (Security blue)
- **Success**: `#00E676` (Green)
- **Warning**: `#FFB300` (Amber)
- **Critical**: `#FF3D00` (Red)

### Typography
- **Display**: 32px, Bold
- **Headings**: 28px → 20px
- **Body**: 16px
- **Caption**: 14px
- **Label**: 12px, Uppercase

### Animation Guidelines
- Duration: 150-250ms
- Type: Timing (no spring/bounce)
- Use cases: Card appearance, list items, status changes
- Avoid: Excessive navigation transitions

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ (Note: Some warnings about Node 20+ can be ignored)
- Expo CLI
- Android device or emulator

### Installation Steps

1. **Navigate to project**
   ```bash
   cd my-app
   ```

2. **Install dependencies** (already done)
   ```bash
   npm install
   ```

3. **Configure Backend URLs**
   
   Update these files with your server IP:
   - `services/api.ts` → Change `API_BASE_URL`
   - `services/websocket.ts` → Change `WS_URL`

   Example:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:5000/api';
   const WS_URL = 'http://192.168.1.100:5000';
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Run on Android**
   ```bash
   npm run android
   ```
   Or scan QR code with Expo Go app

## 📡 Backend API Requirements

Your Python/Flask IDS backend must expose these endpoints:

### REST Endpoints
```
GET /api/status                      # System status
GET /api/dashboard/stats             # Dashboard metrics
GET /api/alerts/timeline?minutes=60  # Timeline data
GET /api/alerts/severity-distribution # Severity counts
GET /api/alerts                      # Alerts list
GET /api/alerts/:id                  # Single alert
GET /api/alerts/recent?limit=50      # Recent alerts
GET /api/vulnerabilities             # CVE vulnerabilities
GET /api/network/ports               # Open ports
GET /api/network/services            # Running services
GET /api/ai/insights                 # AI recommendations
POST /api/ai/insights/:id/acknowledge # Acknowledge insight
GET /api/health                      # Health check
```

### WebSocket Events
```javascript
// Client → Server
connect

// Server → Client
new_alert       // Real-time alert
system_update   // System status update
```

### Sample Response Formats

**System Status** (`/api/status`)
```json
{
  "running": true,
  "status": "secure",
  "riskScore": 25,
  "lastUpdate": "2025-12-17T10:30:00Z",
  "suricataVersion": "7.0.3"
}
```

**Alert** (`/api/alerts/:id`)
```json
{
  "id": "alert_123",
  "timestamp": "2025-12-17T10:25:00Z",
  "signature": "ET EXPLOIT Possible SQL Injection",
  "category": "Web Application Attack",
  "severity": "high",
  "srcIp": "192.168.1.50",
  "srcPort": 45123,
  "destIp": "10.0.0.5",
  "destPort": 80,
  "protocol": "tcp",
  "action": "alert",
  "payload": "..."
}
```

## 🚀 Usage

### First-Time Setup
1. Launch app
2. Go to **Settings** tab
3. Enter your backend API URL
4. Enter WebSocket URL
5. Tap "Test Connection"
6. Once connected, return to Overview

### Daily Monitoring
1. Check **Overview** for system health
2. Monitor **Alerts** for real-time threats
3. Review **Vulnerabilities** for exposure
4. Act on **Insights** recommendations

### Connection Issues
- Check backend server is running
- Verify IP addresses are correct
- Ensure firewall allows connections
- Use Settings → Test Connection
- Check WebSocket reconnection status

## 🎯 Performance Considerations

### Optimizations
- Virtualized lists for alerts (FlatList)
- Memoized components where appropriate
- Debounced WebSocket handlers
- Auto-reconnection with backoff
- Pagination for large datasets

### Data Refresh
- **Auto**: 30s intervals (configurable)
- **Pull-to-refresh**: Manual trigger
- **WebSocket**: Real-time push

## 🔒 Security Notes

This is a **monitoring-only** application:
- ✅ Read data from IDS
- ✅ View alerts and statistics
- ✅ Receive AI recommendations
- ❌ NO control over Suricata
- ❌ NO rule modifications
- ❌ NO system configuration changes

### Best Practices
- Use VPN when accessing remotely
- Keep API URLs in settings (not hardcoded)
- Use HTTPS for production
- Implement authentication on backend
- Restrict backend API access by IP

## 📊 Troubleshooting

### "No connection" error
- Verify backend is running
- Check API URL format includes `/api`
- Test with browser: `http://YOUR_IP:5000/api/health`

### WebSocket not connecting
- Ensure WebSocket URL excludes `/api`
- Check firewall allows Socket.IO
- Verify CORS settings on backend

### Charts not displaying
- Ensure timeline data has valid numbers
- Check data array is not empty
- Verify timestamp format

### App crashes on start
- Clear cache: `npm start --clear`
- Reinstall: `npm install`
- Check Expo Go version matches SDK

## 🎓 Educational Context

This project is designed for:
- Final Year Projects (FYP)
- Cybersecurity coursework
- Network security demonstrations
- SOC operation simulations

### Evaluation Points
✓ Professional enterprise UI/UX  
✓ Real-time data streaming  
✓ Mobile-first responsive design  
✓ Security-focused visualizations  
✓ Clean architecture and code organization  
✓ Error handling and connection resilience  

## 📝 Future Enhancements

- Push notifications for critical alerts
- Offline mode with caching
- Dark/Light theme toggle
- Alert filtering by IP range
- Export reports (PDF/CSV)
- Biometric authentication
- Multi-server support
- Custom dashboard widgets

## 🤝 Contributing

This is an educational/demonstration project. Feel free to:
- Report issues
- Suggest UI improvements
- Add new visualizations
- Enhance AI recommendations

## 📄 License

Educational use. Modify as needed for your projects.

## 👨‍💻 Credits

Developed as a mobile companion to the NetShield IDS desktop application.

Built with:
- React Native & Expo
- Socket.IO for real-time communications
- Chart.js for visualizations
- Moti for smooth animations

---

**NetShield Mobile Dashboard**  
*Enterprise-grade IDS monitoring for Android*  
Version 1.0.0
