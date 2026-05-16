// ─── Dashboard Module ────────────────────────────────────────────

const Dashboard = {
  chartInstances: {},

  async render() {
    const container = document.getElementById('page-dashboard');
    const stats = await DB.getDashboardStats();

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="bi bi-people"></i></div>
          <div class="stat-info">
            <h3>${stats.totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="bi bi-cash-stack"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(stats.monthlyPayroll)}</h3>
            <p>Monthly Payroll</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><i class="bi bi-calendar-check"></i></div>
          <div class="stat-info">
            <h3>${stats.pendingLeave}</h3>
            <p>Pending Leave</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="bi bi-receipt"></i></div>
          <div class="stat-info">
            <h3>${Utils.formatCurrency(stats.pendingExpensesTotal)}</h3>
            <p>Pending Expenses</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon cyan"><i class="bi bi-building"></i></div>
          <div class="stat-info">
            <h3>${stats.departmentCount}</h3>
            <p>Departments</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="bi bi-clock"></i></div>
          <div class="stat-info">
            <h3>${stats.pendingPayroll}</h3>
            <p>Pending Payroll</p>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px">
        <div class="stat-card" style="cursor:pointer;transition:all 0.2s;border-left:4px solid var(--primary);padding:16px" onclick="App.navigate('employees')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(22,101,52,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;color:var(--primary);font-size:20px"><i class="bi bi-people"></i></div>
            <div>
              <div style="font-size:13px;font-weight:600">Employees</div>
              <div style="font-size:11px;color:var(--text-muted)">Manage staff</div>
            </div>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;transition:all 0.2s;border-left:4px solid var(--success);padding:16px" onclick="App.navigate('leave')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(22,101,52,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--success-light);display:flex;align-items:center;justify-content:center;color:var(--success);font-size:20px"><i class="bi bi-calendar-check"></i></div>
            <div>
              <div style="font-size:13px;font-weight:600">Leave</div>
              <div style="font-size:11px;color:var(--text-muted)">Apply & track</div>
            </div>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;transition:all 0.2s;border-left:4px solid var(--warning);padding:16px" onclick="App.navigate('payroll')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(22,101,52,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--warning-light);display:flex;align-items:center;justify-content:center;color:var(--warning);font-size:20px"><i class="bi bi-cash-stack"></i></div>
            <div>
              <div style="font-size:13px;font-weight:600">Payroll</div>
              <div style="font-size:11px;color:var(--text-muted)">Process & export</div>
            </div>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;transition:all 0.2s;border-left:4px solid var(--danger);padding:16px" onclick="App.navigate('expenses')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(22,101,52,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--danger-light);display:flex;align-items:center;justify-content:center;color:var(--danger);font-size:20px"><i class="bi bi-receipt"></i></div>
            <div>
              <div style="font-size:13px;font-weight:600">Expenses</div>
              <div style="font-size:11px;color:var(--text-muted)">Record claims</div>
            </div>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;transition:all 0.2s;border-left:4px solid var(--info);padding:16px" onclick="App.navigate('reports')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(22,101,52,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--info-light);display:flex;align-items:center;justify-content:center;color:var(--info);font-size:20px"><i class="bi bi-file-earmark-bar-graph"></i></div>
            <div>
              <div style="font-size:13px;font-weight:600">Reports</div>
              <div style="font-size:11px;color:var(--text-muted)">View & print</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card">
          <div class="card-header"><h3>Employees by Department</h3></div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="deptChart"></canvas>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Quick Stats</h3></div>
          <div class="card-body">
            <div id="quickStats" style="display:flex;flex-direction:column;gap:12px"></div>
          </div>
        </div>
      </div>

      <div class="card mt-24">
        <div class="card-header">
          <h3>Recent Activity</h3>
        </div>
        <div class="card-body">
          <div id="recentActivity">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    `;

    // Render department chart
    this.renderDeptChart(stats.depts);
    // Render recent activity
    this.renderRecentActivity();
    // Render quick stats
    this.renderQuickStats(stats);
  },

  renderDeptChart(depts) {
    // Destroy previous chart if exists
    if (this.chartInstances.deptChart) {
      this.chartInstances.deptChart.destroy();
    }

    const ctx = document.getElementById('deptChart');
    if (!ctx) return;

    const colors = ['#166534', '#16a34a', '#ea580c', '#dc2626', '#0891b2', '#ca8a04'];

    this.chartInstances.deptChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(depts),
        datasets: [{
          data: Object.values(depts),
          backgroundColor: colors.slice(0, Object.keys(depts).length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, usePointStyle: true, font: { size: 12 } }
          }
        }
      }
    });
  },

  renderQuickStats(stats) {
    const container = document.getElementById('quickStats');
    if (!container) return;

    const items = [
      { label: 'Active Employees', value: stats.totalEmployees, icon: 'bi-people', color: 'var(--primary)' },
      { label: 'Monthly Payroll', value: Utils.formatCurrency(stats.monthlyPayroll), icon: 'bi-cash-stack', color: 'var(--success)' },
      { label: 'Pending Leave', value: stats.pendingLeave, icon: 'bi-calendar-check', color: 'var(--warning)' },
      { label: 'Departments', value: stats.departmentCount, icon: 'bi-building', color: 'var(--info)' },
      { label: 'Pending Expenses', value: Utils.formatCurrency(stats.pendingExpensesTotal), icon: 'bi-receipt', color: 'var(--danger)' },
      { label: 'Pending Payroll', value: stats.pendingPayroll, icon: 'bi-clock', color: 'var(--secondary)' }
    ];

    container.innerHTML = items.map(item => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px">
          <i class="bi ${item.icon}" style="color:${item.color};font-size:16px"></i>
          <span style="font-size:13px;color:var(--text-muted)">${item.label}</span>
        </div>
        <span style="font-size:14px;font-weight:600">${item.value}</span>
      </div>
    `).join('');
  },

  async renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    try {
      const employees = await DB.getEmployees();
      const leaveRecords = await DB.getLeaveRecords();
      const expenses = await DB.getExpenses();
      const payroll = await DB.getPayrollRecords();

      // Build name→photo lookup
      const photoMap = {};
      employees.forEach(e => {
        const fullName = `${e.firstName} ${e.lastName}`;
        photoMap[fullName] = e.photo;
        photoMap[e.firstName] = e.photo; // fallback for first-name only references
      });

      const events = [];

      leaveRecords.slice(0, 5).forEach(l => {
        events.push({
          date: l.appliedDate,
          name: l.employeeName,
          text: `<strong>${Utils.escapeHtml(l.employeeName)}</strong> applied for ${l.leaveType} leave`,
          type: 'leave'
        });
      });

      expenses.slice(0, 5).forEach(e => {
        events.push({
          date: e.date,
          name: e.officerName,
          text: `<strong>${Utils.escapeHtml(e.officerName)}</strong> submitted expense of ${Utils.formatCurrency(e.amount)}`,
          type: 'expense'
        });
      });

      payroll.slice(0, 5).forEach(p => {
        events.push({
          date: p.paidDate || `${p.month}/${p.year}`,
          name: p.employeeName,
          text: `Payroll for <strong>${Utils.escapeHtml(p.employeeName)}</strong> (${Utils.getMonthName(p.month)} ${p.year})`,
          type: 'payroll'
        });
      });

      events.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (events.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No recent activity</p></div>';
        return;
      }

      container.innerHTML = events.slice(0, 10).map(ev => {
        const photo = photoMap[ev.name];
        const photoHtml = photo
          ? `<img class="photo-thumb" src="${Utils.escapeHtml(photo)}" alt="" />`
          : `<span class="photo-placeholder" style="font-size:11px;width:28px;height:28px">${Utils.escapeHtml(ev.name.charAt(0))}</span>`;

        return `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
          ${photoHtml}
          <span style="font-size:11px;color:var(--text-muted);min-width:80px">${Utils.formatDate(ev.date)}</span>
          <span style="font-size:13px">${ev.text}</span>
        </div>`;
      }).join('');

    } catch (err) {
      console.error('Recent activity error:', err);
      container.innerHTML = '<div class="empty-state"><p>Could not load activity</p></div>';
    }
  }
};
