# NetShield Mobile - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APPLICATION                       │
│                  (React Native + Expo)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌──────┐          ┌──────────┐        ┌─────────┐
    │ REST │          │ WebSocket│        │ Storage │
    │ API  │          │ Socket.IO│        │AsyncStor│
    └──────┘          └──────────┘        └─────────┘
        │                   │                   │
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Python/Flask)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Flask API Endpoints     Socket.IO Events            │  │
│  │  • /api/status          • new_alert                  │  │
│  │  • /api/alerts          • system_update              │  │
│  │  • /api/vulnerabilities                              │  │
│  │  • /api/ai/insights                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Suricata IDS Engine                          │  │
│  │         • eve.json parser                            │  │
│  │         • Alert aggregation                          │  │
│  │         • Statistics calculation                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
app/
├── (tabs)/                    # Bottom Tab Navigation
│   ├── overview.tsx           → Dashboard + Charts
│   ├── alerts.tsx             → Alert List + Filters
│   ├── vulnerabilities.tsx    → CVE + Ports + Services
│   ├── insights.tsx           → AI Recommendations
│   └── settings.tsx           → Configuration
│
├── alert-detail.tsx           # Modal Stack Screen
└── _layout.tsx                # Root Navigation

components/shared/
├── status-badge.tsx           # System Status Indicator
├── severity-chip.tsx          # Alert Severity Labels
├── metric-card.tsx            # Animated KPI Cards
└── alert-card.tsx             # Alert List Items

services/
├── api.ts                     # REST API Client
│   ├── idsApi.getSystemStatus()
│   ├── idsApi.getDashboardStats()
│   ├── idsApi.getAlerts()
│   ├── idsApi.getVulnerabilities()
│   └── idsApi.getAIInsights()
│
└── websocket.ts               # WebSocket Handler
    ├── wsService.connect()
    ├── wsService.onAlert()
    └── wsService.onConnectionChange()

constants/
└── ids-theme.ts               # Design System
    ├── colors (dark mode)
    ├── typography
    ├── spacing
    └── animations
```

---

## Data Flow

### REST API Flow (Polling)
```
[Overview Screen]
      ↓
   useEffect()
      ↓
 idsApi.getDashboardStats()
      ↓
   Axios GET → http://server:5000/api/dashboard/stats
      ↓
   Backend queries Suricata data
      ↓
   JSON Response
      ↓
 setState(stats)
      ↓
   UI Re-renders
```

### WebSocket Flow (Real-time)
```
[App Startup]
      ↓
wsService.connect()
      ↓
Socket.IO connects to server:5000
      ↓
   [Suricata detects threat]
         ↓
   Backend emits 'new_alert'
         ↓
   wsService.onAlert(callback)
         ↓
   setState([newAlert, ...alerts])
         ↓
   AlertCard animates in
```

---

## Navigation Structure

```
Root Stack Navigator
│
├─ (tabs)                      # Bottom Tabs
│   │
│   ├─ overview               [Tab 1] 📊 Overview
│   ├─ alerts                 [Tab 2] 🚨 Alerts
│   ├─ vulnerabilities        [Tab 3] 🛡️ Vulnerabilities
│   ├─ insights               [Tab 4] 💡 Insights
│   └─ settings               [Tab 5] ⚙️ Settings
│
└─ alert-detail               # Modal (Stack Screen)
    ↑
    │ Opened from: alerts.tsx
    │ Params: { alertId }
