// ─── Officer Expenses Module ─────────────────────────────────────

const Expenses = {
  async render() {
    const container = document.getElementById('page-expenses');
    const records = await DB.getExpenses();
    const pendingTotal = records.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0);
    const approvedTotal = records.filter(r => r.status === 'approved').reduce((s, r) => s + Number(r.amount), 0);
    const rejectedTotal = records.filter(r => r.status === 'rejected').reduce((s, r) => s + Number(r.amount), 0);

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="expSearch" placeholder="Search by officer..." />
          </div>
          <select class="form-control" id="expStatusFilter" style="width:auto">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select class="form-control" id="expCategoryFilter" style="width:auto">
            <option value="">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Supplies">Supplies</option>
            <option value="Equipment">Equipment</option>
            <option value="Utilities">Utilities</option>
            <option value="Meals">Meals</option>
            <option value="Transport">Transport</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" onclick="Expenses.showAddModal()">
            <i class="bi bi-plus-circle-fill"></i> Record Expense
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green"><i class="bi bi-check-circle"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(approvedTotal)}</h3>
            <p>Approved Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><i class="bi bi-clock-fill"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(pendingTotal)}</h3>
            <p>Pending Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="bi bi-x-circle"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(rejectedTotal)}</h3>
            <p>Rejected Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="bi bi-receipt-cutoff"></i></div>
          <div class="stat-info">
            <h3>${records.length}</h3>
            <p>Total Claims</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>Expense Claims</h3></div>
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="expTableBody">
                ${this.renderRows(records)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('expSearch').addEventListener('input', () => this.filter());
    document.getElementById('expStatusFilter').addEventListener('change', () => this.filter());
    document.getElementById('expCategoryFilter').addEventListener('change', () => this.filter());
  },

  renderRows(records) {
    if (!records || records.length === 0) {
      return `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-receipt-cutoff"></i><h3>No Expenses</h3><p>No expense records found.</p></div></td></tr>`;
    }

    return records.map(r => {
      const badgeClass = r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning';
      return `<tr>
        <td><strong>${Utils.escapeHtml(r.officerName)}</strong></td>
        <td>${Utils.escapeHtml(r.department || '—')}</td>
        <td><span class="badge badge-info">${Utils.escapeHtml(r.category)}</span></td>
        <td><strong>${Utils.formatCurrency(r.amount)}</strong></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${Utils.escapeHtml(r.description || '')}">${Utils.escapeHtml(r.description || '—')}</td>
        <td>${Utils.formatDate(r.date)}</td>
        <td><span class="badge ${badgeClass}">${r.status}</span></td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-outline" onclick="Expenses.showViewModal(${r.id})" title="View"><i class="bi bi-eye"></i></button>
            ${r.status === 'pending' ? `
              <button class="btn btn-sm btn-success" onclick="Expenses.approve(${r.id})" title="Approve"><i class="bi bi-check-circle-fill"></i></button>
              <button class="btn btn-sm btn-danger" onclick="Expenses.reject(${r.id})" title="Reject"><i class="bi bi-x-circle-fill"></i></button>
            ` : ''}
            <button class="btn btn-sm btn-danger" onclick="Expenses.confirmDelete(${r.id})" title="Delete"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  async filter() {
    const search = (document.getElementById('expSearch').value || '').toLowerCase();
    const status = document.getElementById('expStatusFilter').value;
    const cat = document.getElementById('expCategoryFilter').value;

    let records = await DB.getExpenses();
    if (search) records = records.filter(r => r.officerName.toLowerCase().includes(search));
    if (status) records = records.filter(r => r.status === status);
    if (cat) records = records.filter(r => r.category === cat);

    document.getElementById('expTableBody').innerHTML = this.renderRows(records);
  },

  async showAddModal() {
    const deptNames = await DB.getDepartmentNames();
    const deptOptions = [
      { value: '', label: '-- Select --' },
      ...deptNames.map(d => ({ value: d, label: d }))
    ];

    Utils.showFormModal({
      title: 'Record Officer Expense',
      size: 'modal-lg',
      fields: [
        { name: 'officerName', label: 'Officer Name', type: 'text', required: true, placeholder: 'e.g. John Kamau' },
        {
          name: 'department', label: 'Department', type: 'select', required: true,
          options: deptOptions
        },
        {
          name: 'category', label: 'Category', type: 'select', required: true,
          options: [
            { value: '', label: '-- Select --' },
            { value: 'Travel', label: 'Travel' },
            { value: 'Supplies', label: 'Supplies' },
            { value: 'Equipment', label: 'Equipment' },
            { value: 'Utilities', label: 'Utilities' },
            { value: 'Meals', label: 'Meals' },
            { value: 'Transport', label: 'Transport' },
            { value: 'Other', label: 'Other' }
          ]
        },
        { name: 'amount', label: 'Amount (UGX)', type: 'number', required: true, placeholder: 'e.g. 500000' },
        { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the expense...' },
        { name: 'date', label: 'Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) }
      ],
      onSubmit: async (data, close) => {
        data.status = 'pending';
        data.approvedBy = '';
        try {
          await DB.addExpense(data);
          Utils.toast('Expense recorded successfully', 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error: ' + err.message, 'error');
        }
      }
    });
  },

  async showViewModal(id) {
    const exp = await db.expenses.get(id);
    if (!exp) { Utils.toast('Expense not found', 'error'); return; }

    const content = `
      <div class="detail-grid">
        <div class="detail-item">
          <span class="label">Officer Name</span>
          <span class="value">${Utils.escapeHtml(exp.officerName)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Department</span>
          <span class="value">${Utils.escapeHtml(exp.department || '—')}</span>
        </div>
        <div class="detail-item">
          <span class="label">Category</span>
          <span class="value"><span class="badge badge-info">${Utils.escapeHtml(exp.category)}</span></span>
        </div>
        <div class="detail-item">
          <span class="label">Amount</span>
          <span class="value"><strong>${Utils.formatCurrency(exp.amount)}</strong></span>
        </div>
        <div class="detail-item">
          <span class="label">Date</span>
          <span class="value">${Utils.formatDate(exp.date)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Status</span>
          <span class="value"><span class="badge ${exp.status === 'approved' ? 'badge-success' : exp.status === 'rejected' ? 'badge-danger' : 'badge-warning'}">${exp.status}</span></span>
        </div>
        ${exp.approvedBy ? `<div class="detail-item"><span class="label">Approved By</span><span class="value">${Utils.escapeHtml(exp.approvedBy)}</span></div>` : ''}
        <div class="detail-item" style="grid-column: 1 / -1;">
          <span class="label">Description</span>
          <span class="value">${Utils.escapeHtml(exp.description || '—')}</span>
        </div>
      </div>
    `;

    Utils.showModal({ title: 'Expense Details', content, size: 'modal-lg' });
  },

  async approve(id) {
    await DB.updateExpense(id, { status: 'approved', approvedBy: 'Finance' });
    Utils.toast('Expense approved', 'success');
    this.render();
  },

  async reject(id) {
    await DB.updateExpense(id, { status: 'rejected', approvedBy: 'Finance' });
    Utils.toast('Expense rejected', 'warning');
    this.render();
  },

  async confirmDelete(id) {
    const confirmed = await Utils.confirm('Delete this expense record?', 'Delete Expense');
    if (confirmed) {
      await DB.deleteExpense(id);
      Utils.toast('Expense deleted', 'success');
      this.render();
    }
  }
};
