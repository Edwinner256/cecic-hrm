// ─── Email / Sync Module ─────────────────────────────────────────

const Email = {
  async render() {
    const container = document.getElementById('page-email');
    const online = await Utils.isOnline();
    const settings = await DB.getAllSettings();

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon ${online ? 'green' : 'red'}">
            <i class="bi ${online ? 'bi-cloud-check-fill' : 'bi-cloud-slash-fill'}"></i>
          </div>
          <div class="stat-info">
            <h3>${online ? 'Online' : 'Offline'}</h3>
            <p>Internet Connection</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon ${settings.smtpHost ? 'green' : 'yellow'}">
            <i class="bi bi-envelope-fill"></i>
          </div>
          <div class="stat-info">
            <h3>${settings.smtpHost ? 'Configured' : 'Not Set'}</h3>
            <p>SMTP / Email</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="bi bi-send-fill"></i></div>
          <div class="stat-info">
            <h3 id="sentCount">0</h3>
            <p>Emails Sent (this session)</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan"><i class="bi bi-arrow-repeat"></i></div>
          <div class="stat-info">
            <h3>${online ? 'Ready' : 'Queued'}</h3>
            <p>Sync Status</p>
          </div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header"><h3>Send Email / Notification</h3></div>
        <div class="card-body">
          <form id="emailForm">
            <div class="form-row">
              <div class="form-group">
                <label>To <span style="color:var(--danger)">*</span></label>
                <input type="email" class="form-control" id="emailTo" required placeholder="recipient@company.co.ug" />
              </div>
              <div class="form-group">
                <label>Subject <span style="color:var(--danger)">*</span></label>
                <input type="text" class="form-control" id="emailSubject" required placeholder="Email subject..." />
              </div>
            </div>
            <div class="form-group">
              <label>Message <span style="color:var(--danger)">*</span></label>
              <textarea class="form-control" id="emailMessage" rows="6" required placeholder="Type your message here..."></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="btnSendEmail">
                <i class="bi bi-send-fill"></i> Send Email
              </button>
              <button type="button" class="btn btn-outline" onclick="Email.clearForm()">
                <i class="bi bi-x-circle-fill"></i> Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>Quick Send Templates</h3></div>
        <div class="card-body">
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <button class="btn btn-outline" onclick="Email.loadTemplate('payroll')">
              <i class="bi bi-cash-coin"></i> Payroll Notification
            </button>
            <button class="btn btn-outline" onclick="Email.loadTemplate('leave')">
              <i class="bi bi-calendar-check-fill"></i> Leave Approval
            </button>
            <button class="btn btn-outline" onclick="Email.loadTemplate('expense')">
              <i class="bi bi-receipt-cutoff"></i> Expense Receipt
            </button>
            <button class="btn btn-outline" onclick="Email.loadTemplate('welcome')">
              <i class="bi bi-person-plus-fill"></i> Welcome Email
            </button>
          </div>
        </div>
      </div>

      <div class="card mt-24">
        <div class="card-header"><h3>Email Log</h3></div>
        <div class="card-body">
          <div id="emailLog">
            <div class="empty-state">
              <i class="bi bi-inbox-fill"></i>
              <p>No emails sent this session. Emails are not stored permanently for privacy.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('emailForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendEmail();
    });

    if (!settings.smtpHost) {
      Utils.toast('SMTP not configured. Go to Settings to set up email first.', 'warning', 6000);
    }
  },

  sentCount: 0,
  emailLog: [],

  async sendEmail() {
    const to = document.getElementById('emailTo').value.trim();
    const subject = document.getElementById('emailSubject').value.trim();
    const message = document.getElementById('emailMessage').value.trim();

    if (!to || !subject || !message) {
      Utils.toast('Please fill in all fields', 'warning');
      return;
    }

    const online = await Utils.isOnline();
    if (!online) {
      Utils.toast('No internet connection. Email will be queued for later.', 'warning');
      return;
    }

    const settings = await DB.getAllSettings();
    if (!settings.smtpHost) {
      Utils.toast('SMTP not configured. Go to Settings first.', 'warning');
      return;
    }

    const btn = document.getElementById('btnSendEmail');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass"></i> Sending...';

    try {
      const payload = {
        to,
        subject,
        html: `<div style="font-family:Arial,sans-serif;padding:20px">
          <h2>${subject}</h2>
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <hr style="margin-top:20px"/>
          <p style="color:#666;font-size:12px">Sent from Offline HRMS</p>
        </div>`,
        smtpConfig: {
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort || '587'),
          secure: settings.smtpSecure === 'true',
          user: settings.smtpUser,
          pass: settings.smtpPass,
          from: settings.smtpFrom || settings.smtpUser
        }
      };

      // Use Electron IPC (desktop) or HTTP API (browser)
      const result = Utils.isElectron()
        ? await window.electronAPI.sendEmail(payload)
        : await Utils.apiPost('/api/send-email', payload);

      if (result.success) {
        this.sentCount++;
        document.getElementById('sentCount').textContent = this.sentCount;
        Utils.toast('Email sent successfully!', 'success');

        // Log it
        const logEl = document.getElementById('emailLog');
        if (logEl) {
          const entry = document.createElement('div');
          entry.style.cssText = 'display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)';
          entry.innerHTML = `
            <span style="color:var(--success)"><i class="bi bi-check-circle-fill"></i></span>
            <span style="font-size:12px;color:var(--text-muted)">${new Date().toLocaleTimeString()}</span>
            <span style="font-size:13px">To: <strong>${Utils.escapeHtml(to)}</strong> &mdash; ${Utils.escapeHtml(subject)}</span>
          `;
          logEl.prepend(entry);
          logEl.querySelector('.empty-state')?.remove();
        }

        this.clearForm();
      } else {
        Utils.toast('Failed: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      Utils.toast('Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-send-fill"></i> Send Email';
    }
  },

  clearForm() {
    document.getElementById('emailTo').value = '';
    document.getElementById('emailSubject').value = '';
    document.getElementById('emailMessage').value = '';
  },

  loadTemplate(type) {
    const templates = {
      payroll: {
        subject: 'Payroll Notification',
        message: 'Dear [Employee],\n\nYour payroll for this month has been processed.\nNet Pay: UGX [Amount]\nStatus: Paid\n\nPlease contact HR if you have any questions.\n\nBest regards,\nHR Department'
      },
      leave: {
        subject: 'Leave Application Approved',
        message: 'Dear [Employee],\n\nYour leave application has been approved.\n\nType: [Leave Type]\nDates: [Start] to [End]\nDays: [Days]\n\nEnjoy your time off!\n\nBest regards,\nHR Department'
      },
      expense: {
        subject: 'Expense Claim Receipt',
        message: 'Dear [Officer],\n\nYour expense claim has been processed.\n\nAmount: UGX [Amount]\nCategory: [Category]\nStatus: [Status]\n\nPlease find attached the receipt for your records.\n\nBest regards,\nFinance Department'
      },
      welcome: {
        subject: 'Welcome to the Team!',
        message: 'Dear [Employee],\n\nWelcome to [Company Name]!\n\nWe are excited to have you on board. Your onboarding schedule will be shared shortly.\n\nPlease complete the following:\n1. HR documentation\n2. IT setup\n3. Department orientation\n\nBest regards,\nHR Team'
      }
    };

    const t = templates[type];
    if (t) {
      document.getElementById('emailSubject').value = t.subject;
      document.getElementById('emailMessage').value = t.message;
      Utils.toast('Template loaded. Replace [placeholders] with actual values.', 'info');
    }
  }
};
