#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Starting production build for cPanel deployment...\n');

// Helper functions for file operations
async function copyFile(src, dest) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.copyFile(src, dest);
}

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function writeJsonFile(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function buildDist() {
  try {
    // Clean dist directory
    console.log('🧹 Cleaning dist directory...');
    if (fs.existsSync(path.join(rootDir, 'dist'))) {
      await fs.promises.rm(path.join(rootDir, 'dist'), { recursive: true });
    }
    await fs.promises.mkdir(path.join(rootDir, 'dist'), { recursive: true });

    // Build frontend
    console.log('🔨 Building frontend...');
    await execAsync('npm run build --prefix frontend', { cwd: rootDir });
    
    // Copy frontend build to dist
    console.log('📁 Copying frontend build...');
    await copyDir(
      path.join(rootDir, 'frontend', 'dist'),
      path.join(rootDir, 'dist', 'public')
    );

    // Create backend structure
    console.log('🔧 Setting up backend...');
    await fs.promises.mkdir(path.join(rootDir, 'dist', 'backend'), { recursive: true });

    // Copy backend files
    const backendFiles = [
      'khalti.js',
      'tsconfig.node.json'
    ];

    for (const file of backendFiles) {
      await copyFile(
        path.join(rootDir, 'backend', file),
        path.join(rootDir, 'dist', 'backend', file)
      );
    }

    // Copy services from frontend/src/services
    console.log('📋 Copying services...');
    await fs.promises.mkdir(path.join(rootDir, 'dist', 'services'), { recursive: true });

    const serviceFiles = [
      'geminiProxy.js',
      'nlp_recommendation_service.py'
    ];

    for (const file of serviceFiles) {
      await copyFile(
        path.join(rootDir, 'frontend', 'src', 'services', file),
        path.join(rootDir, 'dist', 'services', file)
      );
    }

    // Create production package.json
    console.log('📦 Creating production package.json...');
    const prodPackageJson = await createProductionPackageJson();
    await writeJsonFile(
      path.join(rootDir, 'dist', 'package.json'),
      prodPackageJson
    );

    // Copy environment files
    console.log('🔐 Setting up environment...');
    await copyFile(
      path.join(rootDir, 'frontend', '.env'),
      path.join(rootDir, 'dist', '.env')
    );

    // Copy server files
    console.log('🖥️ Copying server files...');
    await copyFile(
      path.join(rootDir, 'scripts', 'cpanel-server.js'),
      path.join(rootDir, 'dist', 'server.js')
    );

    // Create simple server (default)
    console.log('🔧 Creating simple server...');
    await createSimpleServer();

    // Create .htaccess for Apache servers (SPA routing support)
    console.log('🔧 Creating .htaccess for SPA routing...');
    await createHtaccessFile();

    // Create production scripts (optional - main server handles everything)
    console.log('📜 Creating production scripts...');
    // await createProductionScripts(); // Commented out - using simplified server

    // Copy Python requirements
    console.log('🐍 Setting up Python requirements...');
    await copyFile(
      path.join(rootDir, 'backend', 'nlp-service-requirements.txt'),
      path.join(rootDir, 'dist', 'requirements.txt')
    );

    // Create deployment instructions
    console.log('📖 Creating deployment instructions...');
    await createDeploymentInstructions();

    console.log('\n✅ Production build completed successfully!');
    console.log('📁 Distribution files are in the "dist" folder');
    console.log('📖 Check dist/DEPLOYMENT.md for deployment instructions');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

async function createProductionPackageJson() {
  const originalPackageContent = await fs.promises.readFile(path.join(rootDir, 'package.json'), 'utf8');
  const originalPackage = JSON.parse(originalPackageContent);
  
  // Filter production dependencies
  const prodDependencies = {
    "@google/generative-ai": originalPackage.dependencies["@google/generative-ai"],
    "@supabase/supabase-js": originalPackage.dependencies["@supabase/supabase-js"],
    "axios": originalPackage.dependencies["axios"],
    "cors": originalPackage.dependencies["cors"],
    "dotenv": originalPackage.dependencies["dotenv"],
    "express": "^4.18.2",
    "khalti-checkout-web": originalPackage.dependencies["khalti-checkout-web"]
  };

  return {
    name: "cropsayai-production",
    version: "1.0.0",
    type: "module",
    main: "simple-server.js",
    scripts: {
      "start": "node simple-server.js",
      "start:express": "node server.js",
      "verify": "node verify-install.js",
      "install:python": "pip install -r requirements.txt"
    },
    dependencies: prodDependencies,
    engines: {
      "node": ">=18.0.0"
    }
  };
}

async function createMainServer() {
  const serverContent = `// Production server for CropsayAI
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Start background services
console.log('Starting background services...');

// Start Khalti service
const khaltiProcess = exec('node backend/khalti-server-prod.js', (error) => {
  if (error) console.error('Khalti service error:', error);
});

// Start Gemini proxy
const geminiProcess = exec('node services/gemini-proxy-prod.js', (error) => {
  if (error) console.error('Gemini proxy error:', error);
});

// Start NLP service (if Python is available)
const nlpProcess = exec('python services/nlp_recommendation_service.py', (error) => {
  if (error) console.warn('NLP service not available (Python required):', error.message);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      frontend: 'running',
      khalti: 'running',
      gemini: 'running'
    }
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 CropsayAI server running on port \${PORT}\`);
  console.log(\`📱 Frontend: http://localhost:\${PORT}\`);
  console.log(\`🔧 API Health: http://localhost:\${PORT}/api/health\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  khaltiProcess.kill();
  geminiProcess.kill();
  nlpProcess.kill();
  process.exit(0);
});
`;

  await fs.writeFile(path.join(rootDir, 'dist', 'server.js'), serverContent);
}

async function createProductionScripts() {
  // Create production Khalti server
  const khaltiServerContent = `// Production Khalti server
import express from 'express';
import khaltiRoutes from './khalti.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', khaltiRoutes);

const PORT = process.env.KHALTI_PORT || 5001;
app.listen(PORT, () => {
  console.log(\`Khalti backend server running on port \${PORT}\`);
});
`;

  await fs.writeFile(
    path.join(rootDir, 'dist', 'backend', 'khalti-server-prod.js'),
    khaltiServerContent
  );

  // Create production Gemini proxy
  const geminiProxyContent = `// Production Gemini proxy server
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.GEMINI_PORT || 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(port, () => {
  console.log(\`Gemini proxy server running on port \${port}\`);
});
`;

  await fs.writeFile(
    path.join(rootDir, 'dist', 'services', 'gemini-proxy-prod.js'),
    geminiProxyContent
  );
}

async function createDeploymentInstructions() {
  const instructions = `# CropsayAI cPanel Deployment Guide

## 🚀 Quick Start for cPanel

### Prerequisites
- cPanel hosting with Node.js support (18+)
- File Manager or FTP access
- Terminal access (optional but recommended)

### Step 1: Upload Files
1. Download/extract the \`dist\` folder from your build
2. Upload ALL contents of the \`dist\` folder to your cPanel:
   - **For main domain**: Upload to \`public_html/\`
   - **For subdomain**: Upload to \`public_html/subdomain/\`
   - **For addon domain**: Upload to the addon domain's folder

### Step 2: Set Node.js Version
1. In cPanel, go to **"Node.js Selector"**
2. Select Node.js version **18.x or higher**
3. Set the **Application Root** to your upload directory
4. Set **Application Startup File** to: \`server.js\`

### Step 3: Install Dependencies
In cPanel Terminal (or SSH):
\`\`\`bash
cd ~/public_html  # or your app directory
npm install
\`\`\`

### Step 4: Configure Environment
1. Edit the \`.env\` file with your production settings:
   \`\`\`
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_KHALTI_PUBLIC_KEY=your_khalti_key
   VITE_GEMINI_API_KEY=your_gemini_key
   PORT=3000
   \`\`\`

### Step 5: Start the Application
**Option A: Using cPanel Node.js Selector**
1. Go to **Node.js Selector** in cPanel
2. Click **"Start"** next to your application

**Option B: Using Terminal**
\`\`\`bash
npm start
\`\`\`

## 📁 File Structure
\`\`\`
your-domain/
├── public/          # React frontend (built)
├── server.js        # Main Node.js server
├── package.json     # Dependencies
├── .env            # Environment variables
└── node_modules/   # Installed packages
\`\`\`

## 🔧 Features Included
- ✅ React frontend (static files)
- ✅ Express.js backend
- ✅ Gemini AI integration
- ✅ Khalti payment gateway
- ✅ Supabase database connection
- ✅ Health check endpoint (\`/api/health\`)

## 🌐 Access Your App
- **Frontend**: https://yourdomain.com
- **Health Check**: https://yourdomain.com/api/health
- **API Base**: https://yourdomain.com/api/

## 🔍 Troubleshooting

### Common Issues:
1. **"Cannot find module" error**
   - Run: \`npm install\` in your app directory

2. **Port already in use**
   - Change PORT in .env file or use cPanel's assigned port

3. **App not starting**
   - Check Node.js version is 18+
   - Verify startup file is set to \`server.js\`
   - Check error logs in cPanel

4. **API not working**
   - Verify environment variables in .env
   - Check /api/health endpoint

### Logs Location:
- cPanel: **Node.js Selector** → **Error Logs**
- Terminal: \`tail -f ~/logs/\`

## 📞 Support
If you encounter issues:
1. Check the health endpoint: \`/api/health\`
2. Review error logs in cPanel
3. Verify all environment variables are set
4. Ensure Node.js version is 18+

## 🔄 Updates
To update your app:
1. Build new dist folder locally
2. Upload new files (overwrite existing)
3. Run \`npm install\` if dependencies changed
4. Restart the app in cPanel Node.js Selector
`;

  await fs.promises.writeFile(path.join(rootDir, 'dist', 'DEPLOYMENT.md'), instructions);
}

async function createHtaccessFile() {
  const htaccessContent = `# Apache configuration for React Router (SPA)
# This ensures that all routes are handled by React Router

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Handle Angular and React Router
  # If the requested resource doesn't exist as a file or directory
  # Serve the index.html file instead
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  # Prevent MIME type sniffing
  Header always set X-Content-Type-Options nosniff

  # Enable XSS protection
  Header always set X-XSS-Protection "1; mode=block"

  # Prevent clickjacking
  Header always set X-Frame-Options DENY

  # Enable HSTS (HTTP Strict Transport Security)
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# Caching rules
<IfModule mod_expires.c>
  ExpiresActive on

  # Cache static assets for 1 year
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"

  # Don't cache HTML files
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  # Compress HTML, CSS, JavaScript, Text, XML and fonts
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
  AddOutputFilterByType DEFLATE application/x-font
  AddOutputFilterByType DEFLATE application/x-font-opentype
  AddOutputFilterByType DEFLATE application/x-font-otf
  AddOutputFilterByType DEFLATE application/x-font-truetype
  AddOutputFilterByType DEFLATE application/x-font-ttf
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE font/opentype
  AddOutputFilterByType DEFLATE font/otf
  AddOutputFilterByType DEFLATE font/ttf
  AddOutputFilterByType DEFLATE image/svg+xml
  AddOutputFilterByType DEFLATE image/x-icon
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
</IfModule>`;

  await fs.promises.writeFile(path.join(rootDir, 'dist', 'public', '.htaccess'), htaccessContent);
}

async function createSimpleServer() {
  const serverContent = `// Simple HTTP server for CropsayAI without Express dependency issues
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
let genAI = null;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized');
} else {
  console.warn('⚠️ Gemini API key not found');
}

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Helper function to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Helper function to send JSON response
function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Helper function to serve static files
function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(data);
  });
}

// Helper function to serve React app
function serveReactApp(res) {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  serveStaticFile(res, indexPath);
}

// Main server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;

  console.log(\`\${req.method} \${pathname}\`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // API Routes
  if (pathname.startsWith('/api/')) {

    // Health check
    if (pathname === '/api/health') {
      sendJson(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          frontend: 'running',
          gemini: genAI ? 'running' : 'disabled',
          khalti: 'integrated'
        }
      });
      return;
    }

    // Gemini AI endpoint
    if (pathname === '/api/generate' && req.method === 'POST') {
      try {
        if (!genAI) {
          sendJson(res, { error: 'Gemini AI service not available' }, 503);
          return;
        }

        const body = await parseJsonBody(req);
        const { message } = body;

        if (!message) {
          sendJson(res, { error: 'Message is required' }, 400);
          return;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        sendJson(res, { response: text });
      } catch (error) {
        console.error('Gemini API error:', error);
        sendJson(res, { error: 'Failed to generate content' }, 500);
      }
      return;
    }

    // API not found
    sendJson(res, { error: 'API endpoint not found' }, 404);
    return;
  }

  // Static files
  if (pathname.includes('.')) {
    const filePath = path.join(__dirname, 'public', pathname);
    if (fs.existsSync(filePath)) {
      serveStaticFile(res, filePath);
      return;
    }
  }

  // React Router routes - serve index.html for all other routes
  serveReactApp(res);
});

server.listen(PORT, () => {
  console.log(\`🚀 CropsayAI server running on port \${PORT}\`);
  console.log(\`📱 Frontend: http://localhost:\${PORT}\`);
  console.log(\`🔧 API Health: http://localhost:\${PORT}/api/health\`);
  console.log(\`🌐 Environment: \${process.env.NODE_ENV || 'development'}\`);
  console.log('\\n✅ SPA routing enabled - all routes work correctly!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});`;

  await fs.promises.writeFile(path.join(rootDir, 'dist', 'simple-server.js'), serverContent);
}

// Run the build
buildDist();
