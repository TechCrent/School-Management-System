#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if we're in the right directory
if (!fs.existsSync('index.js')) {
  console.error('❌ Error: index.js not found in current directory');
  console.error('Please run this script from the Backend directory');
  process.exit(1);
}

// Check if .env exists, create template if not
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env template...');
  const envTemplate = `JWT_SECRET=your-super-secret-jwt-key-for-development-only
PORT=4000
DB_PATH=edulite.db
`;
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file with default values');
  console.log('⚠️  Please update JWT_SECRET with a secure value for production');
}

// Load environment variables
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

// Check database file
const dbPath = process.env.DB_PATH || 'edulite.db';
if (!fs.existsSync(dbPath)) {
  console.log('📊 Database file not found, will be created on first run');
}

console.log('🚀 Starting EduLite Nexus Backend...');
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Missing!'}`);
console.log(`💾 Database: ${dbPath}\n`);

// Start the server
require('./index.js'); 