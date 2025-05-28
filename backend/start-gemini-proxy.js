// Script to start the Gemini API proxy server
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Gemini API proxy server...');

// Get the path to the geminiProxy.js file
const proxyPath = path.join(__dirname, 'src', 'services', 'geminiProxy.js');

// Start the proxy server
const proxyServer = exec(`node ${proxyPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting proxy server: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Proxy server stderr: ${stderr}`);
    return;
  }
  console.log(`Proxy server stdout: ${stdout}`);
});

// Log output from the proxy server
proxyServer.stdout.on('data', (data) => {
  console.log(`Proxy server: ${data}`);
});

proxyServer.stderr.on('data', (data) => {
  console.error(`Proxy server error: ${data}`);
});

proxyServer.on('close', (code) => {
  console.log(`Proxy server exited with code ${code}`);
});

console.log('Proxy server started in the background.');
console.log('Press Ctrl+C to stop the proxy server.');

// Keep the script running
process.stdin.resume();