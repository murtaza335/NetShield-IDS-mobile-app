# NetShield Mobile - Backend Integration Guide

## Overview

This guide helps you integrate the NetShield Mobile app with your Python/Flask IDS backend.

## Required Backend Endpoints

### 1. System Status
**GET** `/api/status`

Returns current system operational status.

**Response:**
```json
{
  "running": true,
  "status": "secure",  // "secure" | "warning" | "critical"
  "riskScore": 25,     // 0-100
  "lastUpdate": "2025-12-17T10:30:00Z",
  "suricataVersion": "7.0.3"
}
```

---

### 2. Dashboard Statistics
**GET** `/api/dashboard/stats`

Returns key metrics for the overview screen.

**Response:**
```json
{
  "totalAlerts": 1247,
  "highSeverity": 45,
  "mediumSeverity": 312,
  "lowSeverity": 890,
  "activeSessions": 23,
  "packetsAnalyzed": 1542890
}
```

---

### 3. Alert Timeline
**GET** `/api/alerts/timeline?minutes=60`

Returns alert counts over time for charting.

**Parameters:**
- `minutes` (optional): Number of minutes to look back (default: 60)

**Response:**
```json
[
  {
    "timestamp": "2025-12-17T10:00:00Z",
    "count": 5
  },
  {
    "timestamp": "2025-12-17T10:01:00Z",
    "count": 3
  }
  // ... one entry per minute
]
```

---

### 4. Severity Distribution
**GET** `/api/alerts/severity-distribution`

Returns breakdown of alerts by severity.

**Response:**
```json
{
  "high": 45,
  "medium": 312,
  "low": 890
}
```

---

### 5. Alerts List
**GET** `/api/alerts`

Returns paginated list of alerts.

**Query Parameters:**
- `severity` (optional): Filter by "high", "medium", or "low"
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "alerts": [
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
      "payload": "SELECT * FROM users..."
    }
  ],
  "total": 1247,
  "page": 1,
  "pageSize": 50
}
```

---

### 6. Single Alert
**GET** `/api/alerts/:id`

Returns detailed information about a specific alert.

**Response:**
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
  "payload": "SELECT * FROM users WHERE id=1 OR 1=1--"
}
```

---

### 7. Recent Alerts
**GET** `/api/alerts/recent?limit=50`

Returns most recent alerts.

**Parameters:**
- `limit` (optional): Number of alerts to return (default: 50)

**Response:**
```json
[
  {
    "id": "alert_124",
    "timestamp": "2025-12-17T10:30:00Z",
    "signature": "ET SCAN Nmap Scripting Engine User-Agent Detected",
    "category": "Attempted Information Leak",
    "severity": "medium",
    "srcIp": "192.168.1.100",
    "srcPort": 54321,
    "destIp": "10.0.0.1",
    "destPort": 22,
    "protocol": "tcp"
  }
]
```

---

### 8. Vulnerabilities
**GET** `/api/vulnerabilities`

Returns known vulnerabilities detected.

**Response:**
```json
[
  {
    "id": "vuln_001",
    "cveId": "CVE-2024-1234",
    "title": "OpenSSH Remote Code Execution",
    "description": "A buffer overflow in OpenSSH allows remote attackers...",
    "severity": "critical",
    "port": 22,
    "service": "SSH",
    "status": "open"
  }
]
```

---

### 9. Open Ports
**GET** `/api/network/ports`

Returns list of open network ports.

**Response:**
```json
[
  {
    "port": 22,
    "protocol": "tcp",
    "service": "SSH",
    "state": "open",
    "risk": "medium"
  },
  {
    "port": 80,
    "protocol": "tcp",
    "service": "HTTP",
    "state": "open",
    "risk": "low"
  }
]
```

---

### 10. Services
**GET** `/api/network/services`

Returns detected network services.

**Response:**
```json
[
  {
    "name": "OpenSSH",
    "version": "8.9p1",
    "ports": [22],
    "vulnerabilities": 2
  },
  {
    "name": "Apache",
    "version": "2.4.52",
    "ports": [80, 443],
    "vulnerabilities": 0
  }
]
```

---

### 11. AI Insights
**GET** `/api/ai/insights`

Returns AI-generated security recommendations.

**Response:**
```json
[
  {
    "id": "insight_001",
    "title": "Unusual Traffic Pattern Detected",
    "description": "Multiple failed SSH login attempts from 192.168.1.50 detected in the last hour.",
    "priority": "high",
    "recommendation": "Consider blocking IP 192.168.1.50 and enabling fail2ban for SSH protection.",
    "relatedAlerts": ["alert_120", "alert_121", "alert_122"],
    "acknowledged": false,
    "timestamp": "2025-12-17T10:15:00Z"
  }
]
```

---

### 12. Acknowledge Insight
**POST** `/api/ai/insights/:id/acknowledge`

Marks an AI insight as acknowledged.

**Response:**
```json
{
  "success": true,
  "id": "insight_001"
}
```

---

### 13. Health Check
**GET** `/api/health`

Returns API health status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-12-17T10:30:00Z"
}
```

---

## WebSocket Events

### Server → Client

#### `new_alert`
Emitted when a new alert is detected.

**Payload:**
```json
{
  "id": "alert_125",
  "timestamp": "2025-12-17T10:31:00Z",
  "signature": "ET MALWARE Known Bot C2 Traffic",
  "category": "Malware Command and Control Activity Detected",
  "severity": "high",
  "srcIp": "10.0.0.15",
  "srcPort": 49152,
  "destIp": "45.33.32.156",
  "destPort": 8080,
  "protocol": "tcp"
}
```

#### `system_update`
Emitted when system status changes.

**Payload:**
```json
{
  "status": "warning",
  "riskScore": 65,
  "message": "High severity alerts increasing"
}
```

---

## Flask Implementation Example

### Basic Setup

```python
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import json
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app
socketio = SocketIO(app, cors_allowed_origins="*")

