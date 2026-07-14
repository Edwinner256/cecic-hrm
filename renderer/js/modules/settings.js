// ─── Settings Module ─────────────────────────────────────────────

const Settings = {
  async render() {
    const container = document.getElementById('page-settings');
    const settings = await DB.getAllSettings();

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="bi bi-buildings-fill"></i></div>
          <div class="stat-info">
            <h3>${Utils.escapeHtml(settings.companyName || 'Not Set')}</h3>
            <p>Company Name</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="bi bi-envelope-fill"></i></div>
          <div class="stat-info">
            <h3>${settings.smtpHost ? 'Configured' : 'Not Configured'}</h3>
            <p>SMTP / Email</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan"><i class="bi bi-database-fill"></i></div>
          <div class="stat-info">
            <h3 id="recordCount">...</h3>
            <p>Total Records</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><i class="bi bi-hdd-stack-fill"></i></div>
          <div class="stat-info">
            <h3 id="dbSize">...</h3>
            <p>Database Size</p>
          </div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header"><h3>Company Information</h3></div>
        <div class="card-body">
          <form id="companyForm">
            <div class="form-row">
              <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="form-control" name="companyName" value="${Utils.escapeHtml(settings.companyName || '')}" placeholder="Your Company Ltd" />
              </div>
              <div class="form-group">
                <label>Company Email</label>
                <input type="email" class="form-control" name="companyEmail" value="${Utils.escapeHtml(settings.companyEmail || '')}" placeholder="info@company.co.ug" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Company Phone</label>
                <input type="text" class="form-control" name="companyPhone" value="${Utils.escapeHtml(settings.companyPhone || '')}" placeholder="+256 700 123 456" />
              </div>
              <div class="form-group">
                <label>Company Address</label>
                <textarea class="form-control" name="companyAddress" placeholder="P.O. Box 12345, Kampala, Uganda" rows="2">${Utils.escapeHtml(settings.companyAddress || '')}</textarea>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Finance &amp; Admin Name</label>
                <input type="text" class="form-control" name="adminDisplayName" value="${Utils.escapeHtml(settings.adminDisplayName || 'Finance & Admin')}" placeholder="Finance & Admin Officer" />
                <div class="hint">This name will appear on payslips and reports as the approving authority.</div>
              </div>
              <div class="form-group">
                <label>Finance &amp; Admin Title</label>
                <input type="text" class="form-control" name="adminTitle" value="${Utils.escapeHtml(settings.adminTitle || 'Finance & Admin Officer')}" placeholder="Finance & Admin Officer" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Company Logo</label>
                <input type="file" class="form-control" id="companyLogoInput" accept="image/*" />
                <div class="hint">Upload your company logo (PNG, JPG). It will appear in reports, forms, and the sidebar.</div>
              </div>
              <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:8px">
                <div id="logoPreview" style="display:${settings.companyLogo ? 'flex' : 'none'};align-items:center;gap:12px">
                  <img src="${Utils.escapeHtml(settings.companyLogo || '')}" style="width:64px;height:64px;border-radius:12px;object-fit:cover;border:2px solid var(--border);background:#fff" />
                  <div>
                    <div style="font-weight:600;font-size:13px">Current Logo</div>
                    <button type="button" class="btn btn-sm btn-outline mt-8" onclick="Settings.removeLogo()">
                      <i class="bi bi-trash3"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary"><i class="bi bi-save-fill"></i> Save Company Info</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header"><h3>Email (SMTP) Configuration</h3></div>
        <div class="card-body">
          <p class="text-muted mb-16">Configure SMTP settings to enable sending emails when connected to the internet. Use Gmail, Outlook, or any SMTP provider.</p>
          <form id="smtpForm">
            <div class="form-row-3">
              <div class="form-group">
                <label>SMTP Host</label>
                <input type="text" class="form-control" name="smtpHost" value="${Utils.escapeHtml(settings.smtpHost || '')}" placeholder="smtp.gmail.com" />
              </div>
              <div class="form-group">
                <label>Port</label>
                <input type="number" class="form-control" name="smtpPort" value="${settings.smtpPort || '587'}" placeholder="587" />
              </div>
              <div class="form-group">
                <label>Secure (SSL/TLS)</label>
                <select class="form-control" name="smtpSecure">
                  <option value="false" ${settings.smtpSecure === 'false' ? 'selected' : ''}>No (STARTTLS)</option>
                  <option value="true" ${settings.smtpSecure === 'true' ? 'selected' : ''}>Yes (SSL)</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>SMTP Username</label>
                <input type="text" class="form-control" name="smtpUser" value="${Utils.escapeHtml(settings.smtpUser || '')}" placeholder="your.email@gmail.com" />
              </div>
              <div class="form-group">
                <label>SMTP Password</label>
                <input type="password" class="form-control" name="smtpPass" value="${Utils.escapeHtml(settings.smtpPass || '')}" placeholder="App password or SMTP password" />
                <div class="hint">For Gmail, use an App Password (not your regular password).</div>
              </div>
            </div>
            <div class="form-group">
              <label>From Address</label>
              <input type="email" class="form-control" name="smtpFrom" value="${Utils.escapeHtml(settings.smtpFrom || '')}" placeholder="hr@company.co.ug" />
              <div class="hint">The "From" address that recipients will see.</div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary"><i class="bi bi-save-fill"></i> Save SMTP Settings</button>
              <button type="button" class="btn btn-outline" onclick="Settings.testEmail()"><i class="bi bi-send-fill"></i> Test Email</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card mb-24" id="departmentSection">
        <div class="card-header">
          <h3>Department Management</h3>
          <button class="btn btn-sm btn-primary" onclick="Settings.showAddDepartmentModal()">
            <i class="bi bi-plus-circle-fill"></i> Add Department
          </button>
        </div>
        <div class="card-body">
          <div id="deptListContainer">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <div class="card mb-24" id="userManagementSection">
        <div class="card-header">
          <h3>User Management</h3>
          <button class="btn btn-sm btn-primary" onclick="Settings.showAddUserModal()">
            <i class="bi bi-person-plus-fill"></i> Add User
          </button>
        </div>
        <div class="card-body">
          <p class="text-muted mb-16">Manage user accounts. Each user is assigned a role that controls what they can access.</p>
          <div id="userListContainer">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header"><h3>Data Management</h3></div>
        <div class="card-body">
          <div style="display:flex;flex-wrap:wrap;gap:12px">
            <button class="btn btn-outline" onclick="Settings.exportData()">
              <i class="bi bi-file-earmark-arrow-down"></i> Export All Data (JSON)
            </button>
            <button class="btn btn-outline" onclick="Settings.importData()">
              <i class="bi bi-file-earmark-arrow-up"></i> Import Data (JSON)
            </button>
            <button class="btn btn-success" onclick="Settings.loadDemoData()">
              <i class="bi bi-rocket-takeoff-fill"></i> Load Demo Data
            </button>
            <button class="btn btn-danger" onclick="Settings.resetData()">
              <i class="bi bi-exclamation-triangle-fill"></i> Reset All Data
            </button>
          </div>
          <div class="hint" style="margin-top:8px">
            <i class="bi bi-info-circle-fill"></i>
            "Load Demo Data" replaces all data with 12 employees, leave records, payroll, expenses, and settings — ideal for exploring the system.
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>About</h3></div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Application</span>
              <span class="value">Offline HR Management System</span>
            </div>
            <div class="detail-item">
              <span class="label">Version</span>
              <span class="value">1.0.0</span>
            </div>
            <div class="detail-item">
              <span class="label">Storage</span>
              <span class="value">IndexedDB (Local - Offline First)</span>
            </div>
            <div class="detail-item">
              <span class="label">Email</span>
              <span class="value">Nodemailer via SMTP (Online Only)</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind forms
    document.getElementById('companyForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Utils.getFormData(e.target);

      // Handle logo upload
      const logoInput = document.getElementById('companyLogoInput');
      if (logoInput && logoInput.files && logoInput.files[0]) {
        data.companyLogo = await Utils.fileToBase64(logoInput.files[0]);
      } else {
        // Keep existing logo if already saved
        data.companyLogo = settings.companyLogo || '';
      }

      for (const [key, value] of Object.entries(data)) {
        await DB.setSetting(key, value);
      }
      Utils.toast('Company information saved', 'success');
      this.render();
      App.updateCompanyBranding();
    });

    document.getElementById('smtpForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Utils.getFormData(e.target);
      for (const [key, value] of Object.entries(data)) {
        await DB.setSetting(key, value);
      }
      Utils.toast('SMTP settings saved', 'success');
      this.render();
    });

    // Load data
    this.loadStats();
    this.renderDepartmentList();
    this.renderUserList();
  },

  // ── User Management ───────────────────────────────────────

  async renderUserList() {
    const container = document.getElementById('userListContainer');
    if (!container) return;

    try {
      const users = await DB.getUsers();
      const currentUser = sessionStorage.getItem('hrms_user');

      if (users.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No users configured.</p></div>';
        return;
      }

      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
          ${users.map(u => {
            const isSelf = u.username === currentUser;
            const roleBadge = {
              admin: 'style="background:#166534;color:#fff"',
              finance: 'style="background:#ea580c;color:#fff"',
              staff: 'style="background:#0e7490;color:#fff"'
            }[u.role] || '';

            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg)">
                <div style="display:flex;align-items:center;gap:12px;min-width:0">
                  <i class="bi bi-person-circle" style="font-size:24px;color:var(--text-muted);flex-shrink:0"></i>
                  <div style="min-width:0">
                    <div style="font-weight:600;display:flex;align-items:center;gap:8px">
                      ${Utils.escapeHtml(u.displayName || u.username)}
                      ${isSelf ? '<span style="font-size:11px;color:var(--text-muted)">(you)</span>' : ''}
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
                      @${Utils.escapeHtml(u.username)}
                    </div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                  <span class="seniority-badge" ${roleBadge}>${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span>
                  <button class="btn btn-sm btn-outline" onclick="Settings.showEditUserModal(${u.id})" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  ${!isSelf ? `<button class="btn btn-sm btn-danger" onclick="Settings.deleteUser(${u.id})" title="Delete">
                    <i class="bi bi-trash3"></i>
                  </button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (err) {
      console.error('Error rendering users:', err);
      container.innerHTML = '<div class="empty-state"><p>Error loading users.</p></div>';
    }
  },

  showAddUserModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Add User</h2>
          <button class="modal-close" data-close>&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Username <span style="color:var(--danger)">*</span></label>
            <input type="text" class="form-control" id="newUsername" placeholder="e.g. jdoe" autofocus />
          </div>
          <div class="form-group">
            <label>Password <span style="color:var(--danger)">*</span></label>
            <input type="password" class="form-control" id="newPassword" placeholder="Minimum 4 characters" />
          </div>
          <div class="form-group">
            <label>Display Name</label>
            <input type="text" class="form-control" id="newDisplayName" placeholder="e.g. John Doe" />
          </div>
          <div class="form-group">
            <label>Employee ID (optional)</label>
            <input type="text" class="form-control" id="newEmployeeId" placeholder="e.g. EMP-001" />
          </div>
          <div class="form-group">
            <label>Role <span style="color:var(--danger)">*</span></label>
            <select class="form-control" id="newRole">
              <option value="staff">Staff</option>
              <option value="finance">Finance</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" data-cancel>Cancel</button>
          <button class="btn btn-primary" id="saveUserBtn"><i class="bi bi-person-plus-fill"></i> Add User</button>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.querySelector('[data-cancel]').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#saveUserBtn').addEventListener('click', async () => {
      const username = overlay.querySelector('#newUsername').value.trim();
      const password = overlay.querySelector('#newPassword').value;
      const displayName = overlay.querySelector('#newDisplayName').value.trim();
      const employeeId = overlay.querySelector('#newEmployeeId').value.trim();
      const role = overlay.querySelector('#newRole').value;

      if (!username || !password) {
        Utils.toast('Username and password are required', 'warning');
        return;
      }

      try {
        await DB.addUser({ username, password, displayName, employeeId, role });
        Utils.toast(`User "${username}" created`, 'success');
        close();
        this.render();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });

    overlay.querySelector('#newUsername').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('#saveUserBtn').click();
    });
  },

  showEditUserModal(id) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Load user data first
    DB.getUsers().then(users => {
      const user = users.find(u => u.id === id);
      if (!user) {
        Utils.toast('User not found', 'error');
        return;
      }

      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h2>Edit User</h2>
            <button class="modal-close" data-close>&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" value="${Utils.escapeHtml(user.username)}" disabled style="opacity:0.6" />
            </div>
            <div class="form-group">
              <label>New Password <span style="font-size:12px;color:var(--text-muted)">(leave blank to keep current)</span></label>
              <input type="password" class="form-control" id="editPassword" placeholder="Enter new password" />
            </div>
            <div class="form-group">
              <label>Display Name</label>
              <input type="text" class="form-control" id="editDisplayName" value="${Utils.escapeHtml(user.displayName || '')}" />
            </div>
            <div class="form-group">
              <label>Employee ID</label>
              <input type="text" class="form-control" id="editEmployeeId" value="${Utils.escapeHtml(user.employeeId || '')}" />
            </div>
            <div class="form-group">
              <label>Role <span style="color:var(--danger)">*</span></label>
              <select class="form-control" id="editRole">
                <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                <option value="finance" ${user.role === 'finance' ? 'selected' : ''}>Finance</option>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-cancel>Cancel</button>
            <button class="btn btn-primary" id="editUserBtn"><i class="bi bi-save-fill"></i> Save Changes</button>
          </div>
        </div>
      `;

      document.getElementById('modalContainer').appendChild(overlay);

      const close = () => overlay.remove();
      overlay.querySelector('[data-close]').addEventListener('click', close);
      overlay.querySelector('[data-cancel]').addEventListener('click', close);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

      overlay.querySelector('#editUserBtn').addEventListener('click', async () => {
        const password = overlay.querySelector('#editPassword').value;
        const displayName = overlay.querySelector('#editDisplayName').value.trim();
        const employeeId = overlay.querySelector('#editEmployeeId').value.trim();
        const role = overlay.querySelector('#editRole').value;

        try {
          const updateData = { displayName, employeeId, role };
          if (password) updateData.password = password;

          await DB.updateUser(id, updateData);
          Utils.toast('User updated', 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast(err.message, 'error');
        }
      });
    }).catch(err => {
      Utils.toast('Error loading user: ' + err.message, 'error');
    });
  },

  async deleteUser(id) {
    try {
      const users = await DB.getUsers();
      const user = users.find(u => u.id === id);
      if (!user) return;

      const confirmed = await Utils.confirm(
        `Delete user "${Utils.escapeHtml(user.username)}"? They will no longer be able to sign in.`,
        'Delete User'
      );
      if (!confirmed) return;

      await DB.deleteUser(id);
      Utils.toast('User deleted', 'success');
      this.render();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  },

  async loadStats() {
    try {
      const count = (await DB.getAllEmployees()).length +
        (await DB.getLeaveRecords()).length +
        (await DB.getPayrollRecords()).length +
        (await DB.getExpenses()).length;

      document.getElementById('recordCount').textContent = count;

      // Estimate database size
      const estimate = count * 2; // rough KB estimate
      document.getElementById('dbSize').textContent = estimate < 1000 ? `${estimate} KB` : `${(estimate / 1024).toFixed(1)} MB`;
    } catch (e) {
      // ok
    }
  },

  async renderDepartmentList() {
    const container = document.getElementById('deptListContainer');
    if (!container) return;

    try {
      const depts = await DB.getDepartments();
      const employees = await DB.getAllEmployees();

      if (depts.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No departments configured.</p></div>';
        return;
      }

      // Count employees per department
      const empCounts = {};
      employees.forEach(e => {
        empCounts[e.department] = (empCounts[e.department] || 0) + 1;
      });

      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
          ${depts.map(d => {
            const count = empCounts[d.name] || 0;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg)">
                <div>
                  <strong>${Utils.escapeHtml(d.name)}</strong>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${count} employee${count !== 1 ? 's' : ''}</div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="Settings.deleteDepartment(${d.id})" title="Delete" ${count > 0 ? 'disabled style="opacity:0.4"' : ''}>
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (err) {
      console.error('Error rendering departments:', err);
      container.innerHTML = '<div class="empty-state"><p>Error loading departments.</p></div>';
    }
  },

  showAddDepartmentModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Add Department</h2>
          <button class="modal-close" data-close>&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Department Name <span style="color:var(--danger)">*</span></label>
            <input type="text" class="form-control" id="newDeptName" placeholder="e.g. Research & Development" autofocus />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" data-cancel>Cancel</button>
          <button class="btn btn-primary" id="saveDeptBtn"><i class="bi bi-plus-circle-fill"></i> Add Department</button>
        </div>
      </div>
    `;

    document.getElementById('modalContainer').appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.querySelector('[data-cancel]').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#saveDeptBtn').addEventListener('click', async () => {
      const nameInput = overlay.querySelector('#newDeptName');
      const name = nameInput.value.trim();
      if (!name) {
        Utils.toast('Please enter a department name', 'warning');
        nameInput.focus();
        return;
      }

      try {
        await DB.addDepartment(name);
        Utils.toast(`Department "${name}" added`, 'success');
        close();
        this.render();
      } catch (err) {
        Utils.toast(err.message, 'error');
      }
    });

    // Enter key support
    overlay.querySelector('#newDeptName').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('#saveDeptBtn').click();
    });
  },

  async deleteDepartment(id) {
    try {
      await DB.deleteDepartment(id);
      Utils.toast('Department deleted', 'success');
      this.render();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  },

  async removeLogo() {
    await DB.setSetting('companyLogo', '');
    Utils.toast('Company logo removed', 'success');
    this.render();
    App.updateCompanyBranding();
  },

  async testEmail() {
    const settings = await DB.getAllSettings();
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      Utils.toast('Please configure SMTP settings first', 'warning');
      return;
    }

    if (!settings.companyEmail) {
      Utils.toast('Please set a company email to send the test to', 'warning');
      return;
    }

    const online = await Utils.isOnline();
    if (!online) {
      Utils.toast('No internet connection', 'warning');
      return;
    }

    Utils.toast('Sending test email...', 'info');

    try {
      const payload = {
        to: settings.companyEmail,
        subject: 'Test Email from Offline HRMS',
        html: '<h2>Test Email</h2><p>If you received this, your SMTP configuration is working correctly!</p><p>Sent from Offline HR Management System</p>',
        smtpConfig: {
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort || '587'),
          secure: settings.smtpSecure === 'true',
          user: settings.smtpUser,
          pass: settings.smtpPass,
          from: settings.smtpFrom || settings.smtpUser
        }
      };

      const result = Utils.isElectron()
        ? await window.electronAPI.sendEmail(payload)
        : await Utils.apiPost('/api/send-email', payload);

      if (result.success) {
        Utils.toast('Test email sent! Check your inbox.', 'success');
      } else {
        Utils.toast('Failed: ' + (result.error || 'Unknown'), 'error');
      }
    } catch (err) {
      Utils.toast('Error: ' + err.message, 'error');
    }
  },

  async exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      employees: await DB.getAllEmployees(),
      leave: await DB.getLeaveRecords(),
      payroll: await DB.getPayrollRecords(),
      expenses: await DB.getExpenses(),
      settings: await DB.getAllSettings()
    };

    const json = JSON.stringify(data, null, 2);

    if (window.electronAPI) {
      const result = await window.electronAPI.saveFile(
        `hrms-backup-${new Date().toISOString().split('T')[0]}.json`,
        json,
        [{ name: 'JSON Files', extensions: ['json'] }]
      );
      if (result.success) Utils.toast('Data exported successfully', 'success');
    } else {
      Utils.browserDownload(
        `hrms-backup-${new Date().toISOString().split('T')[0]}.json`,
        json,
        'application/json'
      );
      Utils.toast('Data exported', 'success');
    }
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.employees || !Array.isArray(data.employees)) {
          Utils.toast('Invalid backup file format', 'error');
          return;
        }

        const confirmed = await Utils.confirm(
          `This will import ${data.employees.length} employees, ${(data.leave || []).length} leave records, ${(data.payroll || []).length} payroll records, and ${(data.expenses || []).length} expenses. Existing data will be replaced. Continue?`,
          'Import Data'
        );

        if (!confirmed) return;

        // Clear and re-import
        await db.delete();
        await db.open();

        if (data.employees.length) await db.employees.bulkAdd(data.employees);
        if (data.leave?.length) await db.leave.bulkAdd(data.leave);
        if (data.payroll?.length) await db.payroll.bulkAdd(data.payroll);
        if (data.expenses?.length) await db.expenses.bulkAdd(data.expenses);
        if (data.settings) {
          for (const [key, value] of Object.entries(data.settings)) {
            await DB.setSetting(key, value);
          }
        }

        Utils.toast('Data imported successfully! Reloading...', 'success');
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        Utils.toast('Import failed: ' + err.message, 'error');
      }
    };
    input.click();
  },

  async resetData() {
    const confirmed = await Utils.confirm(
      '⚠️ This will permanently delete ALL data (employees, leave, payroll, expenses, and settings). This cannot be undone. Are you absolutely sure?',
      'Reset All Data'
    );

    if (!confirmed) return;

    const doubleConfirm = await Utils.confirm(
      'Type "RESET" to confirm: This action is irreversible.',
      'Final Confirmation'
    );

    if (!doubleConfirm) return;

    await db.delete();
    Utils.toast('All data has been reset. Reloading...', 'success');
    setTimeout(() => location.reload(), 1500);
  },

  async loadDemoData() {
    const confirmed = await Utils.confirm(
      'This will replace ALL existing data with demo data (12 employees, leave records, payroll, expenses). Current data will be lost.<br/><br/><strong>Continue?</strong>',
      'Load Demo Data'
    );
    if (!confirmed) return;

    Utils.toast('Loading demo data...', 'info');
    try {
      console.log('📦 Loading demo data...');
      await DB.loadDemoData();
      console.log('✅ Demo data seeded successfully');
      // Verify
      const empCount = await db.employees.count();
      const deptCount = await db.departments.count();
      console.log('📊 After seed — employees:', empCount, 'departments:', deptCount);
      Utils.toast(`Demo data loaded! (${empCount} employees, ${deptCount} departments). Reloading...`, 'success');
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      console.error('❌ Demo data load error:', err);
      Utils.toast('Error loading demo data: ' + err.message, 'error');
    }
  }
};
