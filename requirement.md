# Admin Token Configuration Management

## 🔐 Authorization Requirements
- **Role Required:** `SuperAdmin` only
- **Authentication:** Bearer token in Authorization header

## 🆕 **Updated Authentication Response Format**

### Login & Refresh Token Responses Now Include:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  
  // ✅ NEW: Separate expiry times for countdown timers
  "accessTokenExpiresAt": "2025-08-23T09:30:00Z",      // 30 min from now
  "refreshTokenExpiresAt": "2025-08-30T08:00:00Z",     // 7 days from now 
  "rememberMeTokenExpiresAt": "2025-09-22T08:00:00Z",  // 30 days (if remember me)
  
  // Legacy field (still supported)
  "expiresAt": "2025-08-23T09:30:00Z",
  
  "user": { "username": "admin", ... }
}
```

### 🎯 **Impact on Frontend Countdown Timers:**
- **Access Token Timer:** Use `accessTokenExpiresAt` - triggers auto refresh
- **Session Timer:** Use `refreshTokenExpiresAt` - triggers logout  
- **Remember Me Timer:** Use `rememberMeTokenExpiresAt` - max session limit

## 📋 API Endpoints

### 1. Get Current Token Configuration
```http
GET /api/admin/token-config
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "accessTokenExpiryMinutes": 30,
  "refreshTokenExpiryDays": 7,
  "rememberMeTokenExpiryDays": 30,
  "lastUpdated": "2025-08-23T08:00:00Z",
  "updatedBy": "admin@authmodule.com",
  
  // ✅ NEW: Display format helpers for UI
  "accessTokenExpiryDisplay": "30 minutes",
  "refreshTokenExpiryDisplay": "7.0 days", 
  "rememberMeTokenExpiryDisplay": "30.0 days"
}
```

### 💡 **UI Usage for Current Config:**
```tsx
interface TokenConfigResponse {
  accessTokenExpiryMinutes: number;     // For sliders/inputs
  refreshTokenExpiryDays: number;       // For sliders/inputs  
  rememberMeTokenExpiryDays: number;    // For sliders/inputs
  
  accessTokenExpiryDisplay: string;     // For display text
  refreshTokenExpiryDisplay: string;    // For display text
  rememberMeTokenExpiryDisplay: string; // For display text
}
```

### 2. Update Token Configuration
```http
PUT /api/admin/token-config
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "accessTokenExpiryMinutes": 15,
  "refreshTokenExpiryDays": 3,
  "rememberMeTokenExpiryDays": 14
}
```

**Validation Rules:**
- `accessTokenExpiryMinutes`: 1-60 minutes
- `refreshTokenExpiryDays`: 0.01-7 days (15 minutes to 1 week)
- `rememberMeTokenExpiryDays`: 0.1-30 days (2.4 hours to 1 month)

**Response:**
```json
{
  "message": "Token configuration updated successfully",
  "config": {
    "accessTokenExpiryMinutes": 15,
    "refreshTokenExpiryDays": 3,
    "rememberMeTokenExpiryDays": 14,
    
    // ✅ NEW: Display helpers
    "accessTokenExpiryDisplay": "15 minutes",
    "refreshTokenExpiryDisplay": "3.0 days",
    "rememberMeTokenExpiryDisplay": "14.0 days"
  },
  "warning": "This is a runtime configuration change. Restart the application to use original settings."
}
```

### ⚡ **Real-time Impact:**
- **Existing Users:** Continue with old token expiry times until natural expiry
- **New Logins:** Immediately use new configuration values
- **Token Refresh:** New access tokens use updated expiry times

### 3. Reset to Default Configuration
```http
POST /api/admin/token-config/reset
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Token configuration reset to default values",
  "config": {
    "accessTokenExpiryMinutes": 30,
    "refreshTokenExpiryDays": 7,
    "rememberMeTokenExpiryDays": 30,
    
    // ✅ Display helpers included
    "accessTokenExpiryDisplay": "30 minutes",
    "refreshTokenExpiryDisplay": "7.0 days",
    "rememberMeTokenExpiryDisplay": "30.0 days"
  }
}
```

### 4. Apply Preset Configuration
```http
POST /api/admin/token-config/preset/{presetName}
Authorization: Bearer {access_token}
```

**Available Presets:**
- `very-short`: Access 2min, Refresh 30min, Remember 2.4hrs
- `short`: Access 5min, Refresh 6hrs, Remember 1day
- `medium`: Access 15min, Refresh 1day, Remember 1week
- `long`: Access 1hr, Refresh 1week, Remember 1month

**Example:**
```http
POST /api/admin/token-config/preset/short
```

**Response:**
```json
{
  "message": "Applied 'short' preset successfully",
  "preset": "short",
  "config": {
    "accessTokenExpiryMinutes": 5,
    "refreshTokenExpiryDays": 0.25,
    "rememberMeTokenExpiryDays": 1,
    
    // ✅ Display helpers for UI
    "accessTokenExpiryDisplay": "5 minutes",
    "refreshTokenExpiryDisplay": "6.0 hours",
    "rememberMeTokenExpiryDisplay": "1.0 days"
  }
}
```

### 5. Get Available Presets
```http
GET /api/admin/token-config/presets
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Available token lifetime presets",
  "presets": {
    "very_short": { "access": "2 min", "refresh": "30 min", "remember": "2.4 hours" },
    "short": { "access": "5 min", "refresh": "6 hours", "remember": "1 day" },
    "medium": { "access": "15 min", "refresh": "1 day", "remember": "1 week" },
    "long": { "access": "1 hour", "refresh": "1 week", "remember": "1 month" }
  },
  "usage": "POST /api/admin/token-config/preset/{presetName}"
}
```

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden (Non-SuperAdmin)
```json
{
  "message": "Access denied. SuperAdmin role required."
}
```

### 400 Bad Request (Invalid Values)
```json
{
  "message": "Validation failed",
  "errors": {
    "accessTokenExpiryMinutes": "Must be between 1 and 60 minutes",
    "refreshTokenExpiryDays": "Must be between 0.01 and 7 days"
  }
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to update token configuration"
}
```

## 🎨 UI Component Suggestions

### 1. Token Configuration Form
```tsx
interface TokenConfigForm {
  accessTokenMinutes: number;     // Slider: 1-60 min
  refreshTokenDays: number;       // Slider: 0.01-7 days
  rememberMeTokenDays: number;    // Slider: 0.1-30 days
}

