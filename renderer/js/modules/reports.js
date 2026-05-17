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
          <div class="stat-icon blue"><i class="bi bi-people-fill"></i></div>
          <div class="stat-info">
            <h3>Employee List</h3>
            <p>View & print employee directory</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generateLeaveReport()">
          <div class="stat-icon yellow"><i class="bi bi-calendar-check-fill"></i></div>
          <div class="stat-info">
            <h3>Leave Report</h3>
            <p>Leave records summary</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generatePayrollReport()">
          <div class="stat-icon green"><i class="bi bi-cash-coin"></i></div>
          <div class="stat-info">
            <h3>Payroll Report</h3>
            <p>Payroll summary by period</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generateExpenseReport()">
          <div class="stat-icon red"><i class="bi bi-receipt-cutoff"></i></div>
          <div class="stat-info">
            <h3>Expense Report</h3>
            <p>Expense claims summary</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.generateExpenseCategoryReport()">
          <div class="stat-icon orange" style="background:var(--warning-light);color:var(--warning)"><i class="bi bi-pie-chart-fill"></i></div>
          <div class="stat-info">
            <h3>Expenses by Category</h3>
            <p>Category-wise expense breakdown</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="Reports.showFinancialReportForm()">
          <div class="stat-icon purple" style="background:#f3e8ff;color:#7c3aed"><i class="bi bi-calculator-fill"></i></div>
          <div class="stat-info">
            <h3>Monthly Financial Summary</h3>
            <p>Salaries, expenses & unforeseen costs</p>
          </div>
        </div>
      </div>

      <div id="reportOutput" class="mt-24" style="display:none"></div>

      <div class="card mt-24">
        <div class="card-header">
          <h3>Report Preview</h3>
          <div id="reportActions" style="display:none">
            <button class="btn btn-primary" onclick="Reports.printReport()">
              <i class="bi bi-printer-fill"></i> Print
            </button>
            <button class="btn btn-outline" onclick="Reports.exportReport()">
              <i class="bi bi-file-earmark-arrow-down"></i> Export HTML
            </button>
            <button class="btn btn-outline" onclick="Reports.exportReportCSV()">
              <i class="bi bi-file-earmark-spreadsheet-fill"></i> Export CSV
            </button>
          </div>
        </div>
        <div class="card-body" id="reportPreview">
          <div class="empty-state">
            <i class="bi bi-bar-chart-fill"></i>
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

    Utils.printHTML(this.currentHtml, 'HR Report');
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

  showFinancialReportForm() {
    const { month: curMonth, year: curYear } = Utils.getCurrentPeriod();

    const output = document.getElementById('reportOutput');
    if (!output) return;

    output.style.display = 'block';
    output.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3><i class="bi bi-calculator-fill"></i> Monthly Financial Summary</h3>
        </div>
        <div class="card-body">
          <div class="form-row" style="align-items:flex-end">
            <div class="form-group">
              <label>Month</label>
              <select class="form-control" id="finMonth">
                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m =>
                  `<option value="${m}" ${m === curMonth ? 'selected' : ''}>${Utils.getMonthName(m)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Year</label>
              <select class="form-control" id="finYear">
                ${[2025, 2026, 2027, 2028].map(y =>
                  `<option value="${y}" ${y === curYear ? 'selected' : ''}>${y}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <button class="btn btn-primary" onclick="Reports.generateMonthlyFinancialReport()" style="margin-bottom:2px">
                <i class="bi bi-calculator-fill"></i> Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async generateMonthlyFinancialReport() {
    try {
      const month = parseInt(document.getElementById('finMonth').value);
      const year = parseInt(document.getElementById('finYear').value);
      const company = await Utils.getCompanyInfo();
      const periodLabel = `${Utils.getMonthName(month)} ${year}`;

      // ── Payroll Data ────────────────────────────────────────
      const allPayroll = await DB.getPayrollRecords();
      const payrollRecords = allPayroll.filter(r => r.month === month && r.year === year);

      const totalBasic = payrollRecords.reduce((s, r) => s + Number(r.basicSalary), 0);
      const totalAllowances = payrollRecords.reduce((s, r) => s + Number(r.allowances), 0);
      const totalDeductions = payrollRecords.reduce((s, r) => s + Number(r.deductions), 0);
      const totalNetPay = payrollRecords.reduce((s, r) => s + Number(r.netPay), 0);
      const totalPaid = payrollRecords.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.netPay), 0);
      const payrollPending = payrollRecords.filter(r => r.status === 'pending');

      // ── Expense Data ────────────────────────────────────────
      const allExpenses = await DB.getExpenses();
      const monthStr = String(month).padStart(2, '0');
      const yearStr = String(year);
      const expenseRecords = allExpenses.filter(r => {
        // Match expenses whose date falls in the selected month/year
        if (!r.date) return false;
        const parts = r.date.split('-');
        return parts.length >= 2 && parts[0] === yearStr && parts[1] === monthStr;
      });

      // Group approved expenses by category
      const approvedExpenses = expenseRecords.filter(r => r.status === 'approved');
      const categories = {};
      approvedExpenses.forEach(r => {
        const cat = r.category || 'Other';
        if (!categories[cat]) categories[cat] = { count: 0, total: 0 };
        categories[cat].count++;
        categories[cat].total += Number(r.amount);
      });

      const totalApprovedExpenses = approvedExpenses.reduce((s, r) => s + Number(r.amount), 0);
      const totalPendingExpenses = expenseRecords.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0);

      // Unforeseen = "Other" category expenses
      const unforeseenExpenses = approvedExpenses.filter(r => (r.category || 'Other') === 'Other');
      const totalUnforeseen = unforeseenExpenses.reduce((s, r) => s + Number(r.amount), 0);

      // ── Build Payroll Table ─────────────────────────────────
      const payrollHeaders = ['Employee', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'];
      const payrollRows = payrollRecords.map(r => [
        r.employeeName,
        Utils.formatCurrency(r.basicSalary),
        Utils.formatCurrency(r.allowances),
        Utils.formatCurrency(r.deductions),
        Utils.formatCurrency(r.netPay),
        r.status.toUpperCase()
      ]);

      // ── Build Expense Category Table ────────────────────────
      const expenseHeaders = ['Category', 'Claims', 'Amount', '% of Total'];
      const expenseRows = Object.entries(categories).map(([cat, data]) => [
        cat,
        String(data.count),
        Utils.formatCurrency(data.total),
        totalApprovedExpenses > 0 ? ((data.total / totalApprovedExpenses) * 100).toFixed(1) + '%' : '0%'
      ]);

      // ── Build Summary Section ───────────────────────────────
      const totalExpenditure = totalNetPay + totalApprovedExpenses;
      const payrollCount = payrollRecords.length;
      const expenseCount = approvedExpenses.length;

      // Summary rows for the report footer/overview
      const summaryItems = [
        { label: 'Payroll Summary', value: '', header: true },
        { label: '  Employees on Payroll', value: String(payrollCount) },
        { label: '  Total Basic Salaries', value: Utils.formatCurrency(totalBasic) },
        { label: '  Total Allowances', value: Utils.formatCurrency(totalAllowances) },
        { label: '  Total Deductions', value: Utils.formatCurrency(totalDeductions) },
        { label: '  Net Salaries Paid', value: Utils.formatCurrency(totalNetPay), bold: true },
        { label: '', value: '', spacer: true },
        { label: 'Expense Summary', value: '', header: true },
        { label: '  Total Approved Expenses', value: Utils.formatCurrency(totalApprovedExpenses), bold: true },
        { label: '    of which Unforeseen (Other)', value: Utils.formatCurrency(totalUnforeseen), indent: true },
        { label: '  Pending Expenses', value: Utils.formatCurrency(totalPendingExpenses) },
        { label: '', value: '', spacer: true },
        { label: 'GRAND TOTAL (Salaries + Expenses)', value: Utils.formatCurrency(totalExpenditure), grandTotal: true },
      ];

      if (payrollPending.length > 0) {
        summaryItems.push({ label: '', value: '', spacer: true });
        summaryItems.push({ label: `⚠ ${payrollPending.length} payroll record(s) still pending`, value: '', warning: true });
      }

      // ── Build Full Report HTML ──────────────────────────────
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const logoHtml = company.logo
        ? `<img src="${Utils.escapeHtml(company.logo)}" style="height:60px;margin-bottom:10px" alt="Company Logo" />`
        : '';

      let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Monthly Financial Summary - ${periodLabel}</title>
  <style>
    @page { margin: 18mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a2e05; padding: 20px; }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 3px solid #166534; }
    .header h1 { font-size: 22px; margin: 4px 0; color: #166534; }
    .header h2 { font-size: 16px; margin: 4px 0; color: #7c3aed; font-weight: 500; }
    .header .address { font-size: 11px; color: #57534e; margin-top: 4px; }
    .meta { display: flex; justify-content: space-between; font-size: 11px; color: #57534e; margin-bottom: 20px; padding: 8px 14px; background: #f0fdf4; border-radius: 6px; }
    .section-title { font-size: 15px; font-weight: 700; color: #166534; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #d4d4d4; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { background: #166534; color: #fff; padding: 7px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .summary-table td { border: none; padding: 5px 10px; }
    .summary-table tr:nth-child(even) td { background: transparent; }
    .summary-table .header-row td { font-weight: 700; color: #166534; font-size: 13px; padding-top: 14px; border-bottom: 1px solid #166534; }
    .summary-table .bold-row td { font-weight: 700; }
    .summary-table .grand-total td { font-weight: 800; font-size: 14px; color: #166534; border-top: 2px solid #166534; padding-top: 10px; }
    .summary-table .indent td { padding-left: 28px; color: #7c3aed; }
    .summary-table .warning td { color: #dc2626; font-style: italic; font-size: 11px; }
    .summary-table .spacer td { padding: 2px; }
    .footer { text-align: center; margin-top: 28px; padding-top: 14px; border-top: 1px solid #d4d4d4; font-size: 11px; color: #57534e; }
    .summary-box { background: #f0fdf4; border: 1px solid #166534; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .summary-box .line { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .summary-box .line.total { font-weight: 800; font-size: 16px; color: #166534; border-top: 2px solid #166534; margin-top: 6px; padding-top: 8px; }
    .unforeseen { color: #7c3aed; font-weight: 600; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <h1>${Utils.escapeHtml(company.name)}</h1>
    <h2>Monthly Financial Summary</h2>
    <div>${periodLabel}</div>
    ${company.address ? `<div class="address">${Utils.escapeHtml(company.address)}</div>` : ''}
  </div>
  <div class="meta">
    <span>Generated: ${dateStr}</span>
    ${company.phone ? `<span>${Utils.escapeHtml(company.phone)}</span>` : ''}
    ${company.email ? `<span>${Utils.escapeHtml(company.email)}</span>` : ''}
  </div>`;

      // ── Payroll Section ─────────────────────────────────────
      if (payrollRecords.length > 0) {
        html += `
  <div class="section-title">📋 Payroll Register — ${periodLabel}</div>
  <table>
    <thead><tr>${payrollHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${payrollRows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
      <tr style="font-weight:700;background:#f0fdf4">
        <td>TOTAL</td>
        <td>${Utils.formatCurrency(totalBasic)}</td>
        <td>${Utils.formatCurrency(totalAllowances)}</td>
        <td>${Utils.formatCurrency(totalDeductions)}</td>
        <td>${Utils.formatCurrency(totalNetPay)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>`;
      } else {
        html += `<div style="background:#fef2f2;padding:12px;border-radius:6px;color:#dc2626;margin:16px 0">No payroll records found for ${periodLabel}.</div>`;
      }

      // ── Expense Section ─────────────────────────────────────
      if (approvedExpenses.length > 0) {
        html += `
  <div class="section-title">📄 Approved Expenses — ${periodLabel}</div>
  <table>
    <thead><tr>${expenseHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${expenseRows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
      <tr style="font-weight:700;background:#f0fdf4">
        <td>TOTAL</td>
        <td>${approvedExpenses.length}</td>
        <td>${Utils.formatCurrency(totalApprovedExpenses)}</td>
        <td>100%</td>
      </tr>
    </tbody>
  </table>`;

        if (totalUnforeseen > 0) {
          html += `<div style="margin:8px 0;padding:8px 12px;background:#f3e8ff;border-radius:6px;color:#7c3aed;font-size:12px">
            ⚡ <strong>Unforeseen Expenses:</strong> ${Utils.formatCurrency(totalUnforeseen)} (${((totalUnforeseen / totalApprovedExpenses) * 100).toFixed(1)}% of total expenses — categorized as "Other")
          </div>`;
        }
      } else {
        html += `<div style="background:#fef2f2;padding:12px;border-radius:6px;color:#dc2626;margin:16px 0">No approved expenses found for ${periodLabel}.</div>`;
      }

      // ── Financial Summary Box ───────────────────────────────
      html += `
  <div class="section-title">💰 Financial Summary — ${periodLabel}</div>
  <div class="summary-box">
    <div class="line"><span>Total Basic Salaries</span><span>${Utils.formatCurrency(totalBasic)}</span></div>
    <div class="line"><span>Total Allowances</span><span>${Utils.formatCurrency(totalAllowances)}</span></div>
    <div class="line"><span>Total Deductions</span><span style="color:#dc2626">−${Utils.formatCurrency(totalDeductions)}</span></div>
    <div class="line"><strong>Net Salaries Paid</strong><strong>${Utils.formatCurrency(totalNetPay)}</strong></div>
    <div class="line"><span>Approved Expenses</span><span>${Utils.formatCurrency(totalApprovedExpenses)}</span></div>
    ${totalUnforeseen > 0 ? `<div class="line unforeseen"><span>　↳ Unforeseen (Other)</span><span>${Utils.formatCurrency(totalUnforeseen)}</span></div>` : ''}
    ${totalPendingExpenses > 0 ? `<div class="line" style="color:#d97706"><span>Pending Expenses (not yet approved)</span><span>${Utils.formatCurrency(totalPendingExpenses)}</span></div>` : ''}
    <div class="line total"><span>GRAND TOTAL</span><span>${Utils.formatCurrency(totalExpenditure)}</span></div>
  </div>`;

      if (payrollPending.length > 0) {
        html += `<div style="background:#fef2f2;padding:10px 14px;border-radius:6px;color:#dc2626;font-size:11px;margin-top:12px">
          ⚠ <strong>${payrollPending.length} payroll record(s)</strong> for ${payrollPending.map(p => p.employeeName).join(', ')} ${payrollPending.length === 1 ? 'is' : 'are'} still <strong>pending</strong>. They are included in the totals above but have not yet been marked as paid.
        </div>`;
      }

      // ── Footer ──────────────────────────────────────────────
      html += `
  <div class="footer">
    CECIC, ${Utils.escapeHtml(company.name)} &mdash; Confidential Financial Report &mdash; ${periodLabel}<br/>
    ${company.address ? Utils.escapeHtml(company.address) : 'P.O. Box 12345, Kampala, Uganda'}
  </div>
</body>
</html>`;

      // ── Set CSV Data ────────────────────────────────────────
      this.currentHeaders = ['Category', 'Detail', 'Amount (UGX)'];
      this.currentRows = [
        ['PAYROLL', '', ''],
        ['Employees on Payroll', '', String(payrollCount)],
        ['Total Basic Salaries', '', Utils.formatCurrency(totalBasic)],
        ['Total Allowances', '', Utils.formatCurrency(totalAllowances)],
        ['Total Deductions', '', Utils.formatCurrency(totalDeductions)],
        ['Net Salaries Paid', '', Utils.formatCurrency(totalNetPay)],
        ['', '', ''],
        ['EXPENSES', '', ''],
        ['Total Approved Expenses', '', Utils.formatCurrency(totalApprovedExpenses)],
        ['Unforeseen (Other)', '', Utils.formatCurrency(totalUnforeseen)],
        ['Pending Expenses', '', Utils.formatCurrency(totalPendingExpenses)],
        ['', '', ''],
        ['GRAND TOTAL', '', Utils.formatCurrency(totalExpenditure)],
      ];
      if (totalUnforeseen > 0) {
        this.currentRows.push(['', '', '']);
        this.currentRows.push(['UNFORESEEN BREAKDOWN', '', '']);
        unforeseenExpenses.forEach(ex => {
          this.currentRows.push([`  ${ex.officerName}`, ex.description || '', Utils.formatCurrency(ex.amount)]);
        });
      }

      // Show the report
      this.showReport(html, `Financial Summary - ${periodLabel}`);

    } catch (err) {
      console.error('Financial report error:', err);
      Utils.toast('Error generating financial report: ' + err.message, 'error');
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
