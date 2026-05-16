const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const nodemailer = require('nodemailer');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'HR Management System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ─── IPC Handlers ────────────────────────────────────────────────

/**
 * Send email via SMTP (works only when online)
 * Expects: { to, subject, html, smtpConfig }
 */
ipcMain.handle('send-email', async (event, args) => {
  const { to, subject, html, smtpConfig } = args;

  if (!smtpConfig || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    return { success: false, error: 'SMTP not configured. Go to Settings to configure email.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port || 587,
      secure: smtpConfig.secure || false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    });

    const info = await transporter.sendMail({
      from: smtpConfig.from || smtpConfig.user,
      to,
      subject,
      html
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Check network connectivity
 */
ipcMain.handle('check-connectivity', async () => {
  return { online: require('net').isIPv4 ? true : navigator.onLine };
});

/**
 * Print a PDF or HTML content
 */
ipcMain.handle('print-content', async (event, { htmlContent }) => {
  if (!mainWindow) return { success: false, error: 'No window' };

  try {
    const printWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({}, (success, failureReason) => {
        if (!success) {
          dialog.showErrorBox('Print Failed', failureReason);
        }
        printWindow.close();
      });
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Save file dialog - for exporting data
 */
ipcMain.handle('save-file', async (event, { defaultName, content, filter }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: filter || [{ name: 'All Files', extensions: ['*'] }]
  });

  if (!result.canceled && result.filePath) {
    require('fs').writeFileSync(result.filePath, content, 'utf-8');
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});

/**
 * Open a file in the default application
 */
ipcMain.handle('open-file', async (event, filePath) => {
  shell.openPath(filePath);
  return { success: true };
});

/**
 * Get app version
 */
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
