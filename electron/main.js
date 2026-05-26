// electron/main.js
// Electron entry point — launches the app window and Express backend

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const isDev = !app.isPackaged;
const SERVER_PORT = 4000;
const REACT_PORT = 3000;

// ─── Launch Express Backend ───────────────────────────────────────────────────
function startServer() {
  const serverPath = isDev
    ? path.join(__dirname, '../src/main/server.js')
    : path.join(process.resourcesPath, 'src/main/server.js');

  serverProcess = fork(serverPath, [], {
    env: { ...process.env, PORT: SERVER_PORT, NODE_ENV: isDev ? 'development' : 'production' },
    silent: false,
  });

  serverProcess.on('exit', (code) => {
    console.log(`[Server] Exited with code ${code}`);
  });
}

// ─── Create Main App Window ───────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    minWidth: 1024,
    minHeight: 640,
    title: 'DMS — Distributor Management System',
    backgroundColor: '#f0f4ff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // show after ready-to-show
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  // Load React dev server in dev, built index.html in production
  const startURL = isDev
    ? `http://localhost:${REACT_PORT}`
    : `file://${path.join(__dirname, '../src/renderer/build/index.html')}`;

  mainWindow.loadURL(startURL);

  // Show window once fully loaded to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  // Open external links in browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  startServer();

  // Small delay to let server spin up before window loads
  setTimeout(createWindow, 800);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
