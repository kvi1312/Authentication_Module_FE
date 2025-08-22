# 🚀 Authentication API - Auto-Detect UserType Implementation

## 📢 **Major Update Announcement:**

Team đã quyết định **IMPLEMENT tính năng Auto-Detect UserType** để cải thiện UX và modernize authentication system. Đây là breakthrough improvement cho user experience!

## 🎯 **Why Auto-Detect?**

1. **Better UX** - Users không cần biết họ thuộc loại nào
2. **Simplified UI** - Loại bỏ confusing dropdowns
3. **Modern approach** - Follow industry best practices
4. **Security improvement** - Prevent self-assignment của admin roles
5. **Performance** - Strategy pattern vẫn hiệu quả với caching

## 🔄 **New API Endpoints (Auto-Detect Enabled):**

### **Authentication Endpoints:**

#### **1. Login Endpoint (Auto-Detect UserType)**
```
POST /api/auth/login
```

**❌ OLD (Confusing):**
```
POST /api/auth/login/0  # Admin
POST /api/auth/login/1  # Partner  
POST /api/auth/login/2  # EndUser
```

**✅ NEW (Simple):**
```
POST /api/auth/login    # Auto-detect user type
```

**Request Body (Simplified):**
```typescript
interface LoginRequest {
  username: string;          // Required - email or username
  password: string;          // Required - user password  
  rememberMe: boolean;       // Optional - extends token life
  // UserType REMOVED - auto-detected by backend!
}
```

**Success Response (200):**
```typescript
interface LoginResponse {
  success: boolean;          // Always true for 200
  message: string;           // "Login successful"
  accessToken: string;       // JWT access token
  refreshToken?: string;     // May be null if HTTP-only cookies
  expiresAt: string;         // ISO date string
  sessionId?: string;        // Session identifier
  user: {
    id: string;              // User UUID
    username: string;        // Username
    email: string;           // Email address
    firstName: string;       // First name
    lastName: string;        // Last name
    fullName: string;        // "firstName lastName"
    isActive: boolean;       // Account status
    lastLoginAt?: string;    // ISO date string
    createdDate: string;     // ISO date string
    roles: string[];         // User roles array
    userType: UserType;      // ✅ DETECTED by backend (0=Admin, 1=Partner, 2=EndUser)
  };
}
```

**Error Response (400/401):**
```typescript
interface ApiErrorResponse {
  success: false;
  message: string;           // "Invalid credentials" (no user type mismatch)
  errors?: {                 // Validation errors (optional)
    [field: string]: string[];
  };
}
```

#### **2. Register Endpoint (EndUser Only for Public)**
```
POST /api/auth/register
```

**Request Body (Simplified & Secure):**
```typescript
interface RegisterRequest {
  username: string;          // Required - unique username
  email: string;            // Required - valid email
  password: string;         // Required - min 8 chars
  confirmPassword: string;  // Required - must match password
  firstName: string;        // Required
  lastName: string;         // Required
  // UserType REMOVED - always creates EndUser for security!
  // Admin/Partner accounts must be created by Admin via separate endpoint
}
```

**Success Response (201):**
```typescript
interface RegisterResponse {
  success: boolean;          // Always true for 201
  message: string;           // "Registration successful. You can now login."
  user: {
    id: string;              // New user UUID
    username: string;        // Username
    email: string;           // Email
    firstName: string;       // First name
    lastName: string;        // Last name
    fullName: string;        // Full name
    userType: UserType;      // Always EndUser (2) for public registration
    isActive: boolean;       // Account status
    createdDate: string;     // ISO date string
    roles: string[];         // ["EndUser"] - default role
  };
}
```

#### **3. Other Endpoints (Unchanged)**
```
POST /api/auth/logout               # Logout user
POST /api/auth/refresh-token        # Refresh access token
GET  /api/admin/token-config        # Get token configuration
PUT  /api/admin/token-config        # Update token configuration
```

## 🎨 **Frontend Implementation (Simplified):**

### **1. Login Form (NO Dropdown Needed!)**

```typescript
// Login Component - Much cleaner!
const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
    // No userType needed! 🎉
  });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Simple API call - no userType parameter!
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      // Backend tells us what user type they are
      console.log('Logged in as:', response.data.user.userType);
      console.log('User roles:', response.data.user.roles);
      
      // Handle success based on detected user type
      redirectBasedOnUserType(response.data.user.userType);
      
    } catch (error) {
      console.error('Login failed:', error.response?.data);
    }
  };

  const redirectBasedOnUserType = (userType: UserType) => {
    switch (userType) {
      case UserType.Admin:
        router.push('/admin/dashboard');
        break;
      case UserType.Partner:
        router.push('/partner/dashboard');
        break;
      case UserType.EndUser:
        router.push('/dashboard');
        break;
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* ✅ Clean, simple form - no confusing dropdown! */}
      
      <div>
        <input
          type="text"
          placeholder="Email or Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
          />
          Remember Me
        </label>
      </div>
      
      <button type="submit">Sign In</button>
      
      {/* Clear messaging for different user types */}
      <div className="help-text">
        <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        <p>Admin or Partner? Use your organization credentials above.</p>
      </div>
    </form>
  );
};
```

