# EduLite Nexus Backend

A robust Node.js/Express backend for the School Management System with comprehensive error handling and environment management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd Backend
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📁 Project Structure

```
Backend/
├── index.js          # Main server file
├── start.js          # Startup script with environment validation
├── package.json      # Dependencies and scripts
├── .env              # Environment variables (auto-created)
├── edulite.db        # SQLite database (auto-created)
└── README.md         # This file
```

## 🔧 Environment Variables

The backend automatically creates a `.env` file with default values on first run:

```env
JWT_SECRET=your-super-secret-jwt-key-for-development-only
PORT=4000
DB_PATH=edulite.db
```

**⚠️ Important**: Update `JWT_SECRET` with a secure value for production!

## 🛠️ Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run start:direct` - Start server directly (bypasses start.js)
- `npm run check` - Check environment variables
- `npm run setup` - Run startup script

## 🔍 Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors
**Problem**: Missing dependencies
**Solution**: 
```bash
npm install
```

#### 2. "Missing required environment variables"
**Problem**: JWT_SECRET not set
**Solution**: 
```bash
npm run check  # Check current env vars
# Edit .env file and set JWT_SECRET
```

#### 3. "Database file not found"
**Problem**: Database doesn't exist
**Solution**: The database is created automatically on first run

#### 4. "Port already in use"
**Problem**: Another process using port 4000
**Solution**: 
```bash
# Change PORT in .env file
PORT=4001
```

#### 5. Server starts then exits immediately
**Problem**: Environment validation failing
**Solution**: 
```bash
npm run check  # Check environment
npm run start  # Use startup script
```

### Useful Commands

```bash
# Check environment variables
npm run check

# Start server directly (bypasses start.js)
npm run start:direct

# Check if server is running
curl http://localhost:4000/health
```

## 📚 API Documentation

Once the server is running, visit:
- **API Docs**: http://localhost:4000/docs
- **Health Check**: http://localhost:4000/health

## 🔐 Security Features

- JWT-based authentication
- Rate limiting on login endpoints
- CORS protection
- Input validation with Joi
- SQL injection protection with prepared statements

## 🗄️ Database

- **Type**: SQLite (better-sqlite3)
- **File**: edulite.db (auto-created)
- **Schema**: Automatically created on first run
- **Tables**: students, teachers, users, classes, subjects, etc.

## 🚨 Error Handling

The backend includes comprehensive error handling:
- Environment variable validation
- Database connection error handling
- API input validation
- Graceful shutdown on SIGTERM/SIGINT
- Audit logging for security events

## 💡 Development Tips

1. **Always use `npm run dev` for development** - includes hot reload
2. **Check environment with `npm run check`** before starting
3. **Use the startup script** (`npm start`) for production
4. **Monitor the audit.log** for security events
5. **Test API endpoints** using the Swagger docs

## 🔄 Integration with Frontend

The backend is designed to work seamlessly with the React frontend:
- CORS configured for localhost development
- JWT tokens for authentication
- RESTful API design
- Comprehensive error responses

## 📝 Logging

- **Console**: Server startup, errors, and important events
- **Audit Log**: Security events and user actions
- **Database**: All data changes are logged

## 🚀 Deployment

For production deployment:
1. Set secure `JWT_SECRET`
2. Configure proper CORS origins
3. Use environment-specific database path
4. Set up proper logging
5. Configure rate limiting for production load 