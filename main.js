const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

let mainWindow;
let pythonProcess;
let responseHandlers = new Map();
let outputBuffer = '';

// Read connection settings from .env
const TWS_HOST = process.env.TWS_HOST || '127.0.0.1';
const TWS_PORT = process.env.TWS_PORT || '4002';
const TWS_CLIENT_ID = process.env.TWS_CLIENT_ID || '1';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 450,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    backgroundColor: '#f5f5f5'
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode (optional)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  // Kill Python process if it's running
  if (pythonProcess) {
    pythonProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Send command to Python bridge and wait for response
function sendCommandToBridge(command) {
  return new Promise((resolve, reject) => {
    if (!pythonProcess) {
      reject(new Error('Not connected to TWS'));
      return;
    }

    // Generate unique ID for this request
    const requestId = Date.now() + Math.random();
    
    // Store the resolver
    responseHandlers.set(requestId, resolve);
    
    // Send command with ID
    const commandWithId = { ...command, requestId };
    pythonProcess.stdin.write(JSON.stringify(commandWithId) + '\n');
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (responseHandlers.has(requestId)) {
        responseHandlers.delete(requestId);
        reject(new Error('Command timeout'));
      }
    }, 30000);
  });
}

// Handle connection request from renderer
ipcMain.handle('connect-tws', async (event) => {
  return new Promise((resolve, reject) => {
    // Kill existing Python process if any
    if (pythonProcess) {
      pythonProcess.kill();
      pythonProcess = null;
    }

    // Reset response handlers
    responseHandlers.clear();
    outputBuffer = '';

    // Spawn Python process with .env settings
    const pythonScript = path.join(__dirname, 'tws_bridge.py');
    pythonProcess = spawn('python3', [pythonScript, TWS_HOST, TWS_PORT, TWS_CLIENT_ID]);

    let connectionResolved = false;

    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      console.log(`Python stdout: ${text}`);
      
      // Add to buffer
      outputBuffer += text;
      
      // Process complete JSON messages
      const lines = outputBuffer.split('\n');
      outputBuffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            
            // Check if this is the initial connection response
            if (!connectionResolved && response.success !== undefined) {
              connectionResolved = true;
              if (response.success) {
                resolve({
                  success: true,
                  message: `Successfully connected to TWS at ${TWS_HOST}:${TWS_PORT} (Client ID: ${TWS_CLIENT_ID})`
                });
              } else {
                resolve(response);
              }
            }
            
            // Handle command responses
            if (response.requestId && responseHandlers.has(response.requestId)) {
              const handler = responseHandlers.get(response.requestId);
              responseHandlers.delete(response.requestId);
              handler(response);
            }
          } catch (e) {
            console.error('Failed to parse JSON:', line, e);
          }
        }
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      if (!connectionResolved) {
        resolve({
          success: false,
          message: 'Connection failed. Make sure TWS/IB Gateway is running.'
        });
      }
      pythonProcess = null;
    });

    pythonProcess.on('error', (error) => {
      if (!connectionResolved) {
        resolve({
          success: false,
          message: `Failed to start Python bridge: ${error.message}`
        });
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!connectionResolved) {
        if (pythonProcess) {
          pythonProcess.kill();
        }
        resolve({
          success: false,
          message: 'Connection timeout. Please ensure TWS/IB Gateway is running and configured correctly.'
        });
      }
    }, 10000);
  });
});

// Handle disconnect request
ipcMain.handle('disconnect-tws', async () => {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    responseHandlers.clear();
    return { success: true, message: 'Disconnected from TWS' };
  }
  return { success: true, message: 'Already disconnected' };
});

// Handle place order request
ipcMain.handle('place-order', async (event, orderParams) => {
  try {
    const response = await sendCommandToBridge({
      type: 'place_order',
      data: orderParams
    });
    return response;
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Handle get positions request
ipcMain.handle('get-positions', async () => {
  try {
    const response = await sendCommandToBridge({
      type: 'get_positions'
    });
    return response;
  } catch (error) {
    return { success: false, message: error.message, positions: [] };
  }
});

// Handle get balance request
ipcMain.handle('get-balance', async () => {
  try {
    const response = await sendCommandToBridge({
      type: 'get_balance'
    });
    return response;
  } catch (error) {
    return { success: false, message: error.message, balance: 0 };
  }
});

// Handle close position request
ipcMain.handle('close-position', async (event, positionParams) => {
  try {
    const response = await sendCommandToBridge({
      type: 'close_position',
      data: positionParams
    });
    return response;
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Handle get daily P&L request
ipcMain.handle('get-daily-pnl', async () => {
  try {
    const response = await sendCommandToBridge({
      type: 'get_daily_pnl'
    });
    return response;
  } catch (error) {
    return { success: false, message: error.message, dailyPnL: 0 };
  }
});

// Handle close all positions request
ipcMain.handle('close-all-positions', async () => {
  try {
    const response = await sendCommandToBridge({
      type: 'close_all_positions'
    });
    return response;
  } catch (error) {
    return { success: false, message: error.message };
  }
});