### **2. Register Form (EndUser Only - Secure)**

```typescript
// Register Component - Public registration for EndUsers only
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
    // No userType - always EndUser for security!
  });

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await authService.register(formData);
      console.log('Registration successful:', response.data);
      
      // Show success message and redirect to login
      showSuccessMessage('Registration successful! Please login with your credentials.');
      router.push('/login');
      
    } catch (error) {
      console.error('Registration failed:', error.response?.data);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Create Your Account</h2>
      <p>Sign up as an End User. Admin and Partner accounts are created by administrators.</p>
      
      <div>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          required
        />
      </div>
      
      <button type="submit">Create Account</button>
      
      <div className="help-text">
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
        <p>Need an Admin or Partner account? Contact your administrator.</p>
      </div>
    </form>
  );
};
```

### **3. Auth Service Implementation (Simplified)**

```typescript
// authService.ts - Much cleaner implementation!
import apiClient from './api';

export enum UserType {
  Admin = 0,
  Partner = 1,
  EndUser = 2
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
  // UserType removed - auto-detected!
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  // UserType removed - always EndUser!
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  sessionId?: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdDate: string;
    roles: string[];
    userType: UserType; // Detected by backend
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    userType: UserType; // Always EndUser
    isActive: boolean;
    createdDate: string;
    roles: string[];
  };
}

export class AuthService {
  // ✅ Simplified login - no userType parameter!
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/login', credentials);
    
    // Store tokens and user info
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userType', response.data.user.userType.toString());
      localStorage.setItem('userRoles', JSON.stringify(response.data.user.roles));
    }
    
    return response.data;
  }

  // ✅ Simplified register - always EndUser
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userRoles');
    }
  }

  // Refresh token
  static async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/refresh-token');
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  }

  // ✅ Get detected user type
  static getCurrentUserType(): UserType | null {
    const userType = localStorage.getItem('userType');
    return userType ? Number(userType) as UserType : null;
  }

  // ✅ Check user roles
  static getUserRoles(): string[] {
    const roles = localStorage.getItem('userRoles');
    return roles ? JSON.parse(roles) : [];
  }

  // ✅ Role-based access control
  static hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  static isAdmin(): boolean {
    return this.getCurrentUserType() === UserType.Admin;
  }

  static isPartner(): boolean {
    return this.getCurrentUserType() === UserType.Partner;
  }

  static isEndUser(): boolean {
    return this.getCurrentUserType() === UserType.EndUser;
  }

  // Check if authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }
}
```

### **4. Route Protection Based on Detected UserType**

```typescript
// ProtectedRoute.tsx
import { AuthService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedUserTypes?: UserType[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  allowedUserTypes 
}) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const userType = AuthService.getCurrentUserType();
  const userRoles = AuthService.getUserRoles();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check user type access
  if (allowedUserTypes && userType !== null) {
    if (!allowedUserTypes.includes(userType)) {
      return <Navigate to="/unauthorized" />;
    }
  }

  // Check role-based access
  if (allowedRoles) {
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};

// Usage examples
const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/register" element={<RegisterForm />} />
    
    {/* Admin routes */}
    <Route 
      path="/admin/*" 
      element={
        <ProtectedRoute allowedUserTypes={[UserType.Admin]}>
          <AdminDashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* Partner routes */}
    <Route 
      path="/partner/*" 
      element={
        <ProtectedRoute allowedUserTypes={[UserType.Partner]}>
          <PartnerDashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* EndUser routes */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute allowedUserTypes={[UserType.EndUser]}>
          <UserDashboard />
        </ProtectedRoute>
      } 
    />
  </Routes>
);
```

## 🔧 **Environment Configuration (Unchanged)**

```bash
# .env
VITE_API_BASE_URL=http://localhost:1312
VITE_APP_NAME=Authentication Module
VITE_TOKEN_REFRESH_THRESHOLD=300000
```

## 📝 **Testing Information**

### **Available Test Users:**
```
Admin:
- Username: admin
- Password: Admin@123
- Will be detected as: UserType.Admin (0)

Partner:
- Username: partner  
- Password: Partner@123
- Will be detected as: UserType.Partner (1)

End User:
- Username: user
- Password: User@123  
- Will be detected as: UserType.EndUser (2)
```

### **Sample API Calls:**
```bash
# ✅ NEW - Auto-detect login (any user type)
curl -X POST http://localhost:1312/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123",
    "rememberMe": false
  }'

# ✅ NEW - Register EndUser only
curl -X POST http://localhost:1312/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@test.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "firstName": "New",
    "lastName": "User"
  }'
```

