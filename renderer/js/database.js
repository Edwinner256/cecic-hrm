// ─── Database Layer (Dexie.js / IndexedDB) ──────────────────────

const db = new Dexie('HRMS_Database');

db.version(3).stores({
  employees: '++id, employeeId, firstName, lastName, email, department, position, status, employmentDate',
  leave: '++id, employeeId, leaveType, status, startDate, endDate, appliedDate',
  payroll: '++id, employeeId, month, year, status, paidDate',
  expenses: '++id, officerName, department, category, status, date',
  settings: '++id, key',
  departments: '++id, name',
  pettyCash: '++id, date, type, category, status, createdBy',
  officeForms: '++id, formType, formNumber, title, createdDate, status'
});

// ─── Default Data Seeds ─────────────────────────────────────────

/**
 * Rich demo data to showcase all features of the HRMS.
 * Populates departments, employees, leave, payroll, expenses, and settings
 * with realistic Uganda-based company data.
 */
async function seedDemoData() {
  // ── Departments ────────────────────────────────────────────
  await db.departments.bulkAdd([
    { name: 'Engineering' },
    { name: 'Finance' },
    { name: 'Human Resources' },
    { name: 'Marketing' },
    { name: 'Operations' },
    { name: 'Sales' },
    { name: 'Administration' },
    { name: 'Legal' }
  ]);

  // ── Employees (12) ─────────────────────────────────────────
  await db.employees.bulkAdd([
    {
      employeeId: 'EMP-001', firstName: 'John', lastName: 'Ssebunya',
      email: 'john.ssebunya@company.co.ug', phone: '+256 712 345 678',
      department: 'Engineering', position: 'Senior Developer',
      salary: 10000000, employmentDate: Utils.toDateInputValue(new Date(2020, 0, 15)),
      status: 'active', photo: '',
      address: '123 Kampala Rd', emergencyContact: '+256 722 111 222',
      bankAccount: '1001234567890', bankName: 'Stanbic Bank Uganda'
    },
    {
      employeeId: 'EMP-002', firstName: 'Mary', lastName: 'Nakato',
      email: 'mary.nakato@company.co.ug', phone: '+256 723 456 789',
      department: 'Finance', position: 'Finance Officer',
      salary: 6500000, employmentDate: Utils.toDateInputValue(new Date(2021, 5, 1)),
      status: 'active', photo: '',
      address: '456 Jinja Rd', emergencyContact: '+256 733 333 444',
      bankAccount: '2000987654321', bankName: 'Centenary Bank'
    },
    {
      employeeId: 'EMP-003', firstName: 'Peter', lastName: 'Okello',
      email: 'peter.okello@company.co.ug', phone: '+256 711 567 890',
      department: 'Human Resources', position: 'HR Officer',
      salary: 5000000, employmentDate: Utils.toDateInputValue(new Date(2023, 2, 10)),
      status: 'active', photo: '',
      address: '789 Gulu Rd', emergencyContact: '+256 744 555 666',
      bankAccount: '3005556667777', bankName: 'DFCU Bank'
    },
    {
      employeeId: 'EMP-004', firstName: 'Grace', lastName: 'Achieng',
      email: 'grace.achieng@company.co.ug', phone: '+256 713 678 901',
      department: 'Marketing', position: 'Marketing Lead',
      salary: 7500000, employmentDate: Utils.toDateInputValue(new Date(2022, 8, 20)),
      status: 'active', photo: '',
      address: '321 Entebbe Rd', emergencyContact: '+256 755 777 888',
      bankAccount: '4001112223334', bankName: 'Absa Bank Uganda'
    },
    {
      employeeId: 'EMP-005', firstName: 'David', lastName: 'Muwonge',
      email: 'david.muwonge@company.co.ug', phone: '+256 714 789 012',
      department: 'Engineering', position: 'Junior Developer',
      salary: 3500000, employmentDate: Utils.toDateInputValue(new Date(2024, 0, 5)),
      status: 'active', photo: '',
      address: '654 Entebbe Rd', emergencyContact: '+256 766 888 999',
      bankAccount: '5004445556667', bankName: 'Equity Bank Uganda'
    },
    {
      employeeId: 'EMP-006', firstName: 'Sarah', lastName: 'Nabatanzi',
      email: 'sarah.nabatanzi@company.co.ug', phone: '+256 715 890 123',
      department: 'Operations', position: 'Operations Manager',
      salary: 8500000, employmentDate: Utils.toDateInputValue(new Date(2019, 0, 10)),
      status: 'active', photo: '',
      address: '111 Bombo Rd', emergencyContact: '+256 777 111 222',
      bankAccount: '6007778889990', bankName: 'Stanbic Bank Uganda'
    },
    {
      employeeId: 'EMP-007', firstName: 'Robert', lastName: 'Mugisha',
      email: 'robert.mugisha@company.co.ug', phone: '+256 716 901 234',
      department: 'Sales', position: 'Sales Executive',
      salary: 4500000, employmentDate: Utils.toDateInputValue(new Date(2023, 5, 15)),
      status: 'active', photo: '',
      address: '222 Mbarara Rd', emergencyContact: '+256 788 333 444',
      bankAccount: '7009990001112', bankName: 'Equity Bank Uganda'
    },
    {
      employeeId: 'EMP-008', firstName: 'Jane', lastName: 'Akello',
      email: 'jane.akello@company.co.ug', phone: '+256 717 012 345',
      department: 'Administration', position: 'Admin Assistant',
      salary: 3000000, employmentDate: Utils.toDateInputValue(new Date(2025, 0, 8)),
      status: 'active', photo: '',
      address: '333 Gaba Rd', emergencyContact: '+256 799 555 666',
      bankAccount: '8001112223334', bankName: 'Centenary Bank'
    },
    {
      employeeId: 'EMP-009', firstName: 'Michael', lastName: 'Wasswa',
      email: 'michael.wasswa@company.co.ug', phone: '+256 718 123 456',
      department: 'Legal', position: 'Legal Counsel',
      salary: 9000000, employmentDate: Utils.toDateInputValue(new Date(2021, 2, 1)),
      status: 'active', photo: '',
      address: '555 Kololo Hill', emergencyContact: '+256 700 777 888',
      bankAccount: '9003334445556', bankName: 'DFCU Bank'
    },
    {
      employeeId: 'EMP-010', firstName: 'Esther', lastName: 'Nambi',
      email: 'esther.nambi@company.co.ug', phone: '+256 719 234 567',
      department: 'Engineering', position: 'QA Engineer',
      salary: 4000000, employmentDate: Utils.toDateInputValue(new Date(2024, 7, 15)),
      status: 'active', photo: '',
      address: '777 Ntinda Rd', emergencyContact: '+256 711 888 999',
      bankAccount: '1005556667778', bankName: 'Absa Bank Uganda'
    },
    {
      employeeId: 'EMP-011', firstName: 'Paul', lastName: 'Kato',
      email: 'paul.kato@company.co.ug', phone: '+256 720 345 678',
      department: 'Marketing', position: 'Graphic Designer',
      salary: 3800000, employmentDate: Utils.toDateInputValue(new Date(2024, 9, 1)),
      status: 'active', photo: '',
      address: '888 Luzira', emergencyContact: '+256 722 999 000',
      bankAccount: '2006667778889', bankName: 'Stanbic Bank Uganda'
    },
    {
      employeeId: 'EMP-012', firstName: 'Diana', lastName: 'Nansubuga',
      email: 'diana.nansubuga@company.co.ug', phone: '+256 721 456 789',
      department: 'Finance', position: 'Accountant',
      salary: 4200000, employmentDate: Utils.toDateInputValue(new Date(2023, 1, 20)),
      status: 'active', photo: '',
      address: '999 Mengo', emergencyContact: '+256 733 111 222',
      bankAccount: '3007778889990', bankName: 'Centenary Bank'
    }
  ]);

  // ── Leave Records (12) ─────────────────────────────────────
  // Day counts are working days (Mon-Fri, excluding Uganda public holidays)
  await db.leave.bulkAdd([
    {
      employeeId: 'EMP-001', employeeName: 'John Ssebunya',
      leaveType: 'annual', days: 5,
      startDate: '2026-03-10', endDate: '2026-03-16',
      reason: 'Family visit to Jinja',
      status: 'approved', appliedDate: '2026-02-15', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-002', employeeName: 'Mary Nakato',
      leaveType: 'sick', days: 2,
      startDate: '2026-04-01', endDate: '2026-04-02',
      reason: 'Medical appointment',
      status: 'approved', appliedDate: '2026-03-28', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-003', employeeName: 'Peter Okello',
      leaveType: 'annual', days: 3,
      startDate: '2026-05-05', endDate: '2026-05-07',
      reason: 'Personal visit to home village',
      status: 'pending', appliedDate: '2026-05-01', approvedBy: ''
    },
    {
      employeeId: 'EMP-004', employeeName: 'Grace Achieng',
      leaveType: 'annual', days: 8,
      startDate: '2026-06-01', endDate: '2026-06-10',
      reason: 'Annual leave - family trip to Mombasa',
      status: 'approved', appliedDate: '2026-04-20', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-005', employeeName: 'David Muwonge',
      leaveType: 'sick', days: 1,
      startDate: '2026-04-20', endDate: '2026-04-20',
      reason: 'Malaria treatment',
      status: 'approved', appliedDate: '2026-04-20', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-006', employeeName: 'Sarah Nabatanzi',
      leaveType: 'annual', days: 11,
      startDate: '2026-07-01', endDate: '2026-07-15',
      reason: 'Annual leave - travel to UK',
      status: 'approved', appliedDate: '2026-05-10', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-006', employeeName: 'Sarah Nabatanzi',
      leaveType: 'compassionate', days: 3,
      startDate: '2026-03-20', endDate: '2026-03-24',
      reason: 'Family bereavement',
      status: 'approved', appliedDate: '2026-03-19', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-009', employeeName: 'Michael Wasswa',
      leaveType: 'study', days: 5,
      startDate: '2026-05-15', endDate: '2026-05-21',
      reason: 'Legal seminar at Law Development Centre',
      status: 'pending', appliedDate: '2026-04-20', approvedBy: ''
    },
    {
      employeeId: 'EMP-010', employeeName: 'Esther Nambi',
      leaveType: 'personal', days: 2,
      startDate: '2026-05-22', endDate: '2026-05-25',
      reason: 'Personal matters',
      status: 'pending', appliedDate: '2026-05-14', approvedBy: ''
    },
    {
      employeeId: 'EMP-007', employeeName: 'Robert Mugisha',
      leaveType: 'annual', days: 5,
      startDate: '2026-08-03', endDate: '2026-08-07',
      reason: 'Annual leave - visiting family in Gulu',
      status: 'approved', appliedDate: '2026-06-01', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-011', employeeName: 'Paul Kato',
      leaveType: 'sick', days: 1,
      startDate: '2026-05-02', endDate: '2026-05-02',
      reason: 'Feeling unwell',
      status: 'rejected', appliedDate: '2026-05-01', approvedBy: 'HR Admin'
    },
    {
      employeeId: 'EMP-012', employeeName: 'Diana Nansubuga',
      leaveType: 'annual', days: 4,
      startDate: '2026-05-25', endDate: '2026-05-28',
      reason: 'Short break',
      status: 'pending', appliedDate: '2026-05-10', approvedBy: ''
    }
  ]);

  // ── Payroll Records (10) ───────────────────────────────────
  await db.payroll.bulkAdd([
    // March 2026
    {
      employeeId: 'EMP-001', employeeName: 'John Ssebunya',
      month: 3, year: 2026, basicSalary: 10000000,
      allowances: 1500000, deductions: 2000000, netPay: 9500000,
      status: 'paid', paidDate: '2026-03-28'
    },
    {
      employeeId: 'EMP-002', employeeName: 'Mary Nakato',
      month: 3, year: 2026, basicSalary: 6500000,
      allowances: 800000, deductions: 1200000, netPay: 6100000,
      status: 'paid', paidDate: '2026-03-28'
    },
    {
      employeeId: 'EMP-006', employeeName: 'Sarah Nabatanzi',
      month: 3, year: 2026, basicSalary: 8500000,
      allowances: 1000000, deductions: 1700000, netPay: 7800000,
      status: 'paid', paidDate: '2026-03-28'
    },
    // April 2026
    {
      employeeId: 'EMP-001', employeeName: 'John Ssebunya',
      month: 4, year: 2026, basicSalary: 10000000,
      allowances: 1500000, deductions: 2000000, netPay: 9500000,
      status: 'paid', paidDate: '2026-04-28'
    },
    {
      employeeId: 'EMP-002', employeeName: 'Mary Nakato',
      month: 4, year: 2026, basicSalary: 6500000,
      allowances: 800000, deductions: 1200000, netPay: 6100000,
      status: 'paid', paidDate: '2026-04-28'
    },
    {
      employeeId: 'EMP-003', employeeName: 'Peter Okello',
      month: 4, year: 2026, basicSalary: 5000000,
      allowances: 500000, deductions: 900000, netPay: 4600000,
      status: 'pending', paidDate: ''
    },
    {
      employeeId: 'EMP-004', employeeName: 'Grace Achieng',
      month: 4, year: 2026, basicSalary: 7500000,
      allowances: 1000000, deductions: 1400000, netPay: 7100000,
      status: 'paid', paidDate: '2026-04-28'
    },
    {
      employeeId: 'EMP-009', employeeName: 'Michael Wasswa',
      month: 4, year: 2026, basicSalary: 9000000,
      allowances: 1200000, deductions: 1800000, netPay: 8400000,
      status: 'paid', paidDate: '2026-04-28'
    },
    // May 2026 (current month — some still pending)
    {
      employeeId: 'EMP-001', employeeName: 'John Ssebunya',
      month: 5, year: 2026, basicSalary: 10000000,
      allowances: 1500000, deductions: 2000000, netPay: 9500000,
      status: 'paid', paidDate: '2026-05-15'
    },
    {
      employeeId: 'EMP-002', employeeName: 'Mary Nakato',
      month: 5, year: 2026, basicSalary: 6500000,
      allowances: 800000, deductions: 1200000, netPay: 6100000,
      status: 'pending', paidDate: ''
    }
  ]);

  // ── Expenses (10) ──────────────────────────────────────────
  await db.expenses.bulkAdd([
    {
      officerName: 'John Ssebunya', department: 'Engineering',
      category: 'Travel', amount: 850000,
      description: 'Client site visit — Jinja',
      date: '2026-04-10', receipt: '', status: 'approved', approvedBy: 'Finance'
    },
    {
      officerName: 'Grace Achieng', department: 'Marketing',
      category: 'Supplies', amount: 450000,
      description: 'Marketing materials for trade fair',
      date: '2026-04-15', receipt: '', status: 'approved', approvedBy: 'Finance'
    },
    {
      officerName: 'Peter Okello', department: 'Human Resources',
      category: 'Other', amount: 350000,
      description: 'Staff welfare — team lunch',
      date: '2026-05-02', receipt: '', status: 'pending', approvedBy: ''
    },
    {
      officerName: 'Sarah Nabatanzi', department: 'Operations',
      category: 'Travel', amount: 1200000,
      description: 'Field inspection — Gulu office',
      date: '2026-04-20', receipt: '', status: 'approved', approvedBy: 'Finance'
    },
    {
      officerName: 'Mary Nakato', department: 'Finance',
      category: 'Supplies', amount: 250000,
      description: 'Office stationery',
      date: '2026-05-05', receipt: '', status: 'approved', approvedBy: 'Finance'
    },
    {
      officerName: 'Robert Mugisha', department: 'Sales',
      category: 'Travel', amount: 600000,
      description: 'Client meetings in Mbarara',
      date: '2026-05-08', receipt: '', status: 'pending', approvedBy: ''
    },
    {
      officerName: 'Michael Wasswa', department: 'Legal',
      category: 'Other', amount: 750000,
      description: 'Legal filing fees — court case',
      date: '2026-04-25', receipt: '', status: 'approved', approvedBy: 'Finance'
    },
    {
      officerName: 'Jane Akello', department: 'Administration',
      category: 'Utilities', amount: 180000,
      description: 'Office water cooler maintenance',
      date: '2026-05-10', receipt: '', status: 'pending', approvedBy: ''
    },
    {
      officerName: 'Paul Kato', department: 'Marketing',
      category: 'Equipment', amount: 2500000,
      description: 'New design workstation — iMac',
      date: '2026-04-05', receipt: '', status: 'rejected', approvedBy: 'Finance'
    },
    {
      officerName: 'Diana Nansubuga', department: 'Finance',
      category: 'Other', amount: 95000,
      description: 'Bank charges reconciliation fee',
      date: '2026-05-12', receipt: '', status: 'pending', approvedBy: ''
    }
  ]);

  // ── Settings ───────────────────────────────────────────────
  await db.settings.bulkAdd([
    { key: 'companyName', value: 'CECIC' },
    { key: 'companyEmail', value: 'hr@company.co.ug' },
    { key: 'companyPhone', value: '+256 700 123 456' },
    { key: 'companyAddress', value: 'P.O. Box 12345, Kampala, Uganda' },
    { key: 'smtpHost', value: '' },
    { key: 'smtpPort', value: '587' },
    { key: 'smtpSecure', value: 'false' },
    { key: 'smtpUser', value: '' },
    { key: 'smtpPass', value: '' },
    { key: 'smtpFrom', value: '' }
  ]);
}

