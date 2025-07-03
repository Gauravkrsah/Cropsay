#!/usr/bin/env node

// Simple startup script for cPanel deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting CropsayAI for cPanel...');

// Start the main server
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.dirname(__dirname),
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  serverProcess.kill('SIGINT');
});
