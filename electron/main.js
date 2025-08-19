const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

// Start the local server
let serverProcess = null;

function startServer() {
  const serverPath = isDev 
    ? path.join(__dirname, '../server/index-desktop.ts')
    : path.join(process.resourcesPath, 'server/index-desktop.js');
    
  const serverArgs = isDev ? ['tsx', serverPath] : ['node', serverPath];
  
  console.log('Starting server:', serverArgs.join(' '));
  
  serverProcess = spawn(serverArgs[0], serverArgs.slice(1), {
    env: { 
      ...process.env, 
      NODE_ENV: isDev ? 'development' : 'production',
      DESKTOP_PORT: '3001'
    }
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log('Server:', data.toString());
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error('Server Error:', data.toString());
  });
  
  serverProcess.on('close', (code) => {
    console.log('Server process exited with code', code);
  });
}

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '../client/public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Set application menu
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new');
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectall', label: 'Sélectionner tout' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Recharger' },
        { role: 'forcereload', label: 'Recharger (Force)' },
        { role: 'toggledevtools', label: 'Outils de développement' },
        { type: 'separator' },
        { role: 'resetzoom', label: 'Zoom normal' },
        { role: 'zoomin', label: 'Zoom +' },
        { role: 'zoomout', label: 'Zoom -' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos de StockCéramique',
          click: () => {
            shell.openExternal('https://github.com/your-repo/stockceramique');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('http://127.0.0.1:3001');
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event listeners
app.whenReady().then(() => {
  startServer();
  // Wait a moment for server to start
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  // Kill server process
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://127.0.0.1:3001' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});