// ✅ NEW: Display current config with countdown timers
interface TokenConfigDisplay {
  config: TokenConfigResponse;
  isLive: boolean; // Show if config is runtime modified
}
```

### 2. Real-time Configuration Monitor
```tsx
function TokenConfigMonitor() {
  return (
    <div className="config-monitor">
      <div className="current-settings">
        <h3>Current Token Lifetimes</h3>
        <div className="token-info">
          <span>Access Token: {config.accessTokenExpiryDisplay}</span>
          <span>Refresh Token: {config.refreshTokenExpiryDisplay}</span>
          <span>Remember Me: {config.rememberMeTokenExpiryDisplay}</span>
        </div>
      </div>
      
      {/* ✅ NEW: Show impact on active users */}
      <div className="impact-warning">
        <h4>Impact on Users:</h4>
        <ul>
          <li>Existing tokens: Continue until natural expiry</li>
          <li>New logins: Use updated configuration immediately</li>
          <li>Token refresh: Apply new settings</li>
        </ul>
      </div>
    </div>
  );
}
```

### 3. Quick Preset Buttons with Live Preview
- Four preset buttons: Very Short, Short, Medium, Long
- Show current values next to each preset
- **✅ NEW:** Preview countdown timers for each preset

### 4. Current Configuration Display
- Show current settings in a card format
- Display last updated time and admin who made changes
- **✅ NEW:** Show runtime vs default configuration status

### 5. Warning Banner
- Show warning when configuration is modified at runtime
- Suggest application restart for permanent changes
- **✅ NEW:** Display countdown for when changes take effect

## 📱 Frontend Implementation Notes

### 1. **Authentication Check:** Verify user has `SuperAdmin` role before showing this UI

### 2. **Real-time Updates:** Refresh configuration after any changes

### 3. **Validation:** Client-side validation matching server rules

### 4. **Confirmation Dialogs:** Show confirmation for reset and preset applications

### 5. **Activity Logging:** Display who made changes and when

### 6. **✅ NEW: Token Countdown Integration**
```tsx
// Monitor current user's token expiry in real-time
function AdminTokenMonitor({ userTokens }: { userTokens: LoginResponse }) {
  return (
    <div className="admin-token-monitor">
      <h4>Your Current Session:</h4>
      <div className="token-timers">
        <div className="timer-item">
          <span>Access Token:</span>
          <Countdown 
            target={userTokens.accessTokenExpiresAt}
            format="mm:ss"
            onComplete={() => handleTokenRefresh()}
          />
        </div>
        <div className="timer-item">
          <span>Session:</span>
          <Countdown 
            target={userTokens.refreshTokenExpiresAt}
            format="d[d] h[h] mm[m]"
            onComplete={() => handleLogout()}
          />
        </div>
      </div>
    </div>
  );
}
```

### 7. **✅ NEW: Configuration Impact Visualization**
```tsx
// Show how config changes affect different user scenarios
function ConfigImpactPreview({ newConfig }: { newConfig: TokenConfigForm }) {
  const scenarios = [
    {
      user: "New Login User",
      accessExpiry: calculateExpiry(newConfig.accessTokenMinutes, 'minutes'),
      refreshExpiry: calculateExpiry(newConfig.refreshTokenDays, 'days'),
      impact: "immediate"
    },
    {
      user: "Existing Active User", 
      accessExpiry: "No change until natural expiry",
      refreshExpiry: "No change until refresh",
      impact: "delayed"
    }
  ];
  
  return (
    <div className="impact-preview">
      <h4>Configuration Impact Preview:</h4>
      {scenarios.map(scenario => (
        <div key={scenario.user} className="scenario">
          <h5>{scenario.user}</h5>
          <p>Access Token: {scenario.accessExpiry}</p>
          <p>Refresh Token: {scenario.refreshExpiry}</p>
          <span className={`impact-${scenario.impact}`}>
            {scenario.impact === 'immediate' ? '⚡ Immediate' : '⏱️ Delayed'}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## ⚡ Configuration Change Impact

### Immediate Effects
- **Existing Tokens:** Continue working until natural expiry (unchanged)
- **New Tokens:** Immediately use new configuration values
- **Refresh Operations:** Generate new tokens with updated settings

### User Impact Scenarios

**Scenario 1: Admin reduces token lifetime (1 day → 1 minute)**
```
Timeline:
09:00 - Current setting: 1 day expiry
09:30 - User A logs in → Token valid until 09:30 tomorrow
10:00 - Admin changes to 1 minute expiry  
10:30 - User B logs in → Token valid until 10:31 (1 minute later)
11:00 - User A still active (old token not affected)
11:00 - User A logout/login → New token valid until 11:01 (1 minute)
```

**Scenario 2: Token refresh with new settings**
- When any user refreshes their token, new access token uses current config
- Old refresh tokens remain valid until natural expiry
- New refresh tokens created with updated lifetime

### Recommendations
1. **Gradual Changes:** Avoid drastic reductions during peak hours
2. **User Notification:** Inform users about shorter session times
3. **Monitoring:** Track active sessions before making changes
4. **Rollback Plan:** Keep reset endpoint ready for emergencies

## 🔧 Testing Credentials & API Usage

### Login as SuperAdmin to access these APIs:
- **Username:** `admin`
- **Password:** `Admin@123`
- **Role:** `SuperAdmin`

### 📋 **Complete API Flow Example:**

#### 1. Login to get access token with countdown data:
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin@123",
  "rememberMe": true
}

# Response includes countdown timer data:
{
  "success": true,
  "accessToken": "eyJ...",
  "accessTokenExpiresAt": "2025-08-23T09:30:00Z",    # ← For countdown
  "refreshTokenExpiresAt": "2025-08-30T08:00:00Z",   # ← For countdown
  "rememberMeTokenExpiresAt": "2025-09-22T08:00:00Z" # ← For countdown
}
```

#### 2. Get current token configuration:
```bash
GET /api/admin/token-config
Authorization: Bearer {access_token}

# Response:
{
  "accessTokenExpiryMinutes": 30,
  "refreshTokenExpiryDays": 7,
  "rememberMeTokenExpiryDays": 30,
  "accessTokenExpiryDisplay": "30 minutes",    # ← For UI display
  "refreshTokenExpiryDisplay": "7.0 days",     # ← For UI display
  "rememberMeTokenExpiryDisplay": "30.0 days"  # ← For UI display
}
```

#### 3. Update configuration and see immediate impact:
```bash
PUT /api/admin/token-config
{
  "accessTokenExpiryMinutes": 5,
  "refreshTokenExpiryDays": 0.25,
  "rememberMeTokenExpiryDays": 1
}

# New logins will get:
# - Access token: 5 minutes
# - Refresh token: 6 hours 
# - Remember me: 1 day
```

### 🎯 **Frontend Integration Tips:**

1. **Store countdown data from login response**
2. **Fetch current config on admin page load**
3. **Update countdowns when config changes**
4. **Show impact warnings before applying changes**
5. **Refresh user's own countdown timers after config updates**