## 🏆 **Benefits of Auto-Detect Implementation:**

### ✅ **User Experience:**
- **No confusing dropdowns** - users just enter credentials
- **Faster login process** - fewer steps
- **Intuitive flow** - like modern apps (Gmail, Facebook, etc.)
- **Clear error messages** - "Invalid credentials" instead of "user type mismatch"

### ✅ **Security Improvements:**
- **No self-assignment** of admin roles in registration
- **Public registration = EndUser only** (secure by default)
- **Admin/Partner creation** requires admin privileges
- **Clear audit trail** with detected user types

### ✅ **Developer Experience:**
- **Simpler frontend code** - no userType management in forms
- **Cleaner API** - single login endpoint
- **Better business logic** - follows real-world patterns
- **Easier testing** - fewer combinations to test

### ✅ **Maintainability:**
- **Less UI complexity** - no dropdown state management
- **Fewer edge cases** - no user type validation on frontend
- **Strategy pattern** still efficient with backend caching
- **Future-proof** - easy to add new user types

## ⚠️ **Important Notes:**

1. **UserType is auto-detected** - không cần dropdown trong login form
2. **Public registration = EndUser only** - for security
3. **Admin/Partner accounts** must be created by Admin via separate endpoint
4. **Backend detects and returns** userType in response
5. **CORS is enabled** for all origins
6. **Backend running** on `http://localhost:1312`

## 🎯 **Action Items for Frontend:**

- [ ] **Remove UserType dropdowns** from login form ✅ Major UX improvement
- [ ] **Remove UserType dropdown** from register form ✅ Security improvement  
- [ ] **Update AuthService** to use simplified `/api/auth/login` endpoint
- [ ] **Implement role-based routing** using detected userType from response
- [ ] **Update UI messaging** to reflect "public registration = EndUser"
- [ ] **Test auto-detection** with all user types (Admin, Partner, EndUser)
- [ ] **Implement proper error handling** for simplified error responses

---

**🚀 Experience the future of authentication - Simple, Secure, and User-Friendly!** 

**Backend is ready with auto-detect enabled. Frontend will be much cleaner and more intuitive!** ✨

### **Authentication Endpoints:**

#### **1. Login Endpoint (WITH UserType)**
```
POST /api/auth/login/{userType}
```

**Path Parameters:**
- `userType` (required): 0=Admin, 1=Partner, 2=EndUser

**Request Body:**
```typescript
interface LoginRequest {
  username: string;          // Required - email or username
  password: string;          // Required - user password  
  rememberMe: boolean;       // Optional - extends token life
  deviceInfo?: string;       // Optional - auto-populated
  ipAddress?: string;        // Optional - auto-populated
}
```

**Success Response (200):**
```typescript
interface LoginResponse {
  success: boolean;          // Always true for 200
  message: string;           // Success message
  accessToken: string;       // JWT access token
  refreshToken?: string;     // May be null if HTTP-only cookies
  expiresAt: string;         // ISO date string
  sessionId?: string;        // Session identifier
  user: {
    id: string;              // User UUID
    username: string;        // Username
    email: string;           // Email address
    firstName: string;       // First name
    lastName: string;        // Last name
    fullName: string;        // "firstName lastName"
    isActive: boolean;       // Account status
    lastLoginAt?: string;    // ISO date string
    createdDate: string;     // ISO date string
    roles: string[];         // User roles array
    userType: UserType;      // 0=Admin, 1=Partner, 2=EndUser
  };
}
```

**Error Response (400/401):**
```typescript
interface ApiErrorResponse {
  success: false;
  message: string;           // Error description
  errors?: {                 // Validation errors (optional)
    [field: string]: string[];
  };
}
```

#### **2. Register Endpoint (WITH UserType)**
```
POST /api/auth/register
```

**Request Body:**
```typescript
interface RegisterRequest {
  username: string;          // Required - unique username
  email: string;            // Required - valid email
  password: string;         // Required - min 8 chars
  confirmPassword: string;  // Required - must match password
  firstName: string;        // Required
  lastName: string;         // Required
  userType: UserType;       // Required - 0=Admin, 1=Partner, 2=EndUser
}
```

**Success Response (201):**
```typescript
interface RegisterResponse {
  success: boolean;          // Always true for 201
  message: string;           // Success message
  user: {
    id: string;              // New user UUID
    username: string;        // Username
    email: string;           // Email
    firstName: string;       // First name
    lastName: string;        // Last name
    fullName: string;        // Full name
    userType: UserType;      // Registered user type
    isActive: boolean;       // Account status
    createdDate: string;     // ISO date string
    roles: string[];         // Assigned roles
  };
}
```