/**
 * Auto-seed on first visit (or when employees table is empty).
 * If employees already exist, does nothing (preserves user data).
 */
async function seedDefaultData() {
  const empCount = await db.employees.count();
  if (empCount > 0) return; // Already has employee data — don't overwrite

  // Departments might exist from a partial session; clear & start fresh
  await db.departments.clear();
  await db.leave.clear();
  await db.payroll.clear();
  await db.expenses.clear();
  await db.settings.clear();

  await seedDemoData();
}

// ─── Database Helper Functions ──────────────────────────────────

const DB = {
  // ── Departments ────────────────────────────────────────────
  async getDepartments() {
    return await db.departments.orderBy('name').toArray();
  },

  async getDepartmentNames() {
    const depts = await db.departments.orderBy('name').toArray();
    return depts.map(d => d.name);
  },

  async addDepartment(name) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Department name cannot be empty');
    const existing = await db.departments.where('name').equals(trimmed).first();
    if (existing) throw new Error('Department already exists');
    return await db.departments.add({ name: trimmed });
  },

  async deleteDepartment(id) {
    // Check if any employees are using this department
    const dept = await db.departments.get(id);
    if (!dept) throw new Error('Department not found');
    const employees = await db.employees.where('department').equals(dept.name).toArray();
    if (employees.length > 0) {
      throw new Error(`Cannot delete "${dept.name}" — ${employees.length} employee(s) are assigned to it`);
    }
    return await db.departments.delete(id);
  },

  // ── Employees ───────────────────────────────────────────────
  async getEmployees() {
    return await db.employees.where('status').equals('active').toArray();
  },

  async getAllEmployees() {
    return await db.employees.toArray();
  },

  async getEmployee(id) {
    // Dexie auto-increment keys are numbers — coerce if needed
    const key = typeof id === 'string' ? parseInt(id, 10) : id;
    return await db.employees.get(key);
  },

  async getEmployeeByEmpId(empId) {
    return await db.employees.where('employeeId').equals(empId).first();
  },

  async addEmployee(data) {
    // Auto-generate employee ID
    const count = await db.employees.count();
    const empId = `EMP-${String(count + 1).padStart(3, '0')}`;
    data.employeeId = empId;
    data.status = 'active';
    return await db.employees.add(data);
  },

  async updateEmployee(id, data) {
    return await db.employees.update(typeof id === 'string' ? parseInt(id, 10) : id, data);
  },

  async deleteEmployee(id) {
    // Soft delete - set status to inactive
    return await db.employees.update(typeof id === 'string' ? parseInt(id, 10) : id, { status: 'inactive' });
  },

  async getEmployeeCount() {
    return await db.employees.where('status').equals('active').count();
  },

  // ── Leave ───────────────────────────────────────────────────
  async getLeaveRecords() {
    return await db.leave.orderBy('appliedDate').reverse().toArray();
  },

  async getLeaveByEmployee(employeeId) {
    return await db.leave.where('employeeId').equals(employeeId).toArray();
  },

  async addLeave(data) {
    data.appliedDate = Utils.toDateInputValue(new Date());
    return await db.leave.add(data);
  },

  async updateLeave(id, data) {
    return await db.leave.update(typeof id === 'string' ? parseInt(id, 10) : id, data);
  },

  async deleteLeave(id) {
    return await db.leave.delete(typeof id === 'string' ? parseInt(id, 10) : id);
  },

  async getPendingLeaveCount() {
    return await db.leave.where('status').equals('pending').count();
  },

  // ── Payroll ─────────────────────────────────────────────────
  async getPayrollRecords() {
    const records = await db.payroll.orderBy('year').reverse().toArray();
    return records.sort((a, b) => b.month - a.month || b.year - a.year);
  },

  async getPayrollByPeriod(month, year) {
    return await db.payroll.where({ month, year }).toArray();
  },

  async addPayroll(data) {
    return await db.payroll.add(data);
  },

  async updatePayroll(id, data) {
    return await db.payroll.update(typeof id === 'string' ? parseInt(id, 10) : id, data);
  },

  async deletePayroll(id) {
    return await db.payroll.delete(typeof id === 'string' ? parseInt(id, 10) : id);
  },

  async getMonthlyPayrollTotal(month, year) {
    const records = await db.payroll.where({ month, year, status: 'paid' }).toArray();
    return records.reduce((sum, r) => sum + Number(r.netPay), 0);
  },

  // ── Expenses ────────────────────────────────────────────────
  async getExpenses() {
    return await db.expenses.orderBy('date').reverse().toArray();
  },

  async addExpense(data) {
    return await db.expenses.add(data);
  },

  async updateExpense(id, data) {
    return await db.expenses.update(typeof id === 'string' ? parseInt(id, 10) : id, data);
  },

  async deleteExpense(id) {
    return await db.expenses.delete(typeof id === 'string' ? parseInt(id, 10) : id);
  },

  async getPendingExpensesTotal() {
    const pending = await db.expenses.where('status').equals('pending').toArray();
    return pending.reduce((sum, e) => sum + Number(e.amount), 0);
  },

  async getApprovedExpensesTotal() {
    const approved = await db.expenses.where('status').equals('approved').toArray();
    return approved.reduce((sum, e) => sum + Number(e.amount), 0);
  },

  // ── Settings ────────────────────────────────────────────────
  async getSetting(key) {
    const record = await db.settings.where('key').equals(key).first();
    return record ? record.value : null;
  },

  async setSetting(key, value) {
    const existing = await db.settings.where('key').equals(key).first();
    if (existing) {
      return await db.settings.update(existing.id, { value });
    } else {
      return await db.settings.add({ key, value });
    }
  },

  async getAllSettings() {
    const records = await db.settings.toArray();
    const settings = {};
    records.forEach(r => { settings[r.key] = r.value; });
    return settings;
  },

  /**
   * Load full demo data — clears all existing records then seeds fresh.
   * Used by the Settings "Load Demo Data" button.
   */
  async loadDemoData() {
    // Clear all stores
    await db.employees.clear();
    await db.leave.clear();
    await db.payroll.clear();
    await db.expenses.clear();
    await db.settings.clear();
    await db.departments.clear();
    // Re-seed with rich demo data
    await seedDemoData();
  },

  // ── Leave Balances ─────────────────────────────────────────
  // TOTAL leave entitlement is 22 working days per year shared across ALL leave types.
  // Days are calculated as working days (Mon-Fri, excluding Uganda public holidays).
  TOTAL_LEAVE_DAYS: 22,

  LEAVE_ALLOCATIONS: {
    annual: { label: 'Annual Leave', days: 22 },
    sick: { label: 'Sick Leave', days: 22 },
    personal: { label: 'Personal Leave', days: 22 },
    maternity: { label: 'Maternity Leave', days: 22 },
    paternity: { label: 'Paternity Leave', days: 22 },
    study: { label: 'Study Leave', days: 22 },
    compassionate: { label: 'Compassionate Leave', days: 22 }
  },

  /**
   * Get total used leave days for an employee across ALL approved leave types
   */
  async getTotalLeaveDaysUsed(employeeId) {
    const records = await db.leave.where('employeeId').equals(employeeId).toArray();
    const approved = records.filter(r => r.status === 'approved');
    let totalUsed = 0;
    approved.forEach(r => {
      totalUsed += (r.days || Utils.daysBetween(r.startDate, r.endDate));
    });
    return totalUsed;
  },

  /**
   * Get leave balances for a specific employee
   * Uses a SINGLE combined pool of 22 working days for ALL leave types.
   */
  async getEmployeeLeaveBalances(employeeId) {
    const totalAllowance = DB.TOTAL_LEAVE_DAYS;
    const records = await db.leave.where('employeeId').equals(employeeId).toArray();
    const approved = records.filter(r => r.status === 'approved');

    // Calculate used days per leave type
    const usedByType = {};
    let totalUsed = 0;
    approved.forEach(r => {
      const days = r.days || Utils.daysBetween(r.startDate, r.endDate);
      usedByType[r.leaveType] = (usedByType[r.leaveType] || 0) + days;
      totalUsed += days;
    });

    const totalRemaining = Math.max(0, totalAllowance - totalUsed);

    // Return balances with per-type breakdown PLUS total
    // All leave types share a SINGLE 22-day pool — per-type "remaining" shows global remaining
    const balances = {};
    for (const [type, config] of Object.entries(DB.LEAVE_ALLOCATIONS)) {
      const taken = usedByType[type] || 0;
      balances[type] = {
        type,
        label: config.label,
        allocation: config.days,
        taken,
        // Shared pool: each type shows the GLOBAL remaining days
        remaining: totalRemaining
      };
    }

    // Add a "total" pseudo-type showing the combined pool
    balances.total = {
      type: 'total',
      label: 'Total Leave (All Types)',
      allocation: totalAllowance,
      taken: totalUsed,
      remaining: totalRemaining
    };

    return balances;
  },

  /**
   * Get leave balances for ALL active employees
   */
  async getAllLeaveBalances() {
    const employees = await db.employees.where('status').equals('active').toArray();
    const allBalances = [];

    for (const emp of employees) {
      const balances = await DB.getEmployeeLeaveBalances(emp.employeeId);
      const fullName = `${emp.firstName} ${emp.lastName}`;

      // Use the TOTAL pseudo-type for combined stats
      const totalInfo = balances.total || { allocation: 0, taken: 0, remaining: 0 };
      const totalRemaining = totalInfo.remaining;

      allBalances.push({
        employeeId: emp.employeeId,
        name: fullName,
        firstName: emp.firstName,
        lastName: emp.lastName,
        photo: emp.photo,
        department: emp.department,
        balances,
        totalRemaining: totalInfo.remaining,
        totalAllocation: totalInfo.allocation,
        totalTaken: totalInfo.taken
      });
    }
    return allBalances;
  },

  // ── Petty Cash ──────────────────────────────────────────────
  async getPettyCash() {
    return await db.pettyCash.orderBy('date').reverse().toArray();
  },

  async addPettyCash(data) {
    return await db.pettyCash.add(data);
  },

  async updatePettyCash(id, data) {
    return await db.pettyCash.update(typeof id === 'string' ? parseInt(id, 10) : id, data);
  },

  async deletePettyCash(id) {
    return await db.pettyCash.delete(typeof id === 'string' ? parseInt(id, 10) : id);
  },

  /**
   * Get the current petty cash balance
   */
  async getPettyCashBalance() {
    const records = await db.pettyCash.toArray();
    let balance = 0;
    records.forEach(r => {
      if (r.type === 'opening' || r.type === 'replenishment') {
        balance += Number(r.amount);
      } else if (r.type === 'withdrawal' || r.type === 'expense') {
        balance -= Number(r.amount);
      }
    });
    return balance;
  },

  /**
   * Get petty cash transactions within a date range
   */
  async getPettyCashByDateRange(startDate, endDate) {
    const all = await db.pettyCash.orderBy('date').toArray();
    return all.filter(r => r.date >= startDate && r.date <= endDate);
  },

  // ── Office Forms ────────────────────────────────────────────
  async getOfficeForms() {
    return await db.officeForms.orderBy('createdDate').reverse().toArray();
  },

  async getOfficeFormsByType(formType) {
    return await db.officeForms.where('formType').equals(formType).reverse().toArray();
  },

  async addOfficeForm(data) {
    return await db.officeForms.add(data);
  },

  async updateOfficeForm(id, data) {
    return await db.officeForms.update(typeof id === 'string' ? parseInt(id, 10) : id, data);
  },

  async deleteOfficeForm(id) {
    return await db.officeForms.delete(typeof id === 'string' ? parseInt(id, 10) : id);
  },

  async getOfficeForm(id) {
    const key = typeof id === 'string' ? parseInt(id, 10) : id;
    return await db.officeForms.get(key);
  },

  // ── Dashboard Stats ─────────────────────────────────────────
  async getDashboardStats() {
    const employees = await db.employees.where('status').equals('active').toArray();
    const leave = await db.leave.toArray();
    const payroll = await db.payroll.toArray();
    const expenses = await db.expenses.toArray();

    const totalEmployees = employees.length;
    const pendingLeave = leave.filter(l => l.status === 'pending').length;
    const pendingPayroll = payroll.filter(p => p.status === 'pending').length;

    // Department distribution
    const depts = {};
    employees.forEach(e => {
      depts[e.department] = (depts[e.department] || 0) + 1;
    });

    // Monthly payroll total (current month)
    const { month, year } = Utils.getCurrentPeriod();
    const monthlyPayroll = payroll
      .filter(p => p.month === month && p.year === year && p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.netPay), 0);

    const pendingExpensesTotal = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      totalEmployees,
      pendingLeave,
      pendingPayroll,
      departmentCount: Object.keys(depts).length,
      depts,
      monthlyPayroll,
      pendingExpensesTotal,
      totalExpenses: expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    };
  }
};

// ─── Initialize Database ────────────────────────────────────────
seedDefaultData().catch(err => console.error('DB Seed error:', err));
