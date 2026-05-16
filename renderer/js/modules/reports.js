// ─── Reports Module ──────────────────────────────────────────────

const Reports = {
  async render() {
    const container = document.getElementById('page-reports');

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <h3 style="margin:0">Generate Reports</h3>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generateEmployeeList()">
          <div class="stat-icon blue"><i class="bi bi-people"></i></div>
          <div class="stat-info">
            <h3>Employee List</h3>
            <p>View & print employee directory</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generateLeaveReport()">
          <div class="stat-icon yellow"><i class="bi bi-calendar-check"></i></div>
          <div class="stat-info">
            <h3>Leave Report</h3>
            <p>Leave records summary</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generatePayrollReport()">
          <div class="stat-icon green"><i class="bi bi-cash-stack"></i></div>
          <div class="stat-info">
            <h3>Payroll Report</h3>
            <p>Payroll summary by period</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generateExpenseReport()">
          <div class="stat-icon red"><i class="bi bi-receipt"></i></div>
          <div class="stat-info">
            <h3>Expense Report</h3>
            <p>Expense claims summary</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generateExpenseCategoryReport()">
          <div class="stat-icon orange" style="background:var(--warning-light);color:var(--warning)"><i class="bi bi-pie-chart"></i></div>
          <div class="stat-info">
            <h3>Expenses by Category</h3>
            <p>Category-wise expense breakdown</p>
          </div>
        </div>
      </div>

      <div id="reportOutput" class="mt-24" style="display:none"></div>

      <div class="card mt-24">
        <div class="card-header">
          <h3>Report Preview</h3>
          <div id="reportActions" style="display:none">
            <button class="btn btn-primary" onclick="Reports.printReport()">
              <i class="bi bi-printer"></i> Print
            </button>
            <button class="btn btn-outline" onclick="Reports.exportReport()">
              <i class="bi bi-download"></i> Export HTML
            </button>
            <button class="btn btn-outline" onclick="Reports.exportReportCSV()">
              <i class="bi bi-filetype-csv"></i> Export CSV
            </button>
          </div>
        </div>
        <div class="card-body" id="reportPreview">
          <div class="empty-state">
            <i class="bi bi-file-earmark-bar-graph"></i>
            <h3>Select a Report</h3>
            <p>Click on one of the report cards above to generate a report.</p>
          </div>
        </div>
      </div>
    `;
  },

  currentHtml: '',
  currentHeaders: [],
  currentRows: [],

  printReport() {
    if (!this.currentHtml) {
      Utils.toast('No report to print. Generate a report first.', 'warning');
      return;
    }

    if (window.electronAPI) {
      window.electronAPI.printContent(this.currentHtml)
        .then(result => {
          if (!result.success) Utils.toast('Print failed: ' + result.error, 'error');
        });
    } else {
      const printWin = window.open('', '_blank');
      printWin.document.write(this.currentHtml);
      printWin.document.close();
      printWin.focus();
      printWin.print();
    }
  },

  async exportReport() {
    if (!this.currentHtml) {
      Utils.toast('No report to export', 'warning');
      return;
    }

    const filename = `hr-report-${new Date().toISOString().split('T')[0]}.html`;

    if (window.electronAPI) {
      const result = await window.electronAPI.saveFile(
        filename,
        this.currentHtml,
        [{ name: 'HTML Files', extensions: ['html'] }]
      );
      if (result.success) {
        Utils.toast(`Report saved to ${result.filePath}`, 'success');
      }
    } else {
      Utils.browserDownload(filename, this.currentHtml, 'text/html');
      Utils.toast('Report downloaded', 'success');
    }
  },

  exportReportCSV() {
    if (!this.currentHeaders.length || !this.currentRows.length) {
      Utils.toast('No report data to export. Generate a report first.', 'warning');
      return;
    }

    const filename = `hr-report-${new Date().toISOString().split('T')[0]}.csv`;
    Utils.exportCSV(filename, this.currentHeaders, this.currentRows);
    Utils.toast('Report CSV downloaded', 'success');
  },

  async generateEmployeeList() {
    try {
    const employees = await DB.getEmployees();
    const company = await Utils.getCompanyInfo();

    this.currentHeaders = ['Employee ID', 'Name', 'Department', 'Position', 'Email', 'Phone', 'Salary', 'Seniority'];
    this.currentRows = employees.map(e => [
      e.employeeId,
      `${e.firstName} ${e.lastName}`,
      e.department,
      e.position,
      e.email,
      e.phone,
      Utils.formatCurrency(e.salary),
      Utils.getSeniorityInfo(Utils.getYearsOfService(e.employmentDate)).label
    ]);

    const html = this.buildReportHtml({
      title: 'Employee Directory',
      company,
      date: new Date(),
      headers: this.currentHeaders,
      rows: this.currentRows,
      footer: `Total Employees: ${employees.length}`
    });

    this.showReport(html, 'Employee Directory');
    } catch (err) {
      console.error('Employee list report error:', err);
      Utils.toast('Error generating report: ' + err.message, 'error');
    }
  },

  async generateLeaveReport() {
    try {
    const records = await DB.getLeaveRecords();
    const company = await Utils.getCompanyInfo();

    this.currentHeaders = ['Employee', 'Leave Type', 'Start', 'End', 'Days', 'Reason', 'Status'];
    this.currentRows = records.map(r => [
      r.employeeName,
      r.leaveType,
      Utils.formatDate(r.startDate),
      Utils.formatDate(r.endDate),
      String(r.days),
      r.reason || '—',
      r.status.toUpperCase()
    ]);

    const html = this.buildReportHtml({
      title: 'Leave Report',
      company,
      date: new Date(),
      headers: this.currentHeaders,
      rows: this.currentRows,
      footer: `Total Records: ${records.length} | Approved: ${records.filter(r => r.status === 'approved').length} | Pending: ${records.filter(r => r.status === 'pending').length}`
    });

    this.showReport(html, 'Leave Report');
    } catch (err) {
      console.error('Leave report error:', err);
      Utils.toast('Error generating report: ' + err.message, 'error');
    }
  },

  async generatePayrollReport() {
    try {
    const { month, year } = Utils.getCurrentPeriod();
    const allPayroll = await DB.getPayrollRecords();
    const company = await Utils.getCompanyInfo();
    const employees = await DB.getEmployees();

    // Build seniority lookup
    const seniorityMap = {};
    employees.forEach(e => {
      const fullName = `${e.firstName} ${e.lastName}`;
      seniorityMap[fullName] = Utils.getSeniorityInfo(Utils.getYearsOfService(e.employmentDate)).label;
      seniorityMap[e.employeeId] = seniorityMap[fullName];
    });

    const records = allPayroll.filter(r => r.month === month && r.year === year);

    this.currentHeaders = ['Employee', 'Seniority', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'];
    this.currentRows = records.map(r => [
      r.employeeName,
      seniorityMap[r.employeeName] || '—',
      Utils.formatCurrency(r.basicSalary),
      Utils.formatCurrency(r.allowances),
      Utils.formatCurrency(r.deductions),
      Utils.formatCurrency(r.netPay),
      r.status.toUpperCase()
    ]);

    const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.netPay), 0);

    const html = this.buildReportHtml({
      title: `Payroll Report - ${Utils.getMonthName(month)} ${year}`,
      company,
      date: new Date(),
      headers: this.currentHeaders,
      rows: this.currentRows,
      footer: `Total Paid: ${Utils.formatCurrency(totalPaid)} | Records: ${records.length}`
    });

    this.showReport(html, `Payroll Report - ${Utils.getMonthName(month)} ${year}`);
    } catch (err) {
      console.error('Payroll report error:', err);
      Utils.toast('Error generating report: ' + err.message, 'error');
    }
  },

  async generateExpenseReport() {
    try {
    const records = await DB.getExpenses();
    const company = await Utils.getCompanyInfo();

    const total = records.reduce((s, r) => s + Number(r.amount), 0);
    const approved = records.filter(r => r.status === 'approved').reduce((s, r) => s + Number(r.amount), 0);
    const pending = records.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0);

    this.currentHeaders = ['Officer', 'Department', 'Category', 'Amount', 'Date', 'Status'];
    this.currentRows = records.map(r => [
      r.officerName,
      r.department || '—',
      r.category,
      Utils.formatCurrency(r.amount),
      Utils.formatDate(r.date),
      r.status.toUpperCase()
    ]);

    const html = this.buildReportHtml({
      title: 'Expense Report',
      company,
      date: new Date(),
      headers: this.currentHeaders,
      rows: this.currentRows,
      footer: `Total Claims: ${records.length} | Total: ${Utils.formatCurrency(total)} | Approved: ${Utils.formatCurrency(approved)} | Pending: ${Utils.formatCurrency(pending)}`
    });

    this.showReport(html, 'Expense Report');
    } catch (err) {
      console.error('Expense report error:', err);
      Utils.toast('Error generating report: ' + err.message, 'error');
    }
  },

  async generateExpenseCategoryReport() {
    try {
    const records = await DB.getExpenses();
    const company = await Utils.getCompanyInfo();

    // Group by category
    const categories = {};
    records.forEach(r => {
      const cat = r.category || 'Other';
      if (!categories[cat]) categories[cat] = { count: 0, total: 0, approved: 0, pending: 0 };
      categories[cat].count++;
      categories[cat].total += Number(r.amount);
      if (r.status === 'approved') categories[cat].approved += Number(r.amount);
      if (r.status === 'pending') categories[cat].pending += Number(r.amount);
    });

    this.currentHeaders = ['Category', 'Claims', 'Total Amount', 'Approved', 'Pending'];
    this.currentRows = Object.entries(categories).map(([cat, data]) => [
      cat,
      String(data.count),
      Utils.formatCurrency(data.total),
      Utils.formatCurrency(data.approved),
      Utils.formatCurrency(data.pending)
    ]);

    const grandTotal = records.reduce((s, r) => s + Number(r.amount), 0);

    const html = this.buildReportHtml({
      title: 'Expenses by Category',
      company,
      date: new Date(),
      headers: this.currentHeaders,
      rows: this.currentRows,
      footer: `Total Categories: ${Object.keys(categories).length} | Grand Total: ${Utils.formatCurrency(grandTotal)} | Total Claims: ${records.length}`
    });

    this.showReport(html, 'Expenses by Category');
    } catch (err) {
      console.error('Category report error:', err);
      Utils.toast('Error generating report: ' + err.message, 'error');
    }
  },

  buildReportHtml({ title, company, date, headers, rows, footer }) {
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const logoHtml = company.logo
      ? `<img src="${Utils.escapeHtml(company.logo)}" style="height:60px;margin-bottom:10px" alt="Company Logo" />`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} - ${company.name}</title>
  <style>
    @page { margin: 20mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a2e05; padding: 20px; }
    .report-header { text-align: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #166534; }
    .report-header h1 { font-size: 22px; margin: 4px 0; color: #166534; }
    .report-header .subtitle { font-size: 13px; color: #57534e; }
    .report-header .address { font-size: 11px; color: #57534e; margin-top: 4px; }
    .report-meta { display: flex; justify-content: space-between; font-size: 11px; color: #57534e; margin-bottom: 20px; padding: 8px 12px; background: #f0fdf4; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #166534; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .report-footer { text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #57534e; }
    .summary-line { font-weight: 600; margin-top: 10px; color: #166534; }
    .company-details { font-size: 11px; color: #57534e; margin-top: 4px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    ${logoHtml}
    <h1>${Utils.escapeHtml(company.name)}</h1>
    <div class="subtitle">${Utils.escapeHtml(title)}</div>
    ${company.address ? `<div class="address">${Utils.escapeHtml(company.address)}</div>` : ''}
  </div>
  <div class="report-meta">
    <span>Generated: ${dateStr}</span>
    ${company.phone ? `<span>${Utils.escapeHtml(company.phone)}</span>` : ''}
    ${company.email ? `<span>${Utils.escapeHtml(company.email)}</span>` : ''}
  </div>
  <table>
    <thead>
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
  <div class="report-footer">
    <div class="summary-line">${footer}</div>
    <div class="company-details">${Utils.escapeHtml(company.name)} &mdash; Confidential</div>
    ${company.address ? `<div class="company-details">${Utils.escapeHtml(company.address)}</div>` : ''}
  </div>
</body>
</html>`;
  },

  showReport(html, title) {
    this.currentHtml = html;

    const preview = document.getElementById('reportPreview');
    const actions = document.getElementById('reportActions');
    const output = document.getElementById('reportOutput');

    if (preview) {
      // Build the iframe programmatically to avoid template literal issues
      preview.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'background:#f8fafc;border:1px solid var(--border);border-radius:var(--radius);padding:24px;overflow:auto;max-height:500px';

      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'width:100%;height:460px;border:none;background:#fff';
      iframe.srcdoc = html;
      wrapper.appendChild(iframe);
      preview.appendChild(wrapper);
    }

    if (actions) actions.style.display = 'flex';
    if (output) output.style.display = 'none';

    Utils.toast(`Report "${title}" generated`, 'success');
  }
};