#### **3. Other Endpoints (Unchanged)**
```
POST /api/auth/logout               # Logout user
POST /api/auth/refresh-token        # Refresh access token
GET  /api/admin/token-config        # Get token configuration
PUT  /api/admin/token-config        # Update token configuration
```

## 🎨 **Frontend Implementation Required:**

### **1. Login Form with UserType Dropdown**

```typescript
// Login Component
const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: UserType.EndUser, // Default to EndUser
    rememberMe: false
  });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Call login API with userType in URL
      const response = await authService.login(
        formData.userType, 
        {
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe
        }
      );
      
      // Handle success
      console.log('Login successful:', response.data);
      
    } catch (error) {
      // Handle error
      console.error('Login failed:', error.response?.data);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>User Type:</label>
        <select 
          value={formData.userType} 
          onChange={(e) => setFormData({...formData, userType: Number(e.target.value)})}
          required
        >
          <option value={UserType.EndUser}>End User</option>
          <option value={UserType.Partner}>Partner</option>
          <option value={UserType.Admin}>Admin</option>
        </select>
      </div>
      
      <div>
        <input
          type="text"
          placeholder="Username or Email"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
          />
          Remember Me
        </label>
      </div>
      
      <button type="submit">Login</button>
    </form>
  );
};
```

### **2. Register Form with UserType Dropdown**

```typescript
// Register Component
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: UserType.EndUser // Default to EndUser
  });

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await authService.register(formData);
      console.log('Registration successful:', response.data);
      
      // Redirect to login or show success message
      
    } catch (error) {
      console.error('Registration failed:', error.response?.data);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div>
        <label>Account Type:</label>
        <select 
          value={formData.userType} 
          onChange={(e) => setFormData({...formData, userType: Number(e.target.value)})}
          required
        >
          <option value={UserType.EndUser}>End User</option>
          <option value={UserType.Partner}>Partner</option>
          <option value={UserType.Admin}>Admin</option>
        </select>
      </div>
      
      <div>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          required
        />
      </div>
      
      <div>
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          required
        />
      </div>
      
      <button type="submit">Register</button>
    </form>
  );
};
```

### **3. Auth Service Implementation**

```typescript
// authService.ts
import apiClient from './api';

export enum UserType {
  Admin = 0,
  Partner = 1,
  EndUser = 2
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  sessionId?: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdDate: string;
    roles: string[];
    userType: UserType;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    userType: UserType;
    isActive: boolean;
    createdDate: string;
    roles: string[];
  };
}

export class AuthService {
  // Login with specific user type
  static async login(userType: UserType, credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post(`/api/auth/login/${userType}`, credentials);
    
    // Store access token
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userType', userType.toString());
    }
    
    return response.data;
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userType');
    }
  }

  // Refresh token
  static async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/refresh-token');
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  }

  // Get current user type
  static getCurrentUserType(): UserType | null {
    const userType = localStorage.getItem('userType');
    return userType ? Number(userType) as UserType : null;
  }

  // Check if authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }
}
```

### **4. API Client Configuration**

```typescript
// api.ts  
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1312';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = refreshResponse.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userType');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

## 🔧 **Environment Configuration**

```bash
# .env
VITE_API_BASE_URL=http://localhost:1312
VITE_APP_NAME=Authentication Module
VITE_TOKEN_REFRESH_THRESHOLD=300000
```

## 📝 **Testing Information**

### **Available Test Users:**
```
Admin:
- Username: admin
- Password: Admin@123
- UserType: 0 (Admin)

Partner:
- Username: partner  
- Password: Partner@123
- UserType: 1 (Partner)

End User:
- Username: user
- Password: User@123  
- UserType: 2 (EndUser)
```

### **Sample API Calls:**
```bash
# Login as Admin
curl -X POST http://localhost:1312/api/auth/login/0 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123",
    "rememberMe": false
  }'

# Register new EndUser
curl -X POST http://localhost:1312/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@test.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "firstName": "New",
    "lastName": "User",
    "userType": 2
  }'
```

## ⚠️ **Important Notes:**

1. **UserType is REQUIRED** in login URL path parameter
2. **UserType dropdown** must be implemented in both login and register forms  
3. **CORS is enabled** for all origins
4. **Backend running** on `http://localhost:1312`
5. **Remember to handle validation errors** from API responses
6. **Store userType** in localStorage for session management

## 🎯 **Action Items for Frontend:**

- [ ] Add UserType dropdown to login form
- [ ] Add UserType dropdown to register form  
- [ ] Update AuthService to use `/login/{userType}` endpoint
- [ ] Implement proper error handling for validation
- [ ] Store and manage userType in localStorage
- [ ] Test all user types (Admin, Partner, EndUser)
- [ ] Update TypeScript interfaces with exact API response structure

---

**Backend API is ready and waiting for frontend implementation!** 🚀
