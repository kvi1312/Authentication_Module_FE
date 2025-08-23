# Authentication Module API Documentation

## Overview

API cho hệ thống authentication với các tính năng quản lý user và role management. Hỗ trợ đầy đủ CRUD operations cho user profile và admin management.

## Base Information

- **Base URL**: `http://localhost:1312/api`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

---

## 1. Authentication Endpoints

### 1.1 Login

**Endpoint**: `POST /auth/login`

**Request Body**:

```json
{
  "username": "string",
  "password": "string",
  "rememberMe": boolean
}
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "refresh_token_here",
  "rememberMeToken": "remember_token_here",
  "accessTokenExpiresAt": "2025-08-23T15:30:00Z",
  "refreshTokenExpiresAt": "2025-09-23T15:30:00Z",
  "rememberMeTokenExpiresAt": "2025-11-23T15:30:00Z",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "isActive": true,
    "lastLoginAt": "2025-08-23T15:30:00Z",
    "createdDate": "2025-01-01T00:00:00Z",
    "roles": [2, 4], // Enum values: Admin=2, SuperAdmin=4
    "userType": 2 // Enum: EndUser=1, Admin=2, Partner=3
  },
  "sessionId": "session_guid_here"
}
```

### 1.2 Role Type Enum Reference

```typescript
enum RoleType {
  Customer = 1,
  Admin = 2,
  Manager = 3,
  SuperAdmin = 4,
  Employee = 5,
  Partner = 6,
  Guest = 7,
}

enum UserType {
  EndUser = 1,
  Admin = 2,
  Partner = 3,
}
```

---

## 2. User Profile Management

### 2.1 Get Current User Profile

**Endpoint**: `GET /user/profile`  
**Authorization**: Required (Any authenticated user)

**Response**:

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "isActive": true,
    "lastLoginAt": "2025-08-23T15:30:00Z",
    "createdDate": "2025-01-01T00:00:00Z",
    "roles": [1, 3], // Customer=1, Manager=3
    "userType": 1 // EndUser
  }
}
```

**UI Implementation Notes**:

- Display user info in profile page
- Show role badges based on enum values
- Convert enum to readable text for display

### 2.2 Update User Profile

**Endpoint**: `PUT /user/profile`  
**Authorization**: Required (Any authenticated user)

**Request Body**:

```json
{
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    // Updated user object same as above
  }
}
```

**UI Form Fields**:

- Email (required, email validation)
- First Name (required, 2-50 characters)
- Last Name (required, 2-50 characters)

---

## 3. Admin User Management

### 3.1 Get Users List (Admin Only)

**Endpoint**: `GET /user/all`  
**Authorization**: Required (Admin or SuperAdmin roles)

**Query Parameters**:

```
?pageNumber=1&pageSize=10&searchTerm=john&userType=1&roleFilter=2
```

**Parameters**:

- `pageNumber` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10, max: 50)
- `searchTerm` (optional): Search in username, email, firstName, lastName
- `userType` (optional): Filter by UserType enum (1=EndUser, 2=Admin, 3=Partner)
- `roleFilter` (optional): Filter by RoleType enum

**Response**:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "isActive": true,
      "lastLoginAt": "2025-08-23T15:30:00Z",
      "createdDate": "2025-01-01T00:00:00Z",
      "roles": [1, 3],
      "userType": 1
    }
  ],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

**UI Implementation**:

- Data table with pagination
- Search box for real-time filtering
- Dropdown filters for UserType and RoleType
- Role badges for each user
- Actions column with Edit/Manage buttons

### 3.2 Get Specific User (Admin Only)

**Endpoint**: `GET /user/{userId}`  
**Authorization**: Required (Admin or SuperAdmin roles)

**Response**: Same as user profile format

### 3.3 Add Roles to User (Admin Only)

**Endpoint**: `POST /user/{userId}/roles/add`  
**Authorization**: Required (Admin or SuperAdmin roles)

**Request Body**:

```json
{
  "rolesToAdd": [3, 5] // Manager=3, Employee=5
}
```

**Response**:

```json
{
  "success": true,
  "message": "Successfully added roles: Manager, Employee",
  "user": {
    // Updated user object with new roles
  }
}
```

**UI Implementation**:

- Multi-select dropdown with available roles
- Show current user roles (disabled/checked)
- Confirmation dialog before adding

### 3.4 Remove Roles from User (Admin Only)

**Endpoint**: `POST /user/{userId}/roles/remove`  
**Authorization**: Required (Admin or SuperAdmin roles)

**Request Body**:

```json
{
  "rolesToRemove": [1, 3] // Customer=1, Manager=3
}
```

**Response**:

```json
{
  "success": true,
  "message": "Successfully removed roles: Customer, Manager",
  "user": {
    // Updated user object with removed roles
  }
}
```

---

## 4. Frontend Integration Guide

### 4.1 Role Display Mapping

```typescript
const roleDisplayMap = {
  1: { name: "Customer", color: "blue", icon: "user" },
  2: { name: "Admin", color: "red", icon: "shield" },
  3: { name: "Manager", color: "green", icon: "briefcase" },
  4: { name: "Super Admin", color: "purple", icon: "crown" },
  5: { name: "Employee", color: "gray", icon: "id-card" },
  6: { name: "Partner", color: "orange", icon: "handshake" },
  7: { name: "Guest", color: "light-gray", icon: "eye" },
};

