# 🛡️ NetShield IDS - Mobile Dashboard

<div align="center">

**Professional Network Security Monitoring on the Go**

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Running the Application](#-running-the-application)
- [Architecture](#️-architecture)
- [Troubleshooting](#-troubleshooting)
- [Documentation](#-documentation)

---

## 🎯 Overview

NetShield Mobile is a **professional-grade React Native application** for real-time monitoring of network intrusion detection systems. Built with Expo and TypeScript, it provides security analysts and network administrators with instant access to critical security events and system metrics from anywhere.

### Key Highlights

- ✅ **Real-time Monitoring**: Live WebSocket alerts with sub-second latency
- ✅ **Cross-Platform**: Runs on Android devices via Expo
- ✅ **Enterprise-Ready**: Professional UI/UX with Material Design principles
- ✅ **FastAPI Integration**: Seamless connection to Python-based IDS backend
- ✅ **Offline-First**: Graceful degradation when network unavailable
- ✅ **Production-Ready**: TypeScript, error boundaries, and comprehensive logging

### Use Cases

- 🏢 **SOC Operations**: Mobile access to security operations center data
- 🔐 **Network Administration**: Monitor IDS from anywhere on the network
- 📊 **Security Analytics**: Real-time visibility into threat landscape
- 🎓 **Academic Projects**: FYP demonstrations and research presentations

---

## ✨ Features

### 🏠 Overview Dashboard
- **System Status**: Real-time IDS health (Secure/Warning/Critical)
- **Risk Scoring**: Dynamic risk assessment with visual indicators
- **Alert Statistics**: Total alerts with severity breakdown (High/Medium/Low)
- **Time-Series Charts**: 60-minute alert timeline visualization
- **Auto-Refresh**: Configurable refresh intervals (10s - 60s)

### 🚨 Alerts Management
- **Live Streaming**: WebSocket-based real-time alert delivery
- **Advanced Filtering**: Filter by severity, protocol, source/destination
- **Pull-to-Refresh**: Manual refresh with haptic feedback
- **Detailed View**: Full alert metadata including payload analysis
- **Color Coding**: Intuitive severity-based visual hierarchy

### 🔍 Vulnerabilities Screen
- **CVE Database**: Known vulnerabilities with CVSS scores
- **Port Analysis**: Open ports with risk assessment
- **Service Discovery**: Running services and version detection
- **Risk Prioritization**: Automated threat ranking

### 🤖 AI-Powered Insights
- **Smart Recommendations**: Actionable security advice
- **Priority Tagging**: Automated criticality assessment
- **Acknowledgement Tracking**: Mark recommendations as addressed
- **Alert Correlation**: Related alerts linking and pattern detection

### ⚙️ Settings & Configuration
- **Backend Connection**: Configure API and WebSocket endpoints
- **Health Monitoring**: Real-time latency and connection status
- **URL Management**: Switch between local network and remote (ngrok)
- **Performance Tuning**: Adjustable refresh rates and data limits

---

## 💻 System Requirements

### Development Machine

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 10/11, macOS 10.15+, or Linux |
| **Node.js** | v18.0.0 or higher |
| **npm** | v9.0.0 or higher (bundled with Node.js) |
| **RAM** | 8 GB minimum, 16 GB recommended |
| **Storage** | 2 GB free space for dependencies |

### Mobile Device

| Component | Requirement |
|-----------|-------------|
| **Platform** | Android 8.0 (Oreo) or higher |
| **RAM** | 2 GB minimum |
| **Storage** | 100 MB free space |
| **Network** | Wi-Fi or mobile data for API connectivity |

### Backend Server

| Component | Requirement |
|-----------|-------------|
| **Python** | 3.8 or higher |
| **FastAPI** | Latest version |
| **Suricata** | 6.0+ or latest IDS engine |
| **OS** | Linux (Ubuntu 20.04+), Windows, or macOS |
| **Network** | Accessible via LAN or ngrok tunnel |

---

## 📥 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/netshield-mobile.git
cd netshield-mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Duration**: 2-5 minutes depending on internet speed.

### Step 3: Verify Installation

```bash
npx expo --version
```

**Expected Output**: `~54.0.29` or similar

---

## ⚙️ Configuration

### 1. Backend Server Setup

Ensure your FastAPI backend is running with these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/dashboard` | GET | Overview statistics |
| `/api/alerts` | GET | Alert list (paginated) |
| `/api/stats` | GET | System metrics |
| `/api/system` | GET | System status |
| `/api/clear` | POST | Clear all alerts |
| `/ws` | WebSocket | Real-time alert streaming |

**Start Backend**:
```bash
python your_backend_script.py
```

**Verify Backend**:
```bash
curl http://localhost:8000/api/health
```

### 2. Configure API Endpoints

Update the IP address in **two files**:

#### File 1: [services/api.ts](services/api.ts#L10)

```typescript
// Line 10: Change to your server IP
const API_BASE_URL = 'http://192.168.1.100:8000/api';
```

#### File 2: [services/websocket.ts](services/websocket.ts#L9)

```typescript
// Line 9: Change to your server IP
const WS_URL = 'ws://192.168.1.100:8000/ws';
```

**Finding Your Server IP**:

**Windows**:
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**macOS/Linux**:
```bash
ifconfig
# Look for "inet" address under your active interface
```

### 3. Network Options

#### Option A: Local Network (Recommended for Development)
```typescript
// Both devices on same Wi-Fi
const API_BASE_URL = 'http://192.168.1.100:8000/api';
const WS_URL = 'ws://192.168.1.100:8000/ws';
```

#### Option B: ngrok (For Remote Access)
```bash
# On backend machine
ngrok http 8000
```

```typescript
// Use ngrok URL (note: free tier blocks WebSockets from mobile)
const API_BASE_URL = 'https://your-ngrok-url.ngrok-free.app/api';
const WS_URL = 'wss://your-ngrok-url.ngrok-free.app/ws';  // Requires paid ngrok
```

⚠️ **ngrok Free Tier Limitation**: WebSocket connections from mobile apps are blocked. Use local network or upgrade to ngrok paid plan.

---

## 🚀 Running the Application

### Development Mode

#### Terminal 1: Start Backend

```bash
# Navigate to backend directory
cd path/to/backend

# Activate Python environment (if using venv)
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Start FastAPI server
python your_backend_script.py
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

#### Terminal 2: Start Expo

```bash
# Navigate to mobile app directory
cd my-app

# Start Expo development server
npx expo start
```

**Expected Output**:
```
› Metro waiting on exp://192.168.1.101:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Running on Android Device

#### Option 1: Expo Go App (Recommended)

1. Install **Expo Go** from Google Play Store
2. Connect device to **same Wi-Fi** as development machine
3. Open Expo Go and scan QR code from terminal

#### Option 2: Development Build

```bash
npx expo run:android
```

**Requirements**: Android Studio and USB debugging enabled

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React Native 0.81.5 | Cross-platform mobile UI |
| **Framework** | Expo SDK 54 | Development tooling & APIs |
| **Language** | TypeScript 5.9 | Type-safe development |
| **Navigation** | Expo Router | File-based routing |
| **HTTP** | Axios 1.13 | REST API communication |
| **WebSocket** | Native WebSocket API | Real-time alerts |
| **Charts** | react-native-chart-kit | Data visualization |
| **Animations** | Moti + Reanimated | Smooth UI transitions |
| **Storage** | AsyncStorage | Persistent configuration |
| **Backend** | FastAPI (Python) | REST + WebSocket server |

### Project Structure

```
my-app/
├── app/
│   ├── (tabs)/              # Bottom tab navigation screens
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   ├── overview.tsx     # Dashboard with metrics
│   │   ├── alerts.tsx       # Real-time alerts list
│   │   ├── vulnerabilities.tsx  # CVE & port scanning
│   │   ├── insights.tsx     # AI recommendations
│   │   └── settings.tsx     # Configuration panel
│   ├── alert-detail.tsx     # Alert detail modal screen
│   └── _layout.tsx          # Root layout & navigation
│
├── components/
│   ├── shared/              # Reusable UI components
│   │   ├── alert-card.tsx   # Alert list item
│   │   ├── metric-card.tsx  # Dashboard metric display
│   │   ├── severity-chip.tsx # Severity badge
│   │   └── status-badge.tsx # System status indicator
│   └── ui/                  # Base UI elements
│       └── collapsible.tsx  # Expandable sections
│
├── services/
│   ├── api.ts              # REST API client (Axios)
│   └── websocket.ts        # WebSocket client (native)
│
├── constants/
│   ├── ids-theme.ts        # Enterprise dark theme
│   └── theme.ts            # Base color definitions
│
├── hooks/
│   ├── use-color-scheme.ts # Theme management
│   └── use-theme-color.ts  # Dynamic colors
│
├── assets/
│   └── images/             # Icons & graphics
│
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── app.json                # Expo configuration
└── README.md               # This file
```

### Data Flow

```
┌─────────────────┐
│  FastAPI Server │  (Python Backend)
│   Suricata IDS  │
└────────┬────────┘
         │
    HTTP │ REST API          WebSocket (Live Alerts)
    (/api)│                  (/ws)
         │                       │
         ▼                       ▼
┌────────────────────────────────────────┐
│         Mobile App (React Native)      │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  api.ts      │    │ websocket.ts │  │
│  │  (Axios)     │    │  (Native WS) │  │
│  └──────┬───────┘    └──────┬───────┘  │
│         │                   │          │
│         └───────┬───────────┘          │
│                 ▼                      │
│         ┌──────────────┐               │
│         │ React Hooks  │               │
│         │  Components  │               │
│         └──────┬───────┘               │
│                ▼                       │
│      ┌──────────────────┐              │
│      │   Tab Screens    │              │
│      │ (Overview, etc.) │              │
│      └──────────────────┘              │
└────────────────────────────────────────┘
```

---

## 🔒 Security Considerations

- **Read-Only Access**: App cannot modify IDS configuration or rules
- **No Credentials Storage**: Uses IP-based backend connection only
- **Local Network First**: Recommended to avoid internet exposure
- **WebSocket Security**: Use WSS (WebSocket Secure) in production
- **Data Validation**: All API responses validated with TypeScript types

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Cannot Connect to Backend

**Symptoms**: "Network Error" or "Connection Refused"

**Solutions**:
```bash
# Check if backend is running
curl http://192.168.1.100:8000/api/health

# Verify device is on same network
# Settings → Check connection status

# Test with local IP
ping 192.168.1.100

# Check firewall (Windows)
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=TCP localport=8000
```

#### 2. WebSocket Not Connecting

**Symptoms**: No real-time alerts, connection status shows "Disconnected"

**Solutions**:
- ✅ Verify backend WebSocket endpoint: `http://your-ip:8000/ws`
- ✅ If using ngrok free tier → **Switch to local network** (ws://)
- ✅ Check [services/websocket.ts](services/websocket.ts#L9) has correct URL
- ✅ Restart app after URL change

#### 3. "No Alerts" Showing

**Solutions**:
```bash
# Generate test alerts on backend
# Backend should monitor Suricata eve.json logs
# Verify Suricata is running and generating events

# Test alert API
curl http://192.168.1.100:8000/api/alerts
```

#### 4. Expo Build Errors

**Solution**:
```bash
# Clear Metro bundler cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install

# Reset Expo cache
npx expo start --clear
```

#### 5. TypeScript Errors

**Solution**:
```bash
# Rebuild TypeScript
npx tsc --noEmit

# Check for package updates
npm outdated

# Verify tsconfig.json is correct
```

---

## 📊 Performance Optimization

### Recommended Settings

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Refresh Interval** | 30 seconds | Balance between freshness and battery |
| **Alert Limit** | 50-100 | Prevent memory overflow on low-end devices |
| **WebSocket Ping** | 25 seconds | Keep connection alive without overhead |
| **Chart Data Points** | 12 (5 min each) | 1 hour of history, smooth rendering |

### Battery Considerations

- Auto-refresh disabled when app backgrounded
- WebSocket disconnects after 2 minutes of inactivity
- Chart animations disabled on low battery mode

---

## 📚 Documentation

### Quick Reference

- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - API integration details
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design document
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Code examples & patterns

### API Documentation

#### REST Endpoints

**GET /api/dashboard**
```json
{
  "stats": {
    "totalAlerts": 1337,
    "highSeverity": 42,
    "mediumSeverity": 256,
    "lowSeverity": 1039
  },
  "timeline": [...],
  "status": "running"
}
```

**GET /api/alerts?limit=50&severity=high**
```json
{
  "alerts": [
    {
      "timestamp": "2025-12-20 14:30:25",
      "signature": "ET EXPLOIT Attempt",
      "src_ip": "192.168.1.50",
      "src_port": "45231",
      "dest_ip": "8.8.8.8",
      "dest_port": "53",
      "severity_tag": "high",
      "category": "Exploit"
    }
  ]
}
```

**WebSocket Messages**
```json
{
  "type": "new_alert",
  "alert": { ... },
  "stats": { ... },
  "timestamp": "2025-12-20T14:30:25Z"
}
```

---

## 🤝 Contributing

This is an academic project. For questions or collaboration:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/enhancement`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/enhancement`)
5. Open Pull Request

---

## 📄 License

This project is developed for educational purposes as part of a Computer Networks course project at NUST.

**MIT License** - See [LICENSE](LICENSE) file for details.

---

## 🎓 Academic Context

**Course**: Computer Networks (Semester 3)  
**Institution**: National University of Sciences and Technology (NUST)  
**Year**: 2025  
**Project Type**: Final Year Project / Semester Project

### Project Objectives

1. ✅ Implement real-time network monitoring system
2. ✅ Demonstrate IDS integration with mobile platforms
3. ✅ Apply REST API and WebSocket protocols
4. ✅ Create production-ready mobile application
5. ✅ Document architecture and deployment process

---

## 📞 Support

### Getting Help

- **Documentation**: Check [QUICK_START.md](QUICK_START.md) first
- **Backend Issues**: Verify FastAPI server logs
- **Network Issues**: Test with `curl` or Postman
- **Build Issues**: Clear cache with `npx expo start -c`

### Common Commands Cheatsheet

```bash
# Start development server
npx expo start

# Start with cache clear
npx expo start -c

# Run on Android
npx expo start --android

# Check Node version
node --version

# Check Expo version
npx expo --version

# Install dependencies
npm install

# Update dependencies
npm update

# Check backend health
curl http://192.168.1.100:8000/api/health

# Find your IP (Windows)
ipconfig

# Find your IP (macOS/Linux)
ifconfig
```

---

## 🙏 Acknowledgments

- **Expo Team** - Amazing React Native framework
- **FastAPI** - Modern Python web framework
- **Suricata** - Open-source IDS engine
- **React Native Community** - Excellent libraries and support

---

<div align="center">

**Built with ❤️ for Network Security**

[Documentation](#-documentation) • [Troubleshooting](#-troubleshooting) • [Support](#-support)

</div>

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
