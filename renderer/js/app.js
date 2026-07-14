// ─── Main Application ───────────────────────────────────────────

const App = {
  currentPage: 'dashboard',

  async init() {
    console.log('HRMS Initializing...');

    // Check login state
    const isLoggedIn = sessionStorage.getItem('hrms_logged_in') === 'true';
    if (isLoggedIn) {
      this.hideLogin();
    } else {
      this.showLogin();
    }

    // Setup login form handler
    this.setupLogin();

    // Wait for DB to be ready
    await db.open();

    // Setup navigation
    this.setupNavigation();

    // Setup topbar buttons
    this.setupTopbar();

    // Show environment indicator
    this.showEnvironment();

    // Setup connection monitoring
    this.setupConnectivityCheck();

    // Update company branding (logo, name)
    await this.updateCompanyBranding();

    // If already logged in, load default page
    if (isLoggedIn) {
      this.navigate('dashboard');
    }

    console.log('HRMS Ready');
  },

  // ─── Login System ──────────────────────────────────────────

  setupLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const errorEl = document.getElementById('loginError');

      // Authenticate against IndexedDB users table
      try {
        const user = await DB.authenticate(username, password);
        if (user) {
          // Store session data
          sessionStorage.setItem('hrms_logged_in', 'true');
          sessionStorage.setItem('hrms_user', user.username);
          sessionStorage.setItem('hrms_role', user.role);
          sessionStorage.setItem('hrms_displayName', user.displayName);
          sessionStorage.setItem('hrms_employeeId', user.employeeId);

          errorEl.textContent = '';
          this.hideLogin();
          this.navigate('dashboard');
          Utils.toast(`Welcome, ${user.displayName || username}!`, 'success');
        } else {
          errorEl.textContent = '❌ Invalid username or password';
          document.getElementById('loginPassword').value = '';
          document.getElementById('loginPassword').focus();
        }
      } catch (err) {
        console.error('Login error:', err);
        errorEl.textContent = '❌ Login failed. Is the database ready?';
      }
    });

    // Allow Enter key to submit
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') form.dispatchEvent(new Event('submit'));
    });
  },

  showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.body.classList.add('login-active');
    document.getElementById('app').classList.remove('logged-in');
    // Clear the current page content to prevent flash
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Pre-fill demo hint
    const helpEl = document.getElementById('loginHelp');
    if (helpEl) {
      helpEl.innerHTML = `
        <div class="login-help-box">
          <strong>Demo Accounts</strong><br>
          admin / admin123 · finance / finance123 · hr / hr123<br>
          hellen / hellen123 · godwin / godwin123 · lydia / lydia123 · edwin / edwin123
        </div>`;
    }
  },

  hideLogin() {
    document.getElementById('loginPage').style.display = 'none';
    document.body.classList.remove('login-active');
    document.getElementById('app').classList.add('logged-in');

    // Apply role-based sidebar filtering and update user badge
    this.applyRoleFilter();
    this.updateUserBadge();
  },

  logout() {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    sessionStorage.removeItem('hrms_logged_in');
    sessionStorage.removeItem('hrms_user');
    sessionStorage.removeItem('hrms_role');
    sessionStorage.removeItem('hrms_displayName');
    sessionStorage.removeItem('hrms_employeeId');
    this.showLogin();
    Utils.toast('Signed out successfully', 'info');
  },

  /**
   * Filter sidebar navigation items based on the current user's role.
   * Checks the data-roles attribute on each nav-item.
   */
  applyRoleFilter() {
    const role = sessionStorage.getItem('hrms_role') || 'staff';
    document.querySelectorAll('.nav-item').forEach(item => {
      const allowed = (item.dataset.roles || '').split(',').map(r => r.trim());
      if (allowed.includes(role)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  },

  /**
   * Update the sidebar user info badge
   */
  updateUserBadge() {
    const badge = document.getElementById('sidebarUserInfo');
    const nameEl = document.getElementById('sidebarUserName');
    const roleEl = document.getElementById('sidebarUserRole');

    if (badge && nameEl && roleEl) {
      const name = sessionStorage.getItem('hrms_displayName') || sessionStorage.getItem('hrms_user') || 'User';
      const role = sessionStorage.getItem('hrms_role') || 'staff';
      nameEl.textContent = name;
      roleEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
      badge.style.display = 'flex';
    }
  },

  // ─── Password Reset ───────────────────────────────────────

  /**
   * Show a password reset dialog on the login page
   */
  showPasswordReset() {
    // Remove any existing reset form
    const existing = document.getElementById('passwordResetOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'passwordResetOverlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Reset Password</h2>
          <button class="modal-close" data-close>&times;</button>
        </div>
        <div class="modal-body">
          <p class="text-muted mb-16">Enter your username below to reset your password.</p>

          <!-- Step 1: Enter username -->
          <div id="resetStep1">
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" id="resetUsername" placeholder="Enter your username" autofocus />
            </div>
            <div id="resetError" class="login-error" style="color:var(--danger);font-size:13px;text-align:center;min-height:20px"></div>
            <button class="btn btn-primary" id="resetNextBtn" style="width:100%;margin-top:8px">
              <i class="bi bi-search"></i> Find Account
            </button>
          </div>

          <!-- Step 2: Set new password (hidden initially) -->
          <div id="resetStep2" style="display:none">
            <div id="resetAccountInfo" class="login-help-box mb-16"></div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" class="form-control" id="resetNewPassword" placeholder="Minimum 4 characters" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" class="form-control" id="resetConfirmPassword" placeholder="Re-enter new password" />
            </div>
            <div id="resetError2" class="login-error" style="color:var(--danger);font-size:13px;text-align:center;min-height:20px"></div>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="btn btn-outline" id="resetBackBtn" style="flex:1">
                <i class="bi bi-arrow-left"></i> Back
              </button>
              <button class="btn btn-primary" id="resetSaveBtn" style="flex:2">
                <i class="bi bi-key"></i> Reset Password
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="justify-content:center">
          <span style="font-size:12px;color:var(--text-muted)">
            <i class="bi bi-info-circle"></i> Password will be updated immediately.
          </span>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // Step 1 → Step 2: Look up the username
    overlay.querySelector('#resetNextBtn').addEventListener('click', async () => {
      const username = overlay.querySelector('#resetUsername').value.trim();
      const errorEl = overlay.querySelector('#resetError');

      if (!username) {
        errorEl.textContent = 'Please enter your username';
        return;
      }

      try {
        const users = await DB.getUsers();
        const user = users.find(u => u.username === username);
        if (!user) {
          errorEl.textContent = 'Username not found';
          return;
        }

        // Show account info and move to step 2
        errorEl.textContent = '';
        overlay.querySelector('#resetAccountInfo').innerHTML = `
          <strong>Account Found</strong><br>
          ${Utils.escapeHtml(user.displayName || user.username)}
        `;
        overlay.querySelector('#resetStep1').style.display = 'none';
        overlay.querySelector('#resetStep2').style.display = 'block';
        overlay.querySelector('#resetNewPassword').focus();

        // Store username for the reset
        overlay.dataset.resetUsername = username;
      } catch (err) {
        errorEl.textContent = 'Error: ' + err.message;
      }
    });

    // Back button: return to step 1
    overlay.querySelector('#resetBackBtn').addEventListener('click', () => {
      overlay.querySelector('#resetStep2').style.display = 'none';
      overlay.querySelector('#resetStep1').style.display = 'block';
      overlay.querySelector('#resetUsername').focus();
      overlay.querySelector('#resetError').textContent = '';
    });

    // Save new password
    overlay.querySelector('#resetSaveBtn').addEventListener('click', async () => {
      const newPass = overlay.querySelector('#resetNewPassword').value;
      const confirmPass = overlay.querySelector('#resetConfirmPassword').value;
      const errorEl = overlay.querySelector('#resetError2');
      const username = overlay.dataset.resetUsername;

      if (!newPass || newPass.length < 4) {
        errorEl.textContent = 'Password must be at least 4 characters';
        return;
      }
      if (newPass !== confirmPass) {
        errorEl.textContent = 'Passwords do not match';
        return;
      }

      try {
        // Find the user and update password directly
        const users = await DB.getUsers();
        const user = users.find(u => u.username === username);
        if (!user) {
          errorEl.textContent = 'User not found. Please start over.';
          return;
        }

        await DB.updateUser(user.id, { password: newPass });
        Utils.toast('Password reset successfully! Sign in with your new password.', 'success');
        close();
      } catch (err) {
        errorEl.textContent = 'Error: ' + err.message;
      }
    });

    // Enter key support
    overlay.querySelector('#resetUsername').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('#resetNextBtn').click();
    });
    overlay.querySelector('#resetNewPassword').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('#resetSaveBtn').click();
    });
    overlay.querySelector('#resetConfirmPassword').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('#resetSaveBtn').click();
    });
  },

  // ─── Company Branding ──────────────────────────────────────

  async updateCompanyBranding() {
    try {
      const company = await Utils.getCompanyInfo();

      // Sidebar logo
      const sidebarLogo = document.getElementById('sidebarLogo');
      const sidebarDefaultLogo = document.getElementById('sidebarDefaultLogo');
      if (company.logo) {
        sidebarLogo.src = company.logo;
        sidebarLogo.style.display = 'block';
        sidebarDefaultLogo.style.display = 'none';
      } else {
        sidebarLogo.style.display = 'none';
        sidebarDefaultLogo.style.display = 'flex';
      }

      // Sidebar company name
      const sidebarName = document.getElementById('sidebarCompanyName');
      if (sidebarName) {
        sidebarName.textContent = company.name || 'Offline Edition';
      }

      // Topbar logo
      const topbarLogo = document.getElementById('topbarLogo');
      if (company.logo) {
        topbarLogo.src = company.logo;
        topbarLogo.style.display = 'block';
      } else {
        topbarLogo.style.display = 'none';
      }
    } catch (e) {
      // Branding is optional
      console.warn('Branding update failed:', e);
    }
  },

  // ─── Navigation ────────────────────────────────────────────

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) this.navigate(page);
      });
    });
  },

  showEnvironment() {
    const el = document.getElementById('envIndicator');
    if (!el) return;
    const mode = Utils.isElectron() ? '🖥 Desktop App' : '🌐 Browser';
    el.textContent = mode;
  },

  setupTopbar() {
    // Refresh button
    document.getElementById('btnRefresh')?.addEventListener('click', () => {
      this.navigate(this.currentPage);
      Utils.toast('Data refreshed', 'info');
    });

    // Print button
    document.getElementById('btnPrint')?.addEventListener('click', () => {
      if (this.currentPage === 'reports' && Reports.currentHtml) {
        Reports.printReport();
      } else if (this.currentPage === 'payroll') {
        Payroll.printPayroll();
      } else {
        window.print();
      }
    });
  },

  setupConnectivityCheck() {
    const checkConnection = async () => {
      const statusEl = document.getElementById('connectionStatus');
      if (!statusEl) return;

      const online = await Utils.isOnline();
      if (online) {
        statusEl.className = 'connection-status online';
        statusEl.innerHTML = '<i class="bi bi-cloud-check-fill"></i><span>Online</span>';
      } else {
        statusEl.className = 'connection-status offline';
        statusEl.innerHTML = '<i class="bi bi-cloud-slash-fill"></i><span>Offline</span>';
      }
    };

    checkConnection();
    setInterval(checkConnection, 30000);
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
  },

  async navigate(page) {
    // Don't navigate if not logged in
    if (sessionStorage.getItem('hrms_logged_in') !== 'true') return;

    // Role-based access control: redirect to dashboard on unauthorized pages
    if (page !== 'dashboard' && !Utils.canAccess(page)) {
      Utils.toast('Access denied: insufficient permissions', 'error');
      return this.navigate('dashboard');
    }

    this.currentPage = page;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      employees: 'Employee Management',
      leave: 'Leave Management',
      payroll: 'Payroll',
      pettyCash: 'Petty Cash Management',
      officeForms: 'Forms & Documents',
      expenses: 'Officer Expenses',
      reports: 'Reports',
      email: 'Email / Sync',
      settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Render the page module
    try {
      switch (page) {
        case 'dashboard': await Dashboard.render(); break;
        case 'employees': await Employees.render(); break;
        case 'leave': await Leave.render(); break;
        case 'payroll': await Payroll.render(); break;
        case 'pettyCash': await PettyCash.render(); break;
        case 'officeForms': await OfficeForms.render(); break;
        case 'expenses': await Expenses.render(); break;
        case 'reports': await Reports.render(); break;
        case 'email': await Email.render(); break;
        case 'settings': await Settings.render(); break;
      }
    } catch (err) {
      console.error(`Error rendering page "${page}":`, err);
      Utils.toast('Error loading page: ' + err.message, 'error');
    }
  }
};

// ─── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init().catch(err => {
    console.error('App init error:', err);
    Utils.toast('Failed to initialize application: ' + err.message, 'error');
  });
});
