#!/usr/bin/env node
/**
 * HR Management System — Web Server
 * 
 * Serves the app in any browser while maintaining all offline features.
 * Email sending works via the /api/send-email endpoint.
 *
 * Usage:
 *   node server.js              # starts on port 3000
 *   node server.js --port 8080  # custom port
 *   node server.js --open       # auto-open browser
 */

const express = require('express');
const path = require('path');
const http = require('http');
const os = require('os');
const { execSync } = require('child_process');

// ─── Configuration ──────────────────────────────────────────────
// Support both --port=3000 and --port 3000 syntax
let portArg = process.argv.find(a => a.startsWith('--port='));
if (!portArg) {
  const idx = process.argv.indexOf('--port');
  if (idx !== -1 && idx + 1 < process.argv.length) portArg = `--port=${process.argv[idx + 1]}`;
}
const PORT = parseInt(process.env.PORT || portArg?.split('=')[1] || '3000', 10);
const SHOULD_OPEN = process.argv.includes('--open') || process.argv.includes('-o');

const app = express();

// ─── Email Sending ──────────────────────────────────────────────
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Nodemailer not available — email will return appropriate error
}

app.use(express.json({ limit: '10mb' }));

// ─── CORS ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── API: Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HR Management System',
    version: '1.0.0',
    platform: os.platform(),
    online: true,
    features: {
      email: nodemailer !== null,
      offline: true,
      printing: true
    }
  });
});

// ─── API: Send Email ────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html, smtpConfig } = req.body;

  if (!nodemailer) {
    return res.status(503).json({
      success: false,
      error: 'Email module not available on this server'
    });
  }

  if (!smtpConfig || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    return res.status(400).json({
      success: false,
      error: 'SMTP not configured. Go to Settings to configure email.'
    });
  }

  if (!to || !subject) {
    return res.status(400).json({
      success: false,
      error: 'Recipient (to) and subject are required'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port || 587,
      secure: smtpConfig.secure === true || smtpConfig.secure === 'true',
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    });

    const info = await transporter.sendMail({
      from: smtpConfig.from || smtpConfig.user,
      to,
      subject,
      html: html || `<p>${subject}</p>`
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ─── Static Files ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'renderer'), {
  maxAge: 0,
  etag: false,
  setHeaders: (res, filePath) => {
    // Ensure HTML files are not cached
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ─── Fallback: serve index.html for any non-file, non-API routes ─
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/') && !req.path.includes('.')) {
    return res.sendFile(path.join(__dirname, 'renderer', 'index.html'));
  }
  next();
});

// ─── Start Server ───────────────────────────────────────────────

// Try to listen on the requested port, fallback to a random port if busy
function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
        server.close();
        startServer(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    server.listen(port, () => {
      resolve(server.address().port);
    });
  });
}

function printBanner(actualPort) {
  const address = `http://localhost:${actualPort}`;
  const networkInterfaces = os.networkInterfaces();
  let networkUrl = '';

  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        networkUrl = `http://${iface.address}:${actualPort}`;
        break;
      }
    }
    if (networkUrl) break;
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   HR Management System — Web Server         ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Local:    ${address.padEnd(37)}║`);
  console.log(`║  Network:  ${(networkUrl || 'N/A').padEnd(37)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Features: Offline ✓  Printing ✓  Email ✓  ║');
  console.log('║  Open in any browser — works on mobile too  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // Auto-open browser
  if (SHOULD_OPEN) {
    const cmd = os.platform() === 'darwin' ? 'open' :
                os.platform() === 'win32' ? 'start' : 'xdg-open';
    try {
      execSync(`${cmd} ${address}`);
    } catch (e) {
      // Ignore — browser open is optional
    }
  }
}

startServer(PORT).then(actualPort => {
  printBanner(actualPort);
}).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => process.exit(0));
});
