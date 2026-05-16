// ─── Leave Management Module ─────────────────────────────────────

const Leave = {
  async render() {
    const container = document.getElementById('page-leave');
    const employees = await DB.getEmployees();
    const records = await DB.getLeaveRecords();

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="leaveSearch" placeholder="Search by employee..." />
          </div>
          <select class="form-control" id="leaveStatusFilter" style="width:auto">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" onclick="Leave.showApplyModal()">
            <i class="bi bi-calendar-plus"></i> Apply Leave
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="bi bi-calendar-check"></i></div>
          <div class="stat-info">
            <h3>${records.filter(l => l.status === 'approved').length}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><i class="bi bi-clock"></i></div>
          <div class="stat-info">
            <h3>${records.filter(l => l.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="bi bi-x-circle"></i></div>
          <div class="stat-info">
            <h3>${records.filter(l => l.status === 'rejected').length}</h3>
            <p>Rejected</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="bi bi-person"></i></div>
          <div class="stat-info">
            <h3>${employees.length}</h3>
            <p>Eligible Staff</p>
          </div>
        </div>
      </div>

      <!-- Leave Balance Overview -->
      <div class="card mb-16">
        <div class="card-header">
          <h3>Leave Balances by Staff</h3>
          <button class="btn btn-sm btn-outline" onclick="Leave.toggleCalendar()">
            <i class="bi bi-calendar3"></i> Toggle Calendar View
          </button>
        </div>
        <div class="card-body" id="leaveBalanceContainer">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>Leave Records</h3></div>
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="leaveTableBody">
                ${this.renderRows(records, employees)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('leaveSearch').addEventListener('input', () => this.filter());
    document.getElementById('leaveStatusFilter').addEventListener('change', () => this.filter());

    // Load leave balances
    this.renderLeaveBalances();
  },

  renderRows(records, employees) {
    if (!records || records.length === 0) {
      return `<tr><td colspan="9"><div class="empty-state"><i class="bi bi-calendar-check"></i><h3>No Leave Records</h3><p>No leave applications found.</p></div></td></tr>`;
    }

    // Build photo lookup
    const photoMap = {};
    employees.forEach(e => {
      const fullName = `${e.firstName} ${e.lastName}`;
      photoMap[fullName] = e;
    });

    return records.map(r => {
      const badgeClass = r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning';
      const emp = photoMap[r.employeeName];

      let photoHtml = '';
      if (emp && emp.photo) {
        photoHtml = `<img class="photo-thumb" src="${Utils.escapeHtml(emp.photo)}" alt="" style="width:28px;height:28px" />`;
      } else if (emp) {
        photoHtml = `<span class="photo-placeholder" style="width:28px;height:28px;font-size:10px">${Utils.escapeHtml(emp.firstName.charAt(0))}${Utils.escapeHtml(emp.lastName.charAt(0))}</span>`;
      }

      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            ${photoHtml}
            <strong>${Utils.escapeHtml(r.employeeName)}</strong>
          </div>
        </td>
        <td><span class="badge badge-info">${Utils.escapeHtml(Utils.getLeaveTypeLabel(r.leaveType))}</span></td>
        <td>${Utils.formatDate(r.startDate)}</td>
        <td>${Utils.formatDate(r.endDate)}</td>
        <td><strong>${r.days}</strong></td>
        <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${Utils.escapeHtml(r.reason || '')}">${Utils.escapeHtml(r.reason || '—')}</td>
        <td><span class="badge ${badgeClass}">${r.status}</span></td>
        <td>${Utils.formatDate(r.appliedDate)}</td>
        <td>
          <div style="display:flex;gap:4px">
            ${r.status === 'pending' ? `
              <button class="btn btn-sm btn-success" onclick="Leave.approve(${r.id})" title="Approve"><i class="bi bi-check-lg"></i></button>
              <button class="btn btn-sm btn-danger" onclick="Leave.reject(${r.id})" title="Reject"><i class="bi bi-x-lg"></i></button>
            ` : ''}
            <button class="btn btn-sm btn-danger" onclick="Leave.confirmDelete(${r.id})" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  async filter() {
    const search = (document.getElementById('leaveSearch').value || '').toLowerCase();
    const status = document.getElementById('leaveStatusFilter').value;
    let records = await DB.getLeaveRecords();

    if (search) records = records.filter(r => r.employeeName.toLowerCase().includes(search));
    if (status) records = records.filter(r => r.status === status);

    const employees = await DB.getEmployees();
    document.getElementById('leaveTableBody').innerHTML = this.renderRows(records, employees);
  },

  async renderLeaveBalances() {
    const container = document.getElementById('leaveBalanceContainer');
    if (!container) return;

    try {
      const allBalances = await DB.getAllLeaveBalances();

      if (allBalances.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No employees found.</p></div>';
        return;
      }

      container.innerHTML = `
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Department</th>
                ${Object.keys(DB.LEAVE_ALLOCATIONS).map(type =>
                  `<th style="text-align:center" title="${DB.LEAVE_ALLOCATIONS[type].label}">${Utils.escapeHtml(type.charAt(0).toUpperCase() + type.slice(1, 5))}</th>`
                ).join('')}
                <th style="text-align:center">Used</th>
                <th style="text-align:center">Remaining</th>
              </tr>
            </thead>
            <tbody id="leaveCalendarBody">
              ${allBalances.map(emp => {
                const totalRemaining = Object.values(emp.balances).reduce((s, b) => s + b.remaining, 0);
                const totalTaken = Object.values(emp.balances).reduce((s, b) => s + b.taken, 0);

                let photoHtml = '';
                if (emp.photo) {
                  photoHtml = `<img class="photo-thumb" src="${Utils.escapeHtml(emp.photo)}" alt="" style="width:28px;height:28px" />`;
                } else {
                  photoHtml = `<span class="photo-placeholder" style="width:28px;height:28px;font-size:10px">${Utils.escapeHtml(emp.firstName.charAt(0))}${Utils.escapeHtml(emp.lastName.charAt(0))}</span>`;
                }

                return `<tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      ${photoHtml}
                      <strong>${Utils.escapeHtml(emp.name)}</strong>
                    </div>
                  </td>
                  <td>${Utils.escapeHtml(emp.department)}</td>
                  ${Object.keys(DB.LEAVE_ALLOCATIONS).map(type => {
                    const b = emp.balances[type];
                    const remaining = b ? b.remaining : 0;
                    const color = remaining === 0 ? 'var(--danger)' : remaining <= 2 ? 'var(--warning)' : 'var(--success)';
                    return `<td style="text-align:center;font-weight:600;color:${color}">${remaining}</td>`;
                  }).join('')}
                  <td style="text-align:center">${totalTaken}</td>
                  <td style="text-align:center;font-weight:700;color:${totalRemaining === 0 ? 'var(--danger)' : totalRemaining <= 5 ? 'var(--warning)' : 'var(--success)'}">${totalRemaining}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:8px;font-size:11px;color:var(--text-muted);display:flex;gap:16px;flex-wrap:wrap">
          ${Object.entries(DB.LEAVE_ALLOCATIONS).map(([type, config]) =>
            `<span><strong>${Utils.escapeHtml(config.label)}</strong>: ${config.days} days/year</span>`
          ).join('')}
        </div>
      `;
    } catch (err) {
      console.error('Leave balances error:', err);
      container.innerHTML = `<div class="empty-state"><p>Could not load leave balances.</p></div>`;
    }
  },

  toggleCalendar() {
    const container = document.getElementById('leaveBalanceContainer');
    if (!container) return;

    if (container.dataset.view === 'compact') {
      container.dataset.view = 'full';
      container.style.maxHeight = '';
    } else {
      container.dataset.view = 'compact';
      container.style.maxHeight = '300px';
      container.style.overflowY = 'auto';
    }
  },

  async showApplyModal() {
    const employees = await DB.getEmployees();
    const empOptions = [
      { value: '', label: '-- Select Employee --' },
      ...employees.map(e => ({
        value: e.employeeId,
        label: `${e.employeeId} — ${e.firstName} ${e.lastName} (${e.department})`
      }))
    ];

    Utils.showFormModal({
      title: 'Apply for Leave',
      size: 'modal-lg',
      fields: [
        {
          name: 'employeeId', label: 'Employee', type: 'select', required: true,
          options: empOptions
        },
        {
          name: 'leaveType', label: 'Leave Type', type: 'select', required: true,
          options: [
            { value: 'annual', label: 'Annual Leave (30 days/year)' },
            { value: 'sick', label: 'Sick Leave (15 days/year)' },
            { value: 'personal', label: 'Personal Leave (5 days/year)' },
            { value: 'maternity', label: 'Maternity Leave (90 days/year)' },
            { value: 'paternity', label: 'Paternity Leave (10 days/year)' },
            { value: 'study', label: 'Study Leave (30 days/year)' },
            { value: 'compassionate', label: 'Compassionate Leave (5 days/year)' }
          ]
        },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        {
          name: 'reason', label: 'Reason', type: 'textarea', required: true,
          placeholder: 'Reason for leave...'
        }
      ],
      onSubmit: async (data, close) => {
        const emp = employees.find(e => e.employeeId === data.employeeId);
        if (!emp) { Utils.toast('Please select an employee', 'error'); return; }

        data.employeeName = `${emp.firstName} ${emp.lastName}`;
        data.days = Utils.daysBetween(data.startDate, data.endDate);
        data.status = 'pending';

        // Check remaining leave balance
        const balances = await DB.getEmployeeLeaveBalances(data.employeeId);
        const balance = balances[data.leaveType];
        if (balance && data.days > balance.remaining) {
          const confirm = await Utils.confirm(
            `${emp.firstName} ${emp.lastName} only has ${balance.remaining} ${balance.label} days remaining but you're requesting ${data.days} days. Submit anyway?`,
            'Insufficient Balance'
          );
          if (!confirm) return;
        }

        try {
          await DB.addLeave(data);
          const remainingMsg = balance ? ` (${Math.max(0, balance.remaining - data.days)} days remaining after this)` : '';
          Utils.toast(`${balance.label} applied for ${data.employeeName}${remainingMsg}`, 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error: ' + err.message, 'error');
        }
      }
    });

    // Add leave balance info and photo preview
    setTimeout(() => {
      const select = document.querySelector('.modal-overlay:last-child select[name="employeeId"]');
      const leaveTypeSelect = document.querySelector('.modal-overlay:last-child select[name="leaveType"]');
      if (!select) return;

      // Add balance info area
      const formGroup = select.closest('.form-group');
      const balanceInfo = document.createElement('div');
      balanceInfo.id = 'leaveBalanceInfo';
      balanceInfo.style.cssText = 'margin-top:8px;font-size:13px;padding:8px 12px;border-radius:6px;background:var(--bg);border:1px solid var(--border)';
      if (formGroup) formGroup.appendChild(balanceInfo);

      const updateBalance = async (empId, leaveType) => {
        if (!empId || !leaveType) {
          balanceInfo.textContent = '';
          return;
        }
        const balances = await DB.getEmployeeLeaveBalances(empId);
        const b = balances[leaveType];
        if (b) {
          const pct = b.allocation > 0 ? Math.round((b.remaining / b.allocation) * 100) : 0;
          const color = b.remaining === 0 ? 'var(--danger)' : b.remaining <= 2 ? 'var(--warning)' : 'var(--success)';
          balanceInfo.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span><strong>${Utils.escapeHtml(b.label)} Balance:</strong></span>
              <span style="font-weight:700;color:${color}">${b.remaining} of ${b.allocation} days remaining</span>
            </div>
            <div style="margin-top:6px;height:6px;background:var(--border);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.3s"></div>
            </div>
          `;
        } else {
          balanceInfo.textContent = '';
        }
      };

      select.addEventListener('change', () => {
        updateBalance(select.value, leaveTypeSelect ? leaveTypeSelect.value : '');
      });

      if (leaveTypeSelect) {
        leaveTypeSelect.addEventListener('change', () => {
          updateBalance(select.value, leaveTypeSelect.value);
        });
      }
    }, 100);
  },

  async approve(id) {
    await DB.updateLeave(id, { status: 'approved', approvedBy: 'HR Admin' });
    Utils.toast('Leave approved', 'success');
    this.render();
  },

  async reject(id) {
    await DB.updateLeave(id, { status: 'rejected', approvedBy: 'HR Admin' });
    Utils.toast('Leave rejected', 'warning');
    this.render();
  },

  async confirmDelete(id) {
    const confirmed = await Utils.confirm('Delete this leave record?', 'Delete Leave');
    if (confirmed) {
      await DB.deleteLeave(id);
      Utils.toast('Leave record deleted', 'success');
      this.render();
    }
  }
};