```

---

## Screen Breakdown

### Overview Screen
```
┌────────────────────────────────────┐
│  NetShield IDS                     │
│  Last updated: 10:30 AM            │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │      RISK SCORE              │ │
│  │         ┌───┐                │ │
│  │         │ 25│  ● SECURE      │ │
│  │         └───┘                │ │
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐      │
│  │  TOTAL   │  │   HIGH   │      │
│  │   1247   │  │    45    │      │
│  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐      │
│  │  MEDIUM  │  │   LOW    │      │
│  │   312    │  │   890    │      │
│  └──────────┘  └──────────┘      │
├────────────────────────────────────┤
│  ALERTS TIMELINE (60 MIN)         │
│  ╭─────────────────────────────╮  │
│  │     ╱╲    ╱╲               │  │
│  │  ╱╲╱  ╲──╱  ╲─────         │  │
│  ╰─────────────────────────────╯  │
└────────────────────────────────────┘
```

### Alerts Screen
```
┌────────────────────────────────────┐
│  Alerts         ● Live • 45 alerts │
├────────────────────────────────────┤
│  [All] [High] [Medium] [Low]       │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ 🦠 SQL Injection Attempt     │ │
│  │    Web Application Attack    │ │
│  │    192.168.1.50:45123        │ │
│  │    → 10.0.0.5:80       [HIGH]│ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 🔍 Port Scan Detected        │ │
│  │    Attempted Information Leak│ │
│  │    192.168.1.100:54321       │ │
│  │    → 10.0.0.1:22    [MEDIUM] │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend
- **React Native 0.81.5**: Core framework
- **Expo SDK 54**: Development platform
- **Expo Router 6.0**: File-based navigation
- **TypeScript 5.9**: Type safety

### Networking
- **Axios**: REST API client
  - Interceptors for error handling
  - Request/response transformation
  - Timeout configuration

- **Socket.IO Client**: WebSocket
  - Auto-reconnection
  - Event-based messaging
  - Binary data support

### UI/Animation
- **Moti**: Declarative animations
  - Built on Reanimated
  - Simple API
  - Performance optimized

- **react-native-chart-kit**: Charts
  - Line charts
  - Customizable styling
  - Responsive layouts

### State Management
- **React Hooks**: Local state
  - useState for component state
  - useEffect for lifecycle
  - Custom hooks for reusability

### Storage
- **AsyncStorage**: Persistent data
  - API URLs
  - User preferences
  - Settings

---

## API Integration Pattern

```typescript
// Service Layer (services/api.ts)
class IDSApiService {
  private client: AxiosInstance;
  
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }
}

export const idsApi = new IDSApiService();

// Component Usage (app/(tabs)/overview.tsx)
const [stats, setStats] = useState<DashboardStats | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await idsApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  
  loadData();
}, []);
```

---

## Performance Optimizations

### List Virtualization
```typescript
<FlatList
  data={alerts}
  renderItem={({ item }) => <AlertCard alert={item} />}
  keyExtractor={(item) => item.id}
  // Only renders visible items
  windowSize={10}
  maxToRenderPerBatch={10}
  initialNumToRender={20}
/>
```

### Memoization
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Only re-renders if data changes
  return <View>...</View>;
});
```

### Animation Performance
```typescript
// Uses native driver
<MotiView
  from={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ type: 'timing', duration: 250 }}
/>
```

---

## Security Considerations

### Client-Side
- ✅ No sensitive data stored locally
- ✅ HTTPS recommended for production
- ✅ Input validation on forms
- ✅ Safe navigation patterns
- ✅ Error boundary protection

### Backend (Your Responsibility)
- ⚠️ Implement authentication
- ⚠️ Add rate limiting
- ⚠️ Validate all inputs
- ⚠️ Use CORS properly
- ⚠️ Secure WebSocket connections

---

## Deployment Architecture

```
Production Setup:

┌──────────────┐
│ Android User │
└──────┬───────┘
       │ HTTPS
       ▼
┌──────────────┐
│   CDN/Proxy  │
│   (Optional) │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│ Flask Server │◄─────┤  Suricata    │
│   + NGINX    │      │   IDS Engine │
└──────┬───────┘      └──────────────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │
│   (Alerts)   │
└──────────────┘
```

---

## File Size Analysis

- **App Bundle**: ~25 MB (with dependencies)
- **Runtime Memory**: ~80-120 MB
- **API Responses**: Typically < 100 KB per request
- **WebSocket Events**: < 5 KB per alert

---

This architecture ensures:
✓ Separation of concerns  
✓ Scalability  
✓ Maintainability  
✓ Performance  
✓ Security  
✓ Real-time capabilities  
