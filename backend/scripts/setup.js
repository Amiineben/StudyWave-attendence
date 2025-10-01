#!/usr/bin/env node

/**
 * Setup script for StudyWave Backend
 * This script helps initialize the backend with demo data and configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🚀 StudyWave Backend Setup\n');
  
  // Check if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating environment configuration...\n');
    
    // Get user input for configuration
    const mongoUri = await question('MongoDB URI (default: mongodb://localhost:27017/studywave): ') || 'mongodb://localhost:27017/studywave';
    const jwtSecret = await question('JWT Secret (leave empty to generate): ') || generateRandomSecret();
    const port = await question('Server Port (default: 5000): ') || '5000';
    const frontendUrl = await question('Frontend URL (default: http://localhost:3000): ') || 'http://localhost:3000';
    const seedDatabase = await question('Seed database with demo data? (y/N): ');
    
    // Create .env file
    const envContent = `# StudyWave Backend Configuration
NODE_ENV=development
PORT=${port}

# Database Configuration
MONGODB_URI=${mongoUri}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Frontend Configuration
FRONTEND_URL=${frontendUrl}

# Seeding
SEED_DATABASE=${seedDatabase.toLowerCase() === 'y' ? 'true' : 'false'}

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file created successfully!\n');
  } else {
    console.log('✅ Environment file already exists\n');
  }
  
  // Create necessary directories
  const directories = ['logs', 'uploads', 'temp'];
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Create .gitignore if it doesn't exist
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Uploads and temporary files
uploads/
temp/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Build outputs
dist/
build/
`;
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('📝 Created .gitignore file\n');
  }
  
  console.log('🎉 Setup completed successfully!\n');
  console.log('Next steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Start MongoDB service');
  console.log('3. Run the server: npm run dev');
  console.log('4. Visit http://localhost:' + (process.env.PORT || '5000') + '/api/health to check status\n');
  
  rl.close();
}

function generateRandomSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});

// Run setup
setupEnvironment().catch(console.error);
