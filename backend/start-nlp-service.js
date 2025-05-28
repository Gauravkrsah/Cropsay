// Script to start the NLP Recommendation Service
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting NLP Recommendation Service...');

// Get the path to the Python script
const scriptPath = path.join(__dirname, 'src', 'services', 'nlp_recommendation_service.py');

// Check if Python is installed and which command to use (python or python3)
// Use the full path to the Pytho= executable
const pythonCommand = 'C:\\Users\\Gaurav\\AppData\\Local\\Microsoft\\WindowsApps\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\python.exe';
const nlpService = exec(`"${pythonCommand}" ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting NLP service: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`NLP service stderr: ${stderr}`);
      return;
    }
    console.log(`NLP service stdout: ${stdout}`);
  });
  
  // Log output from the NLP service
  nlpService.stdout.on('data', (data) => {
    console.log(`NLP service: ${data}`);
  });
  
  nlpService.stderr.on('data', (data) => {
    console.error(`NLP service error: ${data}`);
  });
  
  nlpService.on('close', (code) => {
    console.log(`NLP service exited with code ${code}`);
  });
  
  console.log('NLP service started in the background.');
  console.log('Press Ctrl+C to stop the NLP service.');

// Keep the script running
process.stdin.resume();