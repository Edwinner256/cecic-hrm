// ─── Utility Functions ──────────────────────────────────────────

const Utils = {
  /**
   * Format a number as currency (UGX by default)
   */
  formatCurrency(amount, currency = 'UGX') {
    return `${currency} ${Number(amount).toLocaleString('en-UG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  },

  /**
   * Format a date string to a readable format
   */
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Format date for input fields (YYYY-MM-DD)
   */
  toDateInputValue(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * Calculate number of days between two dates
   */
  daysBetween(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  },

  /**
   * Generate a unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  /**
   * Get current month/year as { month, year }
   */
  getCurrentPeriod() {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  },

  /**
   * Get month name
   */
  getMonthName(monthNum) {
    const names = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return names[monthNum - 1] || 'Unknown';
  },

  /**
   * Calculate net salary
   */
  calculateNetSalary(basic, allowances = 0, deductions = 0) {
    return Math.max(0, Number(basic) + Number(allowances) - Number(deductions));
  },

  /**
   * Escape HTML to prevent injection
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Show a toast notification
   */
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i> ${Utils.escapeHtml(message)}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Show a modal dialog
   */
  showModal({ title, content, size = '', onClose, footer = '' }) {
    const container = document.getElementById('modalContainer');
    if (!container) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal ${size}">
        <div class="modal-header">
          <h2>${Utils.escapeHtml(title)}</h2>
          <button class="modal-close" data-close>&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    container.appendChild(overlay);

    // Close handlers
    const close = () => {
      overlay.remove();
      if (onClose) onClose();
    };

    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    return { overlay, close };
  },

  /**
   * Show a confirmation dialog
   */
  async confirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
      const { close } = Utils.showModal({
        title,
        content: `<p style="font-size:14px;color:var(--text-muted)">${Utils.escapeHtml(message)}</p>`,
        size: 'modal-sm',
        footer: `
          <button class="btn btn-outline" data-cancel>Cancel</button>
          <button class="btn btn-danger" data-confirm>Confirm</button>
        `
      });

      const modalEl = document.querySelector('.modal-overlay:last-child');
      modalEl.querySelector('[data-confirm]').addEventListener('click', () => {
        close();
        resolve(true);
      });
      modalEl.querySelector('[data-cancel]').addEventListener('click', () => {
        close();
        resolve(false);
      });
    });
  },

  /**
   * Show a prompt-like form modal
   */
  showFormModal({ title, fields, size = '', onSubmit }) {
    let formHtml = '<div class="form-data">';
    fields.forEach(f => {
      // Skip hidden fields (rendered as empty divs, polluting the UI)
      if (f.type === 'hidden') return;

      const required = f.required ? 'required' : '';
      formHtml += `<div class="form-group">
        <label>${Utils.escapeHtml(f.label)}${f.required ? ' <span style="color:var(--danger)">*</span>' : ''}</label>
        ${f.type === 'textarea'
          ? `<textarea class="form-control" name="${f.name}" ${required}>${f.value || ''}</textarea>`
          : f.type === 'select'
            ? `<select class="form-control" name="${f.name}" ${required}>
                ${f.options.map(o => `<option value="${o.value}" ${o.value === f.value ? 'selected' : ''}>${o.label}</option>`).join('')}
               </select>`
            : f.type === 'file'
              ? `<input type="file" class="form-control" name="${f.name}" accept="${f.accept || '*'}" ${required}>`
              : `<input type="${f.type || 'text'}" class="form-control" name="${f.name}" value="${f.value || ''}" ${required} placeholder="${f.placeholder || ''}">`
        }
        ${f.hint ? `<div class="hint">${f.hint}</div>` : ''}
      </div>`;
    });
    formHtml += '</div>';

    const { close } = Utils.showModal({
      title,
      content: formHtml,
      size,
      footer: `
        <button class="btn btn-outline" data-cancel>Cancel</button>
        <button class="btn btn-primary" data-submit>Save</button>
      `
    });

    const modalEl = document.querySelector('.modal-overlay:last-child');
    modalEl.querySelector('[data-cancel]').addEventListener('click', close);
    modalEl.querySelector('[data-submit]').addEventListener('click', () => {
      const formData = {};
      const inputs = modalEl.querySelectorAll('[name]');
      inputs.forEach(inp => {
        formData[inp.name] = inp.type === 'file' ? inp.files[0] : inp.value;
      });
      onSubmit(formData, close);
    });
  },

  /**
   * Get form data from a form element
   */
  getFormData(formEl) {
    const data = {};
    const inputs = formEl.querySelectorAll('[name]');
    inputs.forEach(inp => {
      data[inp.name] = inp.value;
    });
    return data;
  },

  /**
   * Populate a form with data
   */
  populateForm(formEl, data) {
    const inputs = formEl.querySelectorAll('[name]');
    inputs.forEach(inp => {
      if (data[inp.name] !== undefined) {
        inp.value = data[inp.name];
      }
    });
  },

  /**
   * Check online status
   */
  async isOnline() {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.checkConnectivity();
        return result.online;
      }
      return navigator.onLine;
    } catch {
      return navigator.onLine;
    }
  },

  /**
   * Detect if running inside Electron desktop app
   */
  isElectron() {
    return !!(window.electronAPI && window.electronAPI.platform);
  },

  /**
   * Get the API base URL for browser-mode HTTP calls
   * Auto-detects the server port from the current page URL
   */
  getApiBaseUrl() {
    if (this.isElectron()) return '';
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}:${port || '3000'}`;
  },

  /**
   * Make a POST request to the backend API (browser mode)
   * Falls back to Electron IPC if available
   */
  async apiPost(endpoint, data) {
    // If in Electron, some endpoints use IPC directly
    if (this.isElectron()) {
      if (endpoint === '/api/send-email') {
        return await window.electronAPI.sendEmail(data);
      }
      return { success: false, error: 'Not available in Electron mode via API' };
    }

    // Browser mode: use fetch
    try {
      const baseUrl = this.getApiBaseUrl();
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Convert a File to a base64 data URL
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Calculate years of service from employment date
   */
  getYearsOfService(employmentDate) {
    if (!employmentDate) return 0;
    const start = new Date(employmentDate);
    const now = new Date();
    const diffMs = now - start;
    const years = diffMs / (365.25 * 24 * 60 * 60 * 1000);
    return Math.max(0, years);
  },

  /**
   * Get seniority level label and CSS class
   */
  getSeniorityInfo(years) {
    if (years < 1) return { label: '< 1 year', class: 'seniority-new' };
    if (years < 2) return { label: '1 year', class: 'seniority-junior' };
    if (years < 3) return { label: `${Math.floor(years)} years`, class: 'seniority-mid' };
    if (years < 5) return { label: `${Math.floor(years)} years`, class: 'seniority-senior' };
    if (years < 10) return { label: `${Math.floor(years)} years`, class: 'seniority-veteran' };
    return { label: `${Math.floor(years)}+ years`, class: 'seniority-veteran' };
  },

  /**
   * Render a seniority badge HTML
   */
  renderSeniorityBadge(employmentDate) {
    const years = this.getYearsOfService(employmentDate);
    const info = this.getSeniorityInfo(years);
    return `<span class="seniority-badge ${info.class}"><i class="bi bi-clock-history"></i> ${info.label}</span>`;
  },

  /**
   * Export data as CSV file download
   */
  exportCSV(filename, headers, rows) {
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const str = String(cell ?? '');
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      )
    ].join('\n');

    const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    this.browserDownload(filename, bom + csvContent, 'text/csv;charset=utf-8');
  },

  /**
   * Get the display label for a leave type key
   */
  getLeaveTypeLabel(type) {
    const labels = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      study: 'Study Leave',
      compassionate: 'Compassionate Leave'
    };
    return labels[type] || type;
  },

  /**
   * Load company settings (logo, name, address) for use across modules
   */
  async getCompanyInfo() {
    const settings = await DB.getAllSettings();
    return {
      name: settings.companyName || 'HRMS',
      email: settings.companyEmail || '',
      phone: settings.companyPhone || '',
      address: settings.companyAddress || '',
      logo: settings.companyLogo || ''
    };
  },

  /**
   * Download a file in the browser (creates a download prompt)
   */
  browserDownload(filename, content, mimeType = 'text/html') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
