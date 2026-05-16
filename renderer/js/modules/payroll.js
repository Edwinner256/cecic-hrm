// ─── Payroll Module ─────────────────────────────────────────────

const Payroll = {
  async render() {
    const container = document.getElementById('page-payroll');
    const { month, year } = Utils.getCurrentPeriod();

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="batch-controls" style="border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-card);margin-bottom:0">
            <div class="form-group">
              <label>Month</label>
              <select class="form-control" id="payrollMonth">
                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => `
                  <option value="${m}" ${m === month ? 'selected' : ''}>${Utils.getMonthName(m)}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Year</label>
              <select class="form-control" id="payrollYear">
                ${[2024, 2025, 2026, 2027].map(y => `
                  <option value="${y}" ${y === year ? 'selected' : ''}>${y}</option>
                `).join('')}
              </select>
            </div>
            <button class="btn btn-primary" onclick="Payroll.batchGenerate()" title="Generate payroll for ALL active employees for the selected month">
              <i class="bi bi-lightning-charge"></i> Generate All
            </button>
            <button class="btn btn-success" onclick="Payroll.downloadCSV()">
              <i class="bi bi-download"></i> Download CSV
            </button>
            <button class="btn btn-outline" onclick="Payroll.showProcessModal()">
              <i class="bi bi-person-plus"></i> Add Individual
            </button>
            <select class="form-control" id="payrollStatusFilter" style="width:auto">
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div id="payrollSummary"></div>
      <div id="payrollSenioritySection"></div>

      <div class="card">
        <div class="card-header">
          <h3>Payroll Records</h3>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-outline" onclick="Payroll.printPayroll()">
              <i class="bi bi-printer"></i> Print
            </button>
          </div>
        </div>
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Seniority</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="payrollTableBody">
                <tr><td colspan="10"><div class="loading-spinner"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Bind filters
    document.getElementById('payrollMonth').addEventListener('change', () => this.refresh());
    document.getElementById('payrollYear').addEventListener('change', () => this.refresh());
    document.getElementById('payrollStatusFilter').addEventListener('change', () => this.refresh());

    // Load data
    await this.refresh();
  },

  async refresh() {
    const month = parseInt(document.getElementById('payrollMonth').value);
    const year = parseInt(document.getElementById('payrollYear').value);
    const status = document.getElementById('payrollStatusFilter').value;

    const allEmployees = await DB.getEmployees();
    let records = await DB.getPayrollRecords();
    records = records.filter(r => r.month === month && r.year === year);
    if (status) records = records.filter(r => r.status === status);

    // Render summary
    await this.renderSummary(records, month, year);

    // Render seniority section
    await this.renderSenioritySection(allEmployees);

    // Render table
    const tbody = document.getElementById('payrollTableBody');
    tbody.innerHTML = this.renderRows(records, allEmployees);
  },

  renderRows(records, allEmployees) {
    if (!records || records.length === 0) {
      return `<tr><td colspan="10"><div class="empty-state"><i class="bi bi-cash-stack"></i><h3>No Payroll Records</h3><p>Click "Generate All" to create payroll for all employees, or "Add Individual" for a single employee.</p></div></td></tr>`;
    }

    // Build lookup for employee data (photo, seniority)
    const empMap = {};
    allEmployees.forEach(e => {
      const fullName = `${e.firstName} ${e.lastName}`;
      empMap[fullName] = e;
      empMap[e.employeeId] = e;
    });

    return records.map(r => {
      const badgeClass = r.status === 'paid' ? 'badge-success' : 'badge-warning';
      const emp = empMap[r.employeeName] || empMap[r.employeeId];

      let photoHtml = '';
      if (emp && emp.photo) {
        photoHtml = `<img class="photo-thumb" src="${Utils.escapeHtml(emp.photo)}" alt="" style="width:28px;height:28px" />`;
      } else if (emp) {
        photoHtml = `<span class="photo-placeholder" style="width:28px;height:28px;font-size:10px">${Utils.escapeHtml(emp.firstName.charAt(0))}${Utils.escapeHtml(emp.lastName.charAt(0))}</span>`;
      }

      const seniorityHtml = emp
        ? Utils.renderSeniorityBadge(emp.employmentDate)
        : '<span class="seniority-badge seniority-new">—</span>';

      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            ${photoHtml}
            <strong>${Utils.escapeHtml(r.employeeName)}</strong>
          </div>
        </td>
        <td>${Utils.getMonthName(r.month)} ${r.year}</td>
        <td>${seniorityHtml}</td>
        <td>${Utils.formatCurrency(r.basicSalary)}</td>
        <td>${Utils.formatCurrency(r.allowances)}</td>
        <td>${Utils.formatCurrency(r.deductions)}</td>
        <td><strong>${Utils.formatCurrency(r.netPay)}</strong></td>
        <td><span class="badge ${badgeClass}">${r.status}</span></td>
        <td>${r.paidDate ? Utils.formatDate(r.paidDate) : '—'}</td>
        <td>
          <div style="display:flex;gap:4px">
            ${r.status === 'pending' ? `
              <button class="btn btn-sm btn-success" onclick="Payroll.markPaid('${r.id}')" title="Mark as Paid"><i class="bi bi-check-lg"></i></button>
            ` : ''}
            <button class="btn btn-sm btn-danger" onclick="Payroll.confirmDelete('${r.id}')" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  async renderSummary(records, month, year) {
    const container = document.getElementById('payrollSummary');
    const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.netPay), 0);
    const totalPending = records.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.netPay), 0);
    const paidCount = records.filter(r => r.status === 'paid').length;
    const pendingCount = records.filter(r => r.status === 'pending').length;

    container.innerHTML = `
      <div class="card mb-16">
        <div class="payroll-summary">
          <div class="summary-item">
            <div class="value">${Utils.formatCurrency(totalPaid)}</div>
            <div class="label">Total Paid (${paidCount} emp)</div>
          </div>
          <div class="summary-item">
            <div class="value">${Utils.formatCurrency(totalPending)}</div>
            <div class="label">Total Pending (${pendingCount} emp)</div>
          </div>
          <div class="summary-item">
            <div class="value">${Utils.formatCurrency(totalPaid + totalPending)}</div>
            <div class="label">Grand Total</div>
          </div>
          <div class="summary-item">
            <div class="value">${records.length}</div>
            <div class="label">Records for ${Utils.getMonthName(month)} ${year}</div>
          </div>
        </div>
      </div>
    `;
  },

  async renderSenioritySection(employees) {
    const container = document.getElementById('payrollSenioritySection');
    if (!employees || employees.length === 0) {
      container.innerHTML = '';
      return;
    }

    // Group by seniority level
    const levels = { 'new': [], 'junior': [], 'mid': [], 'senior': [], 'veteran': [] };
    employees.forEach(e => {
      const years = Utils.getYearsOfService(e.employmentDate);
      const info = Utils.getSeniorityInfo(years);
      if (!levels[info.class.replace('seniority-', '')]) return;
      levels[info.class.replace('seniority-', '')].push(e);
    });

    container.innerHTML = `
      <div class="card mb-16">
        <div class="card-header"><h3>Staff Seniority Overview</h3></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">
            ${[
              { key: 'new', label: 'New (< 1 yr)', icon: 'bi-star', class: 'seniority-new' },
              { key: 'junior', label: 'Junior (1-2 yrs)', icon: 'bi-arrow-up', class: 'seniority-junior' },
              { key: 'mid', label: 'Mid (3-4 yrs)', icon: 'bi-bar-chart', class: 'seniority-mid' },
              { key: 'senior', label: 'Senior (5-9 yrs)', icon: 'bi-award', class: 'seniority-senior' },
              { key: 'veteran', label: 'Veteran (10+ yrs)', icon: 'bi-trophy', class: 'seniority-veteran' }
            ].map(g => `
              <div style="text-align:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg)">
                <div style="font-size:28px;font-weight:700;color:var(--text)">${levels[g.key].length}</div>
                <span class="seniority-badge ${g.class}" style="margin:4px 0"><i class="bi ${g.icon}"></i> ${g.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  async batchGenerate() {
    try {
      const monthInput = document.getElementById('payrollMonth');
      const yearInput = document.getElementById('payrollYear');

      if (!monthInput || !yearInput) {
        Utils.toast('Payroll page is not fully loaded. Please refresh.', 'error');
        return;
      }

      const month = parseInt(monthInput.value);
      const year = parseInt(yearInput.value);
      const employees = await DB.getEmployees();

      if (employees.length === 0) {
        Utils.toast('No active employees found. Add employees first.', 'warning');
        return;
      }

      const confirmed = await Utils.confirm(
        `Generate payroll for ALL ${employees.length} active employees for ${Utils.getMonthName(month)} ${year}?<br/><br/>
        <small style="color:var(--text-muted)">Each employee will get their base salary as basic pay with zero allowances/deductions by default. You can edit individual records afterward.</small>`,
        'Generate All Payroll'
      );
      if (!confirmed) return;

      Utils.toast(`Generating payroll for ${employees.length} employees...`, 'info');

      // Check existing records ONCE before the loop
      const existingPeriodRecords = await DB.getPayrollByPeriod(month, year);
      const existingEmpIds = new Set(existingPeriodRecords.map(r => r.employeeId));

      let created = 0;
      let skipped = 0;
      let errors = 0;

      for (const emp of employees) {
        if (existingEmpIds.has(emp.employeeId)) {
          skipped++;
          continue;
        }

        const data = {
        employeeId: emp.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        month,
        year,
        basicSalary: Number(emp.salary),
        allowances: 0,
        deductions: 0,
        netPay: Number(emp.salary),
        status: 'pending',
        paidDate: ''
      };

      await DB.addPayroll(data);
      created++;
    }

    Utils.toast(`Created ${created} payroll record(s)${skipped > 0 ? ` (${skipped} skipped — already exist)` : ''}${errors > 0 ? ` (${errors} errors)` : ''}`, created > 0 ? 'success' : 'info');
    this.refresh();
    } catch (err) {
      console.error('Batch generate error:', err);
      Utils.toast('Error generating payroll: ' + err.message, 'error');
    }
  },

  downloadCSV() {
    const month = parseInt(document.getElementById('payrollMonth').value);
    const year = parseInt(document.getElementById('payrollYear').value);

    // Read current table data
    const rows = [];
    document.querySelectorAll('#payrollTableBody tr').forEach(tr => {
      if (tr.querySelector('td[colspan]')) return; // Skip empty state
      const tds = tr.querySelectorAll('td');
      if (tds.length < 7) return;

      const employee = tds[0].textContent.trim();
      const period = tds[1].textContent.trim();
      const seniority = tds[2].textContent.trim();
      const basic = tds[3].textContent.trim();
      const allowances = tds[4].textContent.trim();
      const deductions = tds[5].textContent.trim();
      const netPay = tds[6].textContent.trim();
      const status = tds[7].textContent.trim();
      const paidDate = tds[8] ? tds[8].textContent.trim() : '';

      rows.push([employee, period, seniority, basic, allowances, deductions, netPay, status, paidDate]);
    });

    if (rows.length === 0) {
      Utils.toast('No payroll data to export', 'warning');
      return;
    }

    Utils.exportCSV(
      `payroll-${Utils.getMonthName(month)}-${year}.csv`,
      ['Employee', 'Period', 'Seniority', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status', 'Paid Date'],
      rows
    );
    Utils.toast(`Payroll CSV downloaded for ${Utils.getMonthName(month)} ${year}`, 'success');
  },

  printPayroll() {
    const month = parseInt(document.getElementById('payrollMonth').value);
    const year = parseInt(document.getElementById('payrollYear').value);

    // Build print HTML
    const rows = [];
    document.querySelectorAll('#payrollTableBody tr').forEach(tr => {
      if (tr.querySelector('td[colspan]')) return;
      const tds = tr.querySelectorAll('td');
      if (tds.length < 7) return;
      rows.push({
        employee: tds[0].textContent.trim(),
        period: tds[1].textContent.trim(),
        seniority: tds[2].textContent.trim(),
        basic: tds[3].textContent.trim(),
        allowances: tds[4].textContent.trim(),
        deductions: tds[5].textContent.trim(),
        netPay: tds[6].textContent.trim(),
        status: tds[7].textContent.trim(),
        paidDate: tds[8] ? tds[8].textContent.trim() : ''
      });
    });

    if (rows.length === 0) {
      Utils.toast('No payroll data to print', 'warning');
      return;
    }

    // Get company info for the print template
    Utils.getCompanyInfo().then(company => {
      const logoHtml = company.logo
        ? `<img src="${company.logo}" style="height:50px;margin-bottom:8px" alt="Logo" />`
        : '';

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payroll - ${Utils.getMonthName(month)} ${year}</title>
  <style>
    @page { margin: 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a2e05; padding: 20px; }
    .print-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #166534; }
    .print-header h1 { font-size: 20px; margin: 4px 0; color: #166534; }
    .print-header .subtitle { font-size: 12px; color: #57534e; }
    .print-meta { display: flex; justify-content: space-between; font-size: 11px; color: #57534e; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
    th { background: #166534; color: #fff; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .print-footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #57534e; }
    .print-summary { display: flex; justify-content: space-around; margin-bottom: 16px; padding: 12px; background: #f0fdf4; border-radius: 8px; }
    .print-summary div { text-align: center; }
    .print-summary .val { font-size: 16px; font-weight: 700; color: #166534; }
    .print-summary .lbl { font-size: 10px; color: #57534e; text-transform: uppercase; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-header">
    ${logoHtml}
    <h1>${company.name}</h1>
    <div class="subtitle">Payroll Report — ${Utils.getMonthName(month)} ${year}</div>
    ${company.address ? `<div class="subtitle">${company.address}</div>` : ''}
  </div>
  <div class="print-meta">
    <span>Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
    <span>Records: ${rows.length}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Employee</th>
        <th>Seniority</th>
        <th>Basic Salary</th>
        <th>Allowances</th>
        <th>Deductions</th>
        <th>Net Pay</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `<tr>
        <td>${r.employee}</td>
        <td>${r.seniority}</td>
        <td>${r.basic}</td>
        <td>${r.allowances}</td>
        <td>${r.deductions}</td>
        <td><strong>${r.netPay}</strong></td>
        <td>${r.status.toUpperCase()}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="print-footer">
    <p>${company.name} &mdash; Confidential</p>
    ${company.address ? `<p>${company.address} | ${company.phone || ''} | ${company.email || ''}</p>` : ''}
  </div>
</body>
</html>`;

      // Use Reports module approach for printing
      if (window.electronAPI) {
        window.electronAPI.printContent(html)
          .then(result => {
            if (!result.success) Utils.toast('Print failed: ' + result.error, 'error');
          });
      } else {
        const printWin = window.open('', '_blank');
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        printWin.print();
      }
    });
  },

  showProcessModal() {
    Utils.showFormModal({
      title: 'Process Individual Payroll',
      size: 'modal-lg',
      fields: [
        {
          name: 'employeeId', label: 'Employee', type: 'select', required: true,
          options: [{ value: '', label: '-- Select Employee --' }]
        },
        { name: 'month', label: 'Month', type: 'select', required: true, value: Utils.getCurrentPeriod().month,
          options: [1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ value: m, label: Utils.getMonthName(m) }))
        },
        { name: 'year', label: 'Year', type: 'select', required: true, value: Utils.getCurrentPeriod().year,
          options: [2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }))
        },
        { name: 'basicSalary', label: 'Basic Salary (UGX)', type: 'number', required: true, placeholder: 'e.g. 5000000' },
        { name: 'allowances', label: 'Allowances (UGX)', type: 'number', value: '0' },
        { name: 'deductions', label: 'Deductions (UGX)', type: 'number', value: '0' }
      ],
      onSubmit: async (data, close) => {
        const emp = await DB.getEmployeeByEmpId(data.employeeId);
        if (!emp) { Utils.toast('Please select an employee', 'error'); return; }

        data.employeeName = `${emp.firstName} ${emp.lastName}`;
        data.basicSalary = Number(data.basicSalary);
        data.allowances = Number(data.allowances || 0);
        data.deductions = Number(data.deductions || 0);
        data.netPay = Utils.calculateNetSalary(data.basicSalary, data.allowances, data.deductions);
        data.status = 'pending';
        data.paidDate = '';
        data.month = parseInt(data.month);
        data.year = parseInt(data.year);

        // Check for existing record
        const existing = await DB.getPayrollByPeriod(data.month, data.year);
        if (existing.some(r => r.employeeId === data.employeeId)) {
          const confirm = await Utils.confirm(
            `${emp.firstName} ${emp.lastName} already has a payroll record for ${Utils.getMonthName(data.month)} ${data.year}. Overwrite?`,
            'Duplicate Record'
          );
          if (!confirm) return;
          const old = existing.find(r => r.employeeId === data.employeeId);
          if (old) await DB.deletePayroll(old.id);
        }

        try {
          await DB.addPayroll(data);
          Utils.toast(`Payroll processed for ${data.employeeName}: ${Utils.formatCurrency(data.netPay)}`, 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error: ' + err.message, 'error');
        }
      }
    });

    // Populate employee dropdown
    setTimeout(async () => {
      const select = document.querySelector('.modal-overlay:last-child select[name="employeeId"]');
      if (select) {
        const employees = await DB.getEmployees();
        employees.forEach(e => {
          const opt = document.createElement('option');
          opt.value = e.employeeId;
          opt.textContent = `${e.employeeId} - ${e.firstName} ${e.lastName}`;
          select.appendChild(opt);
        });

        select.addEventListener('change', async () => {
          const emp = await DB.getEmployeeByEmpId(select.value);
          if (emp) {
            const basicInput = document.querySelector('[name="basicSalary"]');
            if (basicInput) basicInput.value = emp.salary;
          }
        });
      }
    }, 50);
  },

  async markPaid(id) {
    await DB.updatePayroll(id, {
      status: 'paid',
      paidDate: Utils.toDateInputValue(new Date())
    });
    Utils.toast('Payroll marked as paid', 'success');
    this.refresh();
  },

  async confirmDelete(id) {
    const confirmed = await Utils.confirm('Delete this payroll record?', 'Delete Record');
    if (confirmed) {
      await DB.deletePayroll(id);
      Utils.toast('Payroll record deleted', 'success');
      this.refresh();
    }
  }
};
