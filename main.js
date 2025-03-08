const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Define the path for our config file
const configPath = path.join(app.getPath('userData'), 'config.json');

// Function to read the config file
function readConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading config file:', error);
  }
  return {};
}

// Function to write to the config file
function writeConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing config file:', error);
  }
}

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,  // Changed to true for security
      preload: path.join(__dirname, 'preload.js')
    },
    fullscreen: true,
    kiosk: true,
    icon: readConfig().iconPath || path.join(__dirname, 'build', 'icon.png')
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Register the Ctrl+A shortcut to open settings
  // Using a different approach to avoid conflict with browser's select all
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    mainWindow.webContents.send('toggle-settings');
  });
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow.webContents.send('toggle-settings');
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Listen for URL updates from the renderer process
ipcMain.on('update-url', (event, url) => {
  // Check if the URL is a JSON string
  try {
    // Try to parse as JSON first
    const jsonData = JSON.parse(url);
    // If it's valid JSON, store it as is
    const config = readConfig();
    config.kioskUrl = url;
    writeConfig(config);
    // If JSON contains a url property, load that URL
    if (jsonData.url) {
      mainWindow.loadURL(jsonData.url);
    } else {
      // Otherwise, stringify the JSON and show it in the window
      mainWindow.loadURL(`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData, null, 2))}`);
    }
  } catch (e) {
    // Not JSON, treat as regular URL
    const config = readConfig();
    config.kioskUrl = url;
    writeConfig(config);
    mainWindow.loadURL(url);
  }
});

// Listen for requests to get the stored URL
ipcMain.on('get-url', (event) => {
  const config = readConfig();
  const url = config.kioskUrl || '';
  event.reply('url-value', url);
});

// Listen for requests to get the URL as JSON
ipcMain.on('get-json-url', (event) => {
  const config = readConfig();
  const url = config.kioskUrl || '';
  try {
    // Try to parse as JSON
    const jsonData = JSON.parse(url);
    event.reply('json-url-value', jsonData);
  } catch (e) {
    // Not JSON, return an object with url property
    event.reply('json-url-value', { url: url });
  }
});

// Listen for icon upload requests
ipcMain.on('upload-icon', async (event) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'ico', 'svg'] }]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const iconPath = result.filePaths[0];
      // Store the icon path in config
      const config = readConfig();
      config.iconPath = iconPath;
      
      // For Windows compatibility, ensure path separators are consistent
      if (process.platform === 'win32') {
        config.iconPath = iconPath.replace(/\\/g, '/');
      }
      
      writeConfig(config);
      
      // Update the window icon
      if (mainWindow) {
        mainWindow.setIcon(iconPath);
      }
      
      // Send the icon path back to the renderer
      event.reply('icon-value', iconPath);
    }
  } catch (error) {
    console.error('Error selecting icon:', error);
  }
});

// Listen for requests to get the stored icon
ipcMain.on('get-icon', (event) => {
  const config = readConfig();
  const iconPath = config.iconPath || '';
  
  // Check if the icon file exists (important for Windows where paths might change)
  if (iconPath && !fs.existsSync(iconPath)) {
    console.warn('Icon file not found:', iconPath);
    event.reply('icon-value', '');
    return;
  }
  
  event.reply('icon-value', iconPath);
});

// Listen for requests to get the stored icon
ipcMain.on('get-icon', (event) => {
  const config = readConfig();
  const iconPath = config.iconPath || '';
  event.reply('icon-value', iconPath);
});

// Listen for minimize app request
ipcMain.on('minimize-app', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

// Listen for close app request
ipcMain.on('close-app', () => {
  app.quit();
});

// Listen for requests to set autostart on Windows
ipcMain.on('set-autostart', (event) => {
  // Only proceed if we're on Windows
  if (process.platform !== 'win32') {
    event.reply('autostart-status', { 
      success: false, 
      error: 'This feature is only available on Windows' 
    });
    return;
  }

  try {
    // Get the path to the Windows Startup folder
    const startupPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    
    // Check if the startup folder exists
    if (!fs.existsSync(startupPath)) {
      event.reply('autostart-status', { 
        success: false, 
        error: 'Windows Startup folder not found' 
      });
      return;
    }

    // Get the path to the current executable
    const exePath = process.execPath;
    const appName = path.basename(exePath);
    
    // Create a shortcut file (.lnk) in the startup folder
    const shortcutPath = path.join(startupPath, 'Kiosk App.lnk');
    
    // Use the built-in Windows shell to create a shortcut
    const { execSync } = require('child_process');
    
    // PowerShell command to create a shortcut
    const psCommand = `
      $WshShell = New-Object -ComObject WScript.Shell
      $Shortcut = $WshShell.CreateShortcut('${shortcutPath.replace(/\\/g, '\\\\')}')
      $Shortcut.TargetPath = '${exePath.replace(/\\/g, '\\\\')}'  
      $Shortcut.Save()
    `;
    
    // Execute the PowerShell command
    execSync(`powershell -command "${psCommand}"`);
    
    // Check if the shortcut was created successfully
    if (fs.existsSync(shortcutPath)) {
      event.reply('autostart-status', { success: true });
    } else {
      event.reply('autostart-status', { 
        success: false, 
        error: 'Failed to create startup shortcut' 
      });
    }
  } catch (error) {
    console.error('Error setting autostart:', error);
    event.reply('autostart-status', { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    });
  }
});