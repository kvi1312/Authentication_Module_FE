# Authentication Module Frontend

A modern React-based authentication and user management system with role-based access control.

![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.1.3-purple.svg)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5-red.svg)

## ✨ Key Features

- **Multi-role Authentication** - JWT-based auth with 7 hierarchical roles
- **Admin Dashboard** - Complete user and role management interface
- **Real-time Updates** - Live data synchronization without page reload
- **Responsive Design** - Mobile-first UI with Ant Design components
- **Docker Ready** - Production deployment with Nginx

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Ant Design 5
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite with HMR support

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── admin/        # Admin management
│   ├── auth/         # Authentication
│   ├── common/       # Shared components
│   └── layout/       # Layout components
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

## � Role System

| Role       | Level | Access             |
| ---------- | ----- | ------------------ |
| SuperAdmin | 4     | Full system access |
| Admin      | 2     | User management    |
| Manager    | 3     | Team management    |
| Employee   | 5     | Standard access    |
| Partner    | 6     | Partner features   |
| Customer   | 1     | Basic features     |
| Guest      | 7     | Read-only          |

## 🐳 Docker Deployment

```bash
# Windows
.\docker.bat start

# Linux/Mac
./docker.sh start

# Access: http://localhost:3000
```

## ⚙️ Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:1312
VITE_APP_NAME=Authentication Module
```

## 🛠️ Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build
```

## 🔧 API Integration

- **Authentication**: `/api/auth/*` endpoints
- **User Management**: `/api/user/*` endpoints
- **Admin Features**: `/api/admin/*` endpoints
- **Proxy**: Vite dev server proxies `/api/*` to backend

## � Requirements

- Node.js 20.19+ or 22.12+
- Backend API running on port 1312
- Modern browser with ES6+ support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

---

**Built with React + TypeScript + Ant Design**
