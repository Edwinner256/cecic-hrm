// ─── Petty Cash Management Module ────────────────────────────────

const PettyCash = {
  async render() {
    const container = document.getElementById('page-pettyCash');
    const records = await DB.getPettyCash();
    const balance = await DB.getPettyCashBalance();

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="pcSearch" placeholder="Search by description..." />
          </div>
          <select class="form-control" id="pcTypeFilter" style="width:auto">
            <option value="">All Types</option>
            <option value="opening">Opening Balance</option>
            <option value="replenishment">Replenishment</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-success" onclick="PettyCash.showTransactionModal('replenishment')">
            <i class="bi bi-cash-stack"></i> Replenish
          </button>
          <button class="btn btn-primary" onclick="PettyCash.showTransactionModal('expense')">
            <i class="bi bi-cash-minus"></i> Record Expense
          </button>
          <button class="btn btn-outline" onclick="PettyCash.showOpeningModal()">
            <i class="bi bi-piggy-bank-fill"></i> Set Opening
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green"><i class="bi bi-cash-coin"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(balance)}</h3>
            <p>Current Petty Cash Balance</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="bi bi-arrow-down-circle-fill"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(records.filter(r => r.type === 'expense' || r.type === 'withdrawal').reduce((s, r) => s + Number(r.amount), 0))}</h3>
            <p>Total Disbursed</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><i class="bi bi-arrow-up-circle-fill"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(records.filter(r => r.type === 'replenishment' || r.type === 'opening').reduce((s, r) => s + Number(r.amount), 0))}</h3>
            <p>Total Funded</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan"><i class="bi bi-receipt-cutoff"></i></div>
          <div class="stat-info">
            <h3>${records.length}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Petty Cash Transactions</h3>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-outline" onclick="PettyCash.printReport()">
              <i class="bi bi-printer-fill"></i> Print
            </button>
            <button class="btn btn-sm btn-outline" onclick="PettyCash.exportCSV()">
              <i class="bi bi-file-earmark-spreadsheet-fill"></i> CSV
            </button>
          </div>
        </div>
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th>Printed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="pcTableBody">
                ${this.renderRows(records)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('pcSearch').addEventListener('input', () => this.filter());
    document.getElementById('pcTypeFilter').addEventListener('change', () => this.filter());
  },

  renderRows(records) {
    if (!records || records.length === 0) {
      return `<tr><td colspan="9"><div class="empty-state"><i class="bi bi-cash-coin"></i><h3>No Petty Cash Transactions</h3><p>Set an opening balance or record an expense to get started.</p></div></td></tr>`;
    }

    return records.map(r => {
      const typeBadge = {
        opening: 'badge-info',
        replenishment: 'badge-success',
        withdrawal: 'badge-warning',
        expense: 'badge-danger'
      }[r.type] || 'badge-secondary';

      const typeIcon = {
        opening: 'bi-piggy-bank-fill',
        replenishment: 'bi-cash-stack',
        withdrawal: 'bi-cash-minus',
        expense: 'bi-receipt-cutoff'
      }[r.type] || 'bi-circle';

      const amountColor = (r.type === 'expense' || r.type === 'withdrawal') ? 'var(--danger)' : 'var(--success)';
      const amountSign = (r.type === 'expense' || r.type === 'withdrawal') ? '−' : '+';

      const printedInfo = r.printedBy
        ? `<span style="font-size:11px;color:var(--text-muted)">${Utils.escapeHtml(r.printedBy)}<br/><small>${r.printedAt ? Utils.formatDate(r.printedAt) : ''}</small></span>`
        : '<span style="color:var(--text-muted);font-size:11px">—</span>';

      return `<tr>
        <td>${Utils.formatDate(r.date)}</td>
        <td><span class="badge ${typeBadge}"><i class="bi ${typeIcon}"></i> ${r.type}</span></td>
        <td><strong>${Utils.escapeHtml(r.description || '—')}</strong></td>
        <td>${Utils.escapeHtml(r.category || '—')}</td>
        <td style="font-weight:700;color:${amountColor}">${amountSign} ${Utils.formatCurrency(r.amount)}</td>
        <td>${Utils.escapeHtml(r.requestedBy || '—')}</td>
        <td><span class="badge ${r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning'}">${r.status || 'pending'}</span></td>
        <td>${printedInfo}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-outline" onclick="PettyCash.printVoucher(${r.id})" title="Print Voucher"><i class="bi bi-printer-fill"></i></button>
            <button class="btn btn-sm btn-danger" onclick="PettyCash.confirmDelete(${r.id})" title="Delete"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  async filter() {
    const search = (document.getElementById('pcSearch').value || '').toLowerCase();
    const type = document.getElementById('pcTypeFilter').value;

    let records = await DB.getPettyCash();
    if (search) records = records.filter(r => (r.description || '').toLowerCase().includes(search));
    if (type) records = records.filter(r => r.type === type);

    document.getElementById('pcTableBody').innerHTML = this.renderRows(records);
  },

  async showOpeningModal() {
    Utils.showFormModal({
      title: 'Set Opening Balance',
      fields: [
        {
          name: 'amount', label: 'Opening Amount (UGX)', type: 'number', required: true,
          placeholder: 'e.g. 1000000'
        },
        {
          name: 'description', label: 'Description', type: 'text',
          value: 'Opening balance', placeholder: 'Description'
        },
        {
          name: 'date', label: 'Date', type: 'date', required: true,
          value: Utils.toDateInputValue(new Date())
        }
      ],
      onSubmit: async (data, close) => {
        data.type = 'opening';
        data.category = 'Opening Balance';
        data.requestedBy = sessionStorage.getItem('hrms_user') || 'Admin';
        data.status = 'approved';
        data.printedBy = '';
        data.printedAt = '';
        try {
          await DB.addPettyCash(data);
          Utils.toast(`Opening balance of ${Utils.formatCurrency(data.amount)} set`, 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error: ' + err.message, 'error');
        }
      }
    });
  },

  async showTransactionModal(type) {
    const title = type === 'replenishment' ? 'Replenish Petty Cash' : 'Record Petty Cash Expense';

    const fields = [
      {
        name: 'amount', label: type === 'replenishment' ? 'Replenishment Amount (UGX)' : 'Expense Amount (UGX)',
        type: 'number', required: true, placeholder: 'e.g. 500000'
      },
      {
        name: 'description', label: 'Description', type: 'textarea', required: true,
        placeholder: 'Describe the transaction...'
      },
      {
        name: 'date', label: 'Date', type: 'date', required: true,
        value: Utils.toDateInputValue(new Date())
      }
    ];

    // Add category field for expenses
    if (type === 'expense') {
      fields.splice(2, 0, {
        name: 'category', label: 'Category', type: 'select', required: true,
        options: [
          { value: 'Stationery', label: 'Stationery' },
          { value: 'Transport', label: 'Transport' },
          { value: 'Meals', label: 'Meals & Refreshments' },
          { value: 'Office Supplies', label: 'Office Supplies' },
          { value: 'Maintenance', label: 'Maintenance' },
          { value: 'Utilities', label: 'Utilities' },
          { value: 'Other', label: 'Other' }
        ]
      });
    }

    Utils.showFormModal({
      title,
      size: 'modal-lg',
      fields,
      onSubmit: async (data, close) => {
        data.type = type;
        if (!data.category) data.category = type === 'replenishment' ? 'Replenishment' : 'General';
        data.requestedBy = sessionStorage.getItem('hrms_user') || 'Admin';
        data.status = type === 'replenishment' ? 'approved' : 'pending';
        data.printedBy = '';
        data.printedAt = '';

        try {
          await DB.addPettyCash(data);
          const msg = type === 'replenishment'
            ? `Petty cash replenished with ${Utils.formatCurrency(data.amount)}`
            : `Expense of ${Utils.formatCurrency(data.amount)} recorded (pending approval)`;
          Utils.toast(msg, 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error: ' + err.message, 'error');
        }
      }
    });
  },

  async printVoucher(id) {
    try {
      const record = await db.pettyCash.get(typeof id === 'string' ? parseInt(id, 10) : id);
      if (!record) { Utils.toast('Transaction not found', 'error'); return; }

      // Record who printed
      const printedBy = sessionStorage.getItem('hrms_user') || 'Unknown';
      const printedAt = new Date().toISOString();
      await DB.updatePettyCash(id, { printedBy, printedAt });

      const company = await DB.getAllSettings();
      const balance = await DB.getPettyCashBalance();
      const logoHtml = company.companyLogo
        ? `<img src="${Utils.escapeHtml(company.companyLogo)}" style="height:45px;margin-bottom:6px" alt="Logo" />`
        : '';

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Petty Cash Voucher - ${Utils.escapeHtml(record.description || '')}</title>
  <style>
    @page { margin: 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a2e05; padding: 20px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #166534; padding-bottom: 12px; }
    .header h1 { font-size: 20px; margin: 4px 0; color: #166534; }
    .header h2 { font-size: 16px; color: #7c3aed; margin: 4px 0; }
    .details { margin: 16px 0; }
    .details .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .details .row .label { color: #57534e; font-weight: 500; }
    .details .row .value { font-weight: 600; }
    .amount-box { text-align: center; padding: 16px; margin: 16px 0; background: #f0fdf4; border: 1px solid #166534; border-radius: 8px; }
    .amount-box .amount { font-size: 28px; font-weight: 800; color: #166534; }
    .amount-box .words { font-size: 12px; color: #57534e; margin-top: 6px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #d4d4d4; font-size: 10px; color: #57534e; text-align: center; }
    .signatures { display: flex; justify-content: space-between; margin-top: 36px; }
    .sig-box { width: 45%; }
    .sig-box .line { border-top: 1px solid #1a2e05; margin-top: 40px; padding-top: 6px; }
    .sig-box .name { font-weight: 600; font-size: 12px; }
    .sig-box .title { font-size: 10px; color: #57534e; }
    .stamp { text-align: center; margin: 20px 0; }
    .stamp .badge { display: inline-block; padding: 4px 16px; border: 2px solid #dc2626; color: #dc2626; border-radius: 4px; font-weight: 700; font-size: 14px; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:16px">
    <button onclick="window.print()" style="padding:8px 24px;background:#166534;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨 Print Voucher</button>
    <br/><br/>
  </div>
  <div class="header">
    ${logoHtml}
    <h1>${Utils.escapeHtml(company.companyName || 'CECIC HRMS')}</h1>
    <h2>PETTY CASH VOUCHER</h2>
    <div style="font-size:12px;color:#57534e">Voucher #: PC-${String(id).padStart(4, '0')}</div>
  </div>
  <div class="details">
    <div class="row"><span class="label">Date</span><span class="value">${Utils.formatDate(record.date)}</span></div>
    <div class="row"><span class="label">Transaction Type</span><span class="value" style="text-transform:capitalize">${record.type}</span></div>
    <div class="row"><span class="label">Category</span><span class="value">${Utils.escapeHtml(record.category || '—')}</span></div>
    <div class="row"><span class="label">Description</span><span class="value">${Utils.escapeHtml(record.description || '—')}</span></div>
    <div class="row"><span class="label">Requested By</span><span class="value">${Utils.escapeHtml(record.requestedBy || '—')}</span></div>
    <div class="row"><span class="label">Status</span><span class="value" style="text-transform:capitalize">${record.status || 'pending'}</span></div>
  </div>
  <div class="amount-box">
    <div class="amount">${Utils.formatCurrency(record.amount)}</div>
    <div class="words"><strong>Amount in Words:</strong> ${Utils.numberToWords(record.amount)} Uganda Shillings Only</div>
  </div>
  <div class="signatures">
    <div class="sig-box">
      <div class="line"></div>
      <div class="name">${Utils.escapeHtml(company.adminDisplayName || 'Finance & Admin')}</div>
      <div class="title">${Utils.escapeHtml(company.adminTitle || 'Finance & Admin Officer')}</div>
    </div>
    <div class="sig-box" style="text-align:right">
      <div class="line"></div>
      <div class="name">${Utils.escapeHtml(record.requestedBy || 'Staff')}</div>
      <div class="title">Requested By</div>
    </div>
  </div>
  <div class="stamp">
    <span>Printed by: ${Utils.escapeHtml(printedBy)} | ${new Date(printedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
  </div>
  <div class="footer">
    ${Utils.escapeHtml(company.companyName || 'CECIC HRMS')} — Petty Cash Voucher — ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
    ${company.companyAddress ? `<br/>${Utils.escapeHtml(company.companyAddress)}` : ''}
  </div>
</body>
</html>`;

      // Open print window
      Utils.printHTML(html, `Petty Cash Voucher #PC-${String(id).padStart(4, '0')}`);

      Utils.toast(`Voucher printed by ${printedBy}`, 'success');
      this.render();
    } catch (err) {
      console.error('Petty cash print error:', err);
      Utils.toast('Error printing voucher: ' + err.message, 'error');
    }
  },

  async printReport() {
    const records = await DB.getPettyCash();
    const balance = await DB.getPettyCashBalance();
    const company = await DB.getAllSettings();

    if (records.length === 0) {
      Utils.toast('No transactions to print', 'warning');
      return;
    }

    const logoHtml = company.companyLogo
      ? `<img src="${Utils.escapeHtml(company.companyLogo)}" style="height:50px;margin-bottom:8px" alt="Logo" />`
      : '';

    const rows = records.map(r => {
      const sign = (r.type === 'expense' || r.type === 'withdrawal') ? '−' : '+';
      return `<tr>
        <td>${Utils.formatDate(r.date)}</td>
        <td style="text-transform:capitalize">${r.type}</td>
        <td>${Utils.escapeHtml(r.description || '—')}</td>
        <td>${Utils.escapeHtml(r.category || '—')}</td>
        <td style="text-align:right">${sign} ${Utils.formatCurrency(r.amount)}</td>
        <td>${Utils.escapeHtml(r.requestedBy || '—')}</td>
      </tr>`;
    }).join('');

    const totalIn = records.filter(r => r.type === 'opening' || r.type === 'replenishment').reduce((s, r) => s + Number(r.amount), 0);
    const totalOut = records.filter(r => r.type === 'expense' || r.type === 'withdrawal').reduce((s, r) => s + Number(r.amount), 0);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Petty Cash Report</title>
  <style>
    @page { margin: 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a2e05; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #166534; padding-bottom: 12px; }
    .header h1 { font-size: 22px; margin: 4px 0; color: #166534; }
    .header h2 { font-size: 16px; color: #7c3aed; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #166534; color: #fff; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f0fdf4; }
    .summary { display: flex; justify-content: space-around; margin: 16px 0; padding: 12px; background: #f0fdf4; border-radius: 8px; }
    .summary div { text-align: center; }
    .summary .val { font-size: 18px; font-weight: 700; color: #166534; }
    .summary .lbl { font-size: 10px; color: #57534e; text-transform: uppercase; }
    .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #d4d4d4; font-size: 10px; color: #57534e; }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <h1>${Utils.escapeHtml(company.companyName || 'CECIC HRMS')}</h1>
    <h2>Petty Cash Report</h2>
    <div>As at ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
  </div>
  <div class="summary">
    <div><div class="val">${Utils.formatCurrency(totalIn)}</div><div class="lbl">Total Funded</div></div>
    <div><div class="val">${Utils.formatCurrency(totalOut)}</div><div class="lbl">Total Disbursed</div></div>
    <div><div class="val">${Utils.formatCurrency(balance)}</div><div class="lbl">Current Balance</div></div>
    <div><div class="val">${records.length}</div><div class="lbl">Transactions</div></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th style="text-align:right">Amount</th><th>Requested By</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    ${Utils.escapeHtml(company.companyName || 'CECIC HRMS')} — Confidential — Printed ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
  </div>
</body>
</html>`;

    Utils.printHTML(html, 'Petty Cash Report');
  },

  exportCSV() {
    const rows = [];
    document.querySelectorAll('#pcTableBody tr').forEach(tr => {
      if (tr.querySelector('td[colspan]')) return;
      const tds = tr.querySelectorAll('td');
      if (tds.length < 6) return;
      rows.push([
        tds[0].textContent.trim(),
        tds[1].textContent.trim(),
        tds[2].textContent.trim(),
        tds[3].textContent.trim(),
        tds[4].textContent.trim(),
        tds[5].textContent.trim()
      ]);
    });

    if (rows.length === 0) {
      Utils.toast('No data to export', 'warning');
      return;
    }

    Utils.exportCSV(
      `petty-cash-${Utils.toDateInputValue(new Date())}.csv`,
      ['Date', 'Type', 'Description', 'Category', 'Amount', 'Requested By'],
      rows
    );
    Utils.toast('Petty Cash CSV downloaded', 'success');
  },

  async confirmDelete(id) {
    const confirmed = await Utils.confirm('Delete this petty cash transaction?', 'Delete Transaction');
    if (confirmed) {
      await DB.deletePettyCash(id);
      Utils.toast('Transaction deleted', 'success');
      this.render();
    }
  }
};