# Sample data storage (replace with your database)
alerts = []
vulnerabilities = []

# Health endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })

# System status
@app.route('/api/status', methods=['GET'])
def get_status():
    # Calculate from your Suricata data
    return jsonify({
        'running': True,
        'status': 'secure',  # or 'warning', 'critical'
        'riskScore': 25,
        'lastUpdate': datetime.utcnow().isoformat() + 'Z',
        'suricataVersion': '7.0.3'
    })

# Dashboard stats
@app.route('/api/dashboard/stats', methods=['GET'])
def get_stats():
    high_count = len([a for a in alerts if a['severity'] == 'high'])
    medium_count = len([a for a in alerts if a['severity'] == 'medium'])
    low_count = len([a for a in alerts if a['severity'] == 'low'])
    
    return jsonify({
        'totalAlerts': len(alerts),
        'highSeverity': high_count,
        'mediumSeverity': medium_count,
        'lowSeverity': low_count,
        'activeSessions': 23,
        'packetsAnalyzed': 1542890
    })

# Alerts timeline
@app.route('/api/alerts/timeline', methods=['GET'])
def get_timeline():
    minutes = int(request.args.get('minutes', 60))
    # Generate timeline data from your alerts
    timeline = []
    now = datetime.utcnow()
    
    for i in range(minutes):
        time_point = now - timedelta(minutes=minutes - i)
        # Count alerts at this time point
        count = 0  # Calculate from your data
        timeline.append({
            'timestamp': time_point.isoformat() + 'Z',
            'count': count
        })
    
    return jsonify(timeline)

# Recent alerts
@app.route('/api/alerts/recent', methods=['GET'])
def get_recent_alerts():
    limit = int(request.args.get('limit', 50))
    return jsonify(alerts[:limit])

# Single alert
@app.route('/api/alerts/<alert_id>', methods=['GET'])
def get_alert(alert_id):
    alert = next((a for a in alerts if a['id'] == alert_id), None)
    if alert:
        return jsonify(alert)
    return jsonify({'error': 'Alert not found'}), 404

# Vulnerabilities
@app.route('/api/vulnerabilities', methods=['GET'])
def get_vulnerabilities():
    return jsonify(vulnerabilities)

# WebSocket: New alert
def emit_new_alert(alert):
    socketio.emit('new_alert', alert)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
```

---

## CORS Configuration

Ensure your Flask backend allows requests from the mobile app:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## Testing Endpoints

Use these curl commands to test:

```bash
# Health check
curl http://localhost:5000/api/health

# System status
curl http://localhost:5000/api/status

# Recent alerts
curl http://localhost:5000/api/alerts/recent?limit=10

# Timeline
curl http://localhost:5000/api/alerts/timeline?minutes=60
```

---

## Parsing Suricata eve.json

Example Python code to parse Suricata alerts:

```python
import json
from datetime import datetime

def parse_eve_json(eve_file_path):
    alerts = []
    
    with open(eve_file_path, 'r') as f:
        for line in f:
            try:
                event = json.loads(line)
                
                # Only process alerts
                if event.get('event_type') == 'alert':
                    alert = {
                        'id': f"alert_{event.get('flow_id', '')}",
                        'timestamp': event.get('timestamp'),
                        'signature': event.get('alert', {}).get('signature', 'Unknown'),
                        'category': event.get('alert', {}).get('category', 'Unknown'),
                        'severity': map_severity(event.get('alert', {}).get('severity', 3)),
                        'srcIp': event.get('src_ip', ''),
                        'srcPort': event.get('src_port', 0),
                        'destIp': event.get('dest_ip', ''),
                        'destPort': event.get('dest_port', 0),
                        'protocol': event.get('proto', '').lower(),
                        'action': event.get('alert', {}).get('action', 'alert'),
                        'payload': event.get('payload', '')
                    }
                    alerts.append(alert)
            except json.JSONDecodeError:
                continue
    
    return alerts

def map_severity(suricata_severity):
    """Convert Suricata severity (1-3) to our format"""
    if suricata_severity == 1:
        return 'high'
    elif suricata_severity == 2:
        return 'medium'
    else:
        return 'low'
```

---

## Deployment Checklist

- [ ] All 13 REST endpoints implemented
- [ ] WebSocket events configured
- [ ] CORS enabled for mobile access
- [ ] Error handling for missing data
- [ ] Suricata eve.json parsing working
- [ ] Backend running on accessible IP
- [ ] Firewall allows port 5000
- [ ] Mobile app configured with correct URLs
- [ ] Health endpoint returning 200 OK
- [ ] WebSocket connection successful

---

## Troubleshooting

### Mobile app can't connect
1. Check backend is running: `curl http://YOUR_IP:5000/api/health`
2. Verify firewall allows port 5000
3. Ensure CORS is enabled
4. Check mobile device is on same network

### WebSocket not working
1. Verify Socket.IO is installed: `pip install flask-socketio`
2. Check mobile app WebSocket URL (no `/api` suffix)
3. Test with Socket.IO client test tool

### No data showing
1. Verify Suricata is generating eve.json
2. Check parsing logic is working
3. Ensure endpoints return valid JSON
4. Test with Postman/curl first

---

**Good luck with your NetShield Mobile integration!**
