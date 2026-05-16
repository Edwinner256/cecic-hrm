// ─── Database Layer (Dexie.js / IndexedDB) ──────────────────────

const db = new Dexie('HRMS_Database');

db.version(2).stores({
  employees: '++id, employeeId, firstName, lastName, email, department, position, status, employmentDate',
  leave: '++id, employeeId, leaveType, status, startDate, endDate, appliedDate',
  payroll: '++id, employeeId, month, year, status, paidDate',
  expenses: '++id, officerName, department, category, status, date',
  settings: '++id, key',
  departments: '++id, name'
});

// ─── Default Data Seeds ─────────────────────────────────────────

async function seedDefaultData() {
  // Seed default departments
  const deptCount = await db.departments.count();
  if (deptCount === 0) {
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
  }

  const empCount = await db.employees.count();
  if (empCount === 0) {
    const now = new Date();
    await db.employees.bulkAdd([
      {
        employeeId: 'EMP-001',
        firstName: 'John',
        lastName: 'Ssebunya',
        email: 'john.ssebunya@company.co.ug',
        phone: '+256 712 345 678',
        department: 'Engineering',
        position: 'Senior Developer',
        salary: 10000000,
        employmentDate: Utils.toDateInputValue(new Date(2022, 0, 15)),
        status: 'active',
        photo: '',
        address: '123 Kampala Rd',
        emergencyContact: '+256 722 111 222',
        bankAccount: '1001234567890',
        bankName: 'Stanbic Bank Uganda'
      },
      {
        employeeId: 'EMP-002',
        firstName: 'Mary',
        lastName: 'Nakato',
        email: 'mary.nakato@company.co.ug',
        phone: '+256 723 456 789',
        department: 'Finance',
        position: 'Finance Officer',
        salary: 6500000,
        employmentDate: Utils.toDateInputValue(new Date(2021, 5, 1)),
        status: 'active',
        photo: '',
        address: '456 Jinja Rd',
        emergencyContact: '+256 733 333 444',
        bankAccount: '2000987654321',
        bankName: 'Centenary Bank'
      },
      {
        employeeId: 'EMP-003',
        firstName: 'Peter',
        lastName: 'Okello',
        email: 'peter.okello@company.co.ug',
        phone: '+256 711 567 890',
        department: 'Human Resources',
        position: 'HR Officer',
        salary: 5000000,
        employmentDate: Utils.toDateInputValue(new Date(2023, 2, 10)),
        status: 'active',
        photo: '',
        address: '789 Gulu Rd',
        emergencyContact: '+256 744 555 666',
        bankAccount: '3005556667777',
        bankName: 'DFCU Bank'
      },
      {
        employeeId: 'EMP-004',
        firstName: 'Grace',
        lastName: 'Achieng',
        email: 'grace.achieng@company.co.ug',
        phone: '+256 713 678 901',
        department: 'Marketing',
        position: 'Marketing Lead',
        salary: 7500000,
        employmentDate: Utils.toDateInputValue(new Date(2022, 8, 20)),
        status: 'active',
        photo: '',
        address: '321 Entebbe Rd',
        emergencyContact: '+256 755 777 888',
        bankAccount: '4001112223334',
        bankName: 'Absa Bank Uganda'
      },
      {
        employeeId: 'EMP-005',
        firstName: 'David',
        lastName: 'Muwonge',
        email: 'david.muwonge@company.co.ug',
        phone: '+256 714 789 012',
        department: 'Engineering',
        position: 'Junior Developer',
        salary: 3500000,
        employmentDate: Utils.toDateInputValue(new Date(2024, 0, 5)),
        status: 'active',
        photo: '',
        address: '654 Entebbe Rd',
        emergencyContact: '+256 766 888 999',
        bankAccount: '5004445556667',
        bankName: 'Equity Bank Uganda'
      }
    ]);

    // Seed leave requests
    await db.leave.bulkAdd([
      {
        employeeId: 'EMP-001',
        employeeName: 'John Ssebunya',
        leaveType: 'annual',
        startDate: '2026-03-10',
        endDate: '2026-03-14',
        days: 5,
        reason: 'Family visit to Jinja',
        status: 'approved',
        appliedDate: Utils.toDateInputValue(new Date(2026, 1, 15)),
        approvedBy: 'HR Admin'
      },
      {
        employeeId: 'EMP-002',
        employeeName: 'Mary Nakato',
        leaveType: 'sick',
        startDate: '2026-04-01',
        endDate: '2026-04-02',
        days: 2,
        reason: 'Medical appointment',
        status: 'approved',
        appliedDate: Utils.toDateInputValue(new Date(2026, 2, 28)),
        approvedBy: 'HR Admin'
      },
      {
        employeeId: 'EMP-003',
        employeeName: 'Peter Okello',
        leaveType: 'personal',
        startDate: '2026-05-05',
        endDate: '2026-05-05',
        days: 1,
        reason: 'Personal errand',
        status: 'pending',
        appliedDate: Utils.toDateInputValue(new Date(2026, 4, 1)),
        approvedBy: ''
      }
    ]);

    // Seed payroll records
    await db.payroll.bulkAdd([
      {
        employeeId: 'EMP-001',
        employeeName: 'John Ssebunya',
        month: 4,
        year: 2026,
        basicSalary: 10000000,
        allowances: 1500000,
        deductions: 2000000,
        netPay: 9500000,
        status: 'paid',
        paidDate: '2026-04-28'
      },
      {
        employeeId: 'EMP-002',
        employeeName: 'Mary Nakato',
        month: 4,
        year: 2026,
        basicSalary: 6500000,
        allowances: 800000,
        deductions: 1200000,
        netPay: 6100000,
        status: 'paid',
        paidDate: '2026-04-28'
      },
      {
        employeeId: 'EMP-003',
        employeeName: 'Peter Okello',
        month: 4,
        year: 2026,
        basicSalary: 5000000,
        allowances: 500000,
        deductions: 900000,
        netPay: 4600000,
        status: 'pending',
        paidDate: ''
      }
    ]);

    // Seed expenses
    await db.expenses.bulkAdd([
      {
        officerName: 'John Ssebunya',
        department: 'Engineering',
        category: 'Travel',
        amount: 850000,
        description: 'Client site visit - Jinja',
        date: '2026-04-10',
        receipt: '',
        status: 'approved',
        approvedBy: 'Finance'
      },
      {
        officerName: 'Grace Achieng',
        department: 'Marketing',
        category: 'Supplies',
        amount: 450000,
        description: 'Marketing materials for trade fair',
        date: '2026-04-15',
        receipt: '',
        status: 'approved',
        approvedBy: 'Finance'
      },
      {
        officerName: 'Peter Okello',
        department: 'Human Resources',
        category: 'Other',
        amount: 350000,
        description: 'Staff welfare - team lunch',
        date: '2026-05-02',
        receipt: '',
        status: 'pending',
        approvedBy: ''
      }
    ]);

    // Seed default settings
    await db.settings.bulkAdd([
      { key: 'companyName', value: 'Offline HRMS (U) Ltd' },
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
    return await db.employees.get(id);
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
    return await db.employees.update(id, data);
  },

  async deleteEmployee(id) {
    // Soft delete - set status to inactive
    return await db.employees.update(id, { status: 'inactive' });
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
    return await db.leave.update(id, data);
  },

  async deleteLeave(id) {
    return await db.leave.delete(id);
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
    return await db.payroll.update(id, data);
  },

  async deletePayroll(id) {
    return await db.payroll.delete(id);
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
    return await db.expenses.update(id, data);
  },

  async deleteExpense(id) {
    return await db.expenses.delete(id);
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

  // ── Leave Balances ─────────────────────────────────────────
  // Default annual leave allocations per leave type
  LEAVE_ALLOCATIONS: {
    annual: { label: 'Annual Leave', days: 30 },
    sick: { label: 'Sick Leave', days: 15 },
    personal: { label: 'Personal Leave', days: 5 },
    maternity: { label: 'Maternity Leave', days: 90 },
    paternity: { label: 'Paternity Leave', days: 10 },
    study: { label: 'Study Leave', days: 30 },
    compassionate: { label: 'Compassionate Leave', days: 5 }
  },

  /**
   * Get leave balances for a specific employee
   */
  async getEmployeeLeaveBalances(employeeId) {
    const allocations = DB.LEAVE_ALLOCATIONS;
    const records = await db.leave.where('employeeId').equals(employeeId).toArray();
    const approved = records.filter(r => r.status === 'approved');

    // Calculate used days per leave type
    const used = {};
    approved.forEach(r => {
      const days = r.days || Utils.daysBetween(r.startDate, r.endDate);
      used[r.leaveType] = (used[r.leaveType] || 0) + days;
    });

    const balances = {};
    for (const [type, config] of Object.entries(allocations)) {
      const taken = used[type] || 0;
      balances[type] = {
        type,
        label: config.label,
        allocation: config.days,
        taken,
        remaining: Math.max(0, config.days - taken)
      };
    }
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
      // Calculate total remaining across all leave types
      const totalRemaining = Object.values(balances).reduce((sum, b) => sum + b.remaining, 0);
      const totalAllocation = Object.values(balances).reduce((sum, b) => sum + b.allocation, 0);
      const totalTaken = Object.values(balances).reduce((sum, b) => sum + b.taken, 0);

      allBalances.push({
        employeeId: emp.employeeId,
        name: fullName,
        firstName: emp.firstName,
        lastName: emp.lastName,
        photo: emp.photo,
        department: emp.department,
        balances,
        totalRemaining,
        totalAllocation,
        totalTaken
      });
    }
    return allBalances;
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
