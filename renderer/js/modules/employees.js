// ─── Employee Management Module ─────────────────────────────────

const Employees = {
  async render() {
    const container = document.getElementById('page-employees');
    const employees = await DB.getEmployees();
    const allEmployees = await DB.getAllEmployees();
    const deptNames = await DB.getDepartmentNames();
    console.log('👥 Employee render — active:', employees.length, 'total:', allEmployees.length, 'departments:', deptNames);
    if (allEmployees.length > 0 && employees.length === 0) {
      console.warn('⚠️ Employees exist but none are active! Statuses:', allEmployees.map(e => ({ id: e.employeeId, status: e.status })));
    }
    if (allEmployees.length === 0) {
      console.warn('⚠️ No employees in DB at all. Seed may not have run.');
    }

    const deptOptions = deptNames.map(d =>
      `<option value="${Utils.escapeHtml(d)}">${Utils.escapeHtml(d)}</option>`
    ).join('');

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="empSearch" placeholder="Search employees..." />
          </div>
          <select class="form-control" id="empDeptFilter" style="width:auto">
            <option value="">All Departments</option>
            ${deptOptions}
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" onclick="Employees.showAddModal()">
            <i class="bi bi-person-plus-fill"></i> Add Employee
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="empTableBody">
                ${this.renderRows(employees)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Bind search/filter
    document.getElementById('empSearch').addEventListener('input', () => this.filter());
    document.getElementById('empDeptFilter').addEventListener('change', () => this.filter());
  },

  renderRows(employees) {
    if (!employees || employees.length === 0) {
      return `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="bi bi-people-fill"></i>
              <h3>No Employees Found</h3>
              <p>Add your first employee to get started.</p>
            </div>
          </td>
        </tr>
      `;
    }

    return employees.map(emp => {
      const photoHtml = emp.photo
        ? `<img class="photo-thumb" src="${Utils.escapeHtml(emp.photo)}" alt="Photo" />`
        : `<span class="photo-placeholder">${Utils.escapeHtml(emp.firstName.charAt(0))}${Utils.escapeHtml(emp.lastName.charAt(0))}</span>`;

      return `
      <tr>
        <td>
          <div class="photo-name-cell">
            ${photoHtml}
            <div>
              <strong>${Utils.escapeHtml(emp.employeeId)}</strong><br/>
              <span>${Utils.escapeHtml(emp.firstName)} ${Utils.escapeHtml(emp.lastName)}</span>
            </div>
          </div>
        </td>
        <td>${Utils.escapeHtml(emp.department)}</td>
        <td>${Utils.escapeHtml(emp.position)}</td>
        <td>${Utils.escapeHtml(emp.email)}</td>
        <td>${Utils.escapeHtml(emp.phone)}</td>
        <td>${Utils.formatCurrency(emp.salary)}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-outline" onclick="Employees.showViewModal(${emp.id})" title="View">
              <i class="bi bi-eye-fill"></i>
            </button>
            <button class="btn btn-sm btn-outline" onclick="Employees.showEditModal(${emp.id})" title="Edit">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="Employees.confirmDelete(${emp.id})" title="Delete">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  async filter() {
    const search = (document.getElementById('empSearch').value || '').toLowerCase();
    const dept = document.getElementById('empDeptFilter').value;
    console.log('🔍 Employee filter — search:', search, 'dept:', dept);
    let employees = await DB.getEmployees();

    if (search) {
      employees = employees.filter(e =>
        e.firstName.toLowerCase().includes(search) ||
        e.lastName.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.employeeId.toLowerCase().includes(search)
      );
    }
    if (dept) {
      employees = employees.filter(e => e.department === dept);
    }

    document.getElementById('empTableBody').innerHTML = this.renderRows(employees);
  },

  async getDeptOptions() {
    const deptNames = await DB.getDepartmentNames();
    return deptNames.map(d => ({ value: d, label: d }));
  },

  async showAddModal() {
    const deptOptions = await this.getDeptOptions();

    Utils.showFormModal({
      title: 'Add New Employee',
      size: 'modal-lg',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'John' },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Kato' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john@company.co.ug' },
        { name: 'phone', label: 'Phone', type: 'text', required: true, placeholder: '+256 712 345 678' },
        { name: 'department', label: 'Department', type: 'select', required: true, options: deptOptions },
        { name: 'position', label: 'Position', type: 'text', required: true, placeholder: 'Senior Developer' },
        { name: 'salary', label: 'Salary (UGX)', type: 'number', required: true, placeholder: '5000000' },
        { name: 'employmentDate', label: 'Employment Date', type: 'date', required: true },
        { name: 'photo', label: 'Profile Photo', type: 'file', accept: 'image/*', hint: 'Optional. Upload a photo (JPG, PNG)' },
        { name: 'address', label: 'Address', type: 'text', placeholder: 'Physical address' },
        { name: 'emergencyContact', label: 'Emergency Contact', type: 'text', placeholder: '+256 722 000 000' },
        { name: 'bankAccount', label: 'Bank Account No.', type: 'text', placeholder: '1234567890' },
        { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Stanbic Bank Uganda' }
      ],
      onSubmit: async (data, close) => {
        try {
          // Convert photo file to base64 if provided
          if (data.photo && data.photo instanceof File) {
            data.photo = await Utils.fileToBase64(data.photo);
          } else {
            data.photo = '';
          }
          await DB.addEmployee(data);
          Utils.toast('Employee added successfully', 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error adding employee: ' + err.message, 'error');
        }
      }
    });
  },

  async showEditModal(id) {
    console.log('✏️ Edit employee ID:', id, '(type:', typeof id, ')');
    const emp = await DB.getEmployee(id);
    if (!emp) { Utils.toast('Employee not found', 'error'); return; }

    const deptOptions = await this.getDeptOptions();

    Utils.showFormModal({
      title: `Edit Employee - ${emp.firstName} ${emp.lastName}`,
      size: 'modal-lg',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true, value: emp.firstName },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true, value: emp.lastName },
        { name: 'email', label: 'Email', type: 'email', required: true, value: emp.email },
        { name: 'phone', label: 'Phone', type: 'text', required: true, value: emp.phone },
        { name: 'department', label: 'Department', type: 'select', required: true, value: emp.department, options: deptOptions },
        { name: 'position', label: 'Position', type: 'text', required: true, value: emp.position },
        { name: 'salary', label: 'Salary (UGX)', type: 'number', required: true, value: emp.salary },
        { name: 'employmentDate', label: 'Employment Date', type: 'date', required: true, value: emp.employmentDate },
        { name: 'photo', label: 'Profile Photo', type: 'file', accept: 'image/*', hint: 'Leave empty to keep current photo. Upload a new one to replace.' },
        { name: 'address', label: 'Address', type: 'text', value: emp.address || '' },
        { name: 'emergencyContact', label: 'Emergency Contact', type: 'text', value: emp.emergencyContact || '' },
        { name: 'bankAccount', label: 'Bank Account No.', type: 'text', value: emp.bankAccount || '' },
        { name: 'bankName', label: 'Bank Name', type: 'text', value: emp.bankName || '' }
      ],
      onSubmit: async (data, close) => {
        try {
          // If photo is a File, convert it; otherwise leave existing photo
          if (data.photo && data.photo instanceof File) {
            data.photo = await Utils.fileToBase64(data.photo);
          } else {
            delete data.photo; // Keep existing photo
          }
          await DB.updateEmployee(id, data);
          Utils.toast('Employee updated successfully', 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error updating employee: ' + err.message, 'error');
        }
      }
    });
  },

  async showViewModal(id) {
    console.log('👁️ View employee ID:', id, '(type:', typeof id, ')');
    const emp = await DB.getEmployee(id);
    if (!emp) { Utils.toast('Employee not found', 'error'); return; }

    const photoHtml = emp.photo
      ? `<img class="photo-thumb-lg" src="${Utils.escapeHtml(emp.photo)}" alt="Photo" />`
      : `<span class="photo-placeholder-lg">${Utils.escapeHtml(emp.firstName.charAt(0))}${Utils.escapeHtml(emp.lastName.charAt(0))}</span>`;

    const content = `
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
        ${photoHtml}
        <div>
          <h3 style="font-size:20px;margin:0">${Utils.escapeHtml(emp.firstName)} ${Utils.escapeHtml(emp.lastName)}</h3>
          <p style="color:var(--text-muted);margin:2px 0 0">${Utils.escapeHtml(emp.position)} — ${Utils.escapeHtml(emp.department)}</p>
          <span class="badge badge-success" style="margin-top:6px">${Utils.escapeHtml(emp.status)}</span>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="label">Employee ID</span>
          <span class="value">${Utils.escapeHtml(emp.employeeId)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Salary</span>
          <span class="value">${Utils.formatCurrency(emp.salary)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Email</span>
          <span class="value">${Utils.escapeHtml(emp.email)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Phone</span>
          <span class="value">${Utils.escapeHtml(emp.phone)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Employment Date</span>
          <span class="value">${Utils.formatDate(emp.employmentDate)}</span>
        </div>
        <div class="detail-item">
          <span class="label">Bank Account</span>
          <span class="value">${Utils.escapeHtml(emp.bankName || '—')} ${Utils.escapeHtml(emp.bankAccount || '')}</span>
        </div>
        <div class="detail-item">
          <span class="label">Address</span>
          <span class="value">${Utils.escapeHtml(emp.address || '—')}</span>
        </div>
        <div class="detail-item">
          <span class="label">Emergency Contact</span>
          <span class="value">${Utils.escapeHtml(emp.emergencyContact || '—')}</span>
        </div>
      </div>
    `;

    Utils.showModal({
      title: `Employee Details`,
      content,
      size: 'modal-lg'
    });
  },

  async confirmDelete(id) {
    const emp = await DB.getEmployee(id);
    if (!emp) return;

    const confirmed = await Utils.confirm(
      `Are you sure you want to deactivate ${emp.firstName} ${emp.lastName}?`,
      'Deactivate Employee'
    );
    if (confirmed) {
      await DB.deleteEmployee(id);
      Utils.toast('Employee deactivated', 'success');
      this.render();
    }
  }
};