const userTypeDisplayMap = {
  1: { name: "End User", color: "blue" },
  2: { name: "Admin", color: "red" },
  3: { name: "Partner", color: "green" },
};
```

### 4.2 Permission Checking

```typescript
// Check if user has admin permissions
const hasAdminAccess = (userRoles: number[]) => {
  return userRoles.includes(2) || userRoles.includes(4); // Admin or SuperAdmin
};

// Check specific role
const hasRole = (userRoles: number[], roleType: RoleType) => {
  return userRoles.includes(roleType);
};
```

### 4.3 Error Handling

```typescript
interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Common error responses
{
  "success": false,
  "message": "User not found"
}

{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "First name must be between 2 and 50 characters"
  ]
}
```

---

## 5. UI Components Recommendations

### 5.1 User Profile Page

**Components needed**:

- Profile info display card
- Edit profile form modal
- Role badges component
- Last login info

### 5.2 Admin Users Management Page

**Components needed**:

- Users data table with pagination
- Search and filter bar
- Role management modal
- User details modal
- Bulk actions (future feature)

### 5.3 Role Management Modal

**Features**:

- Current roles display (with remove option)
- Available roles multi-select
- Add/Remove role actions
- Confirmation dialogs

### 5.4 Data Table Columns

```typescript
const userTableColumns = [
  { key: "username", title: "Username", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "fullName", title: "Full Name", sortable: true },
  { key: "roles", title: "Roles", render: "badges" },
  { key: "userType", title: "Type", render: "badge" },
  { key: "isActive", title: "Status", render: "status" },
  { key: "lastLoginAt", title: "Last Login", render: "date" },
  { key: "actions", title: "Actions", render: "actions" },
];
```

---

## 6. Sample API Calls

### 6.1 Get Users with Filters

```javascript
// Get admin users with pagination
fetch("/api/user/all?pageNumber=1&pageSize=10&userType=2", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    // Handle user list data
  });
```

### 6.2 Update User Profile

```javascript
fetch("/api/user/profile", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "newemail@example.com",
    firstName: "John",
    lastName: "Smith",
  }),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      // Update UI with new user data
    }
  });
```

### 6.3 Add Roles to User

```javascript
fetch(`/api/user/${userId}/roles/add`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    rolesToAdd: [3, 5], // Manager and Employee
  }),
})
  .then((response) => response.json())
  .then((data) => {
    // Refresh user data or update UI
  });
```

---

## 7. Authentication Flow Integration

### 7.1 Login Flow

1. User submits login form
2. Call `/auth/login` endpoint
3. Store `accessToken` for API calls
4. Store user data for permission checking
5. Redirect based on user roles

### 7.2 Profile Management Flow

1. Load user profile on page mount
2. Show edit form with current values
3. Validate form data
4. Submit update request
5. Update UI with new data

### 7.3 Admin Management Flow

1. Check if user has admin permissions
2. Load users list with default pagination
3. Implement search/filter functionality
4. Handle role management actions
5. Refresh data after changes

---

## 8. Security Notes

- **Authorization**: All endpoints require valid JWT token
- **Role-based Access**: Admin endpoints check for Admin/SuperAdmin roles
- **Input Validation**: Server validates all input data
- **Token Management**: Handle token expiration gracefully
- **HTTPS**: Use HTTPS in production
- **CORS**: Configure proper CORS settings

---

## 9. Status Codes

- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/expired token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (user/resource not found)
- **500**: Internal Server Error

---

Này là documentation đầy đủ cho team Frontend để implement UI. Có questions gì về specific endpoints hay cần thêm thông tin gì không?
