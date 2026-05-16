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

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const errorEl = document.getElementById('loginError');

      // Simple auth: accept admin/admin123 or any non-empty username/password
      if ((username === 'admin' && password === 'admin123') ||
          (username && password && password.length >= 4)) {
        sessionStorage.setItem('hrms_logged_in', 'true');
        sessionStorage.setItem('hrms_user', username);
        errorEl.textContent = '';
        this.hideLogin();
        this.navigate('dashboard');
        Utils.toast(`Welcome, ${username}!`, 'success');
      } else {
        errorEl.textContent = '❌ Invalid credentials. Try admin / admin123';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
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
  },

  hideLogin() {
    document.getElementById('loginPage').style.display = 'none';
    document.body.classList.remove('login-active');
    document.getElementById('app').classList.add('logged-in');
  },

  logout() {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    sessionStorage.removeItem('hrms_logged_in');
    sessionStorage.removeItem('hrms_user');
    this.showLogin();
    Utils.toast('Signed out successfully', 'info');
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
        statusEl.innerHTML = '<i class="bi bi-wifi"></i><span>Online</span>';
      } else {
        statusEl.className = 'connection-status offline';
        statusEl.innerHTML = '<i class="bi bi-wifi-off"></i><span>Offline</span>';
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
