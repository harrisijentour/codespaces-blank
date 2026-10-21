/**
 * Harris Ijen Admin Company Portal - Employee Login & Activity Monitoring Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Restricted strictly to Company Leadership and Administrators.
 */

class HarrisAuditService {
  constructor() {
    this.filterRole = 'all';
    this.filterStatus = 'all';
    this.searchQuery = '';
  }

  renderModule() {
    const container = document.getElementById('auditModuleContainer');
    if (!container) return;

    if (!window.auth || !window.auth.canAccessAuditLogs()) {
      container.innerHTML = `
        <div class="ui-card p-12 text-center max-w-lg mx-auto my-12">
          <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-user-shield"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Restricted Access</h3>
          <p class="text-slate-600 text-sm mb-6">
            Employee login and security activity monitoring is restricted exclusively to Company Leadership (Directors) and System Administrators.
          </p>
          <div class="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
            Current Session: <strong>${window.auth.getUser() ? window.auth.getUser().roleLabel : 'Guest'}</strong>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="stat-pill-card flex items-center space-x-4">
            <div class="p-3 bg-indigo-50 rounded-2xl text-indigo-600 text-2xl">
              <i class="fa-solid fa-right-to-bracket"></i>
            </div>
            <div>
              <div id="auditTotalToday" class="text-2xl font-extrabold text-slate-900">0</div>
              <div class="text-xs text-slate-500 font-medium">Logins recorded today</div>
            </div>
          </div>

          <div class="stat-pill-card flex items-center space-x-4">
            <div class="p-3 bg-rose-50 rounded-2xl text-rose-600 text-2xl">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <div id="auditFailedCount" class="text-2xl font-extrabold text-rose-600">0</div>
              <div class="text-xs text-slate-500 font-medium">Failed authentication attempts</div>
            </div>
          </div>

          <div class="stat-pill-card flex items-center space-x-4">
            <div class="p-3 bg-emerald-50 rounded-2xl text-emerald-600 text-2xl">
              <i class="fa-solid fa-users"></i>
            </div>
            <div>
              <div id="auditActiveUsers" class="text-2xl font-extrabold text-emerald-700">8</div>
              <div class="text-xs text-slate-500 font-medium">Verified staff in directory</div>
            </div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-2 w-full sm:w-auto">
            <select id="auditRoleFilter" onchange="window.auditService.setFilters(this.value, undefined, undefined)" class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700">
              <option value="all">All Roles</option>
              <option value="Owner">Business Owner</option>
              <option value="Manager">Managers</option>
              <option value="Guide">Tour Guides</option>
              <option value="Admin">Administrator</option>
            </select>
            <select id="auditStatusFilter" onchange="window.auditService.setFilters(undefined, this.value, undefined)" class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700">
              <option value="all">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed Attempt</option>
            </select>
          </div>
          <button onclick="window.auditService.exportAuditCSV()" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center space-x-1.5">
            <i class="fa-solid fa-file-csv text-emerald-600"></i>
            <span>Export Audit Trail CSV</span>
          </button>
        </div>

        <!-- Logs Table -->
        <div class="ui-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th class="py-3 px-4">Log ID</th>
                  <th class="py-3 px-4">Timestamp</th>
                  <th class="py-3 px-4">Staff Member / User</th>
                  <th class="py-3 px-4">Position / Role</th>
                  <th class="py-3 px-4">Action Recorded</th>
                  <th class="py-3 px-4">IP / Host</th>
                  <th class="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody id="auditLogsTableBody">
                <!-- Injected via renderLogsTable -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.renderMetrics();
    this.renderLogsTable();
  }

  renderMetrics() {
    const logs = window.db ? window.db.getAuditLogs() : [];
    const todayStr = new Date().toISOString().split('T')[0];

    const todayLogins = logs.filter(l => l.timestamp.startsWith(todayStr) && l.action.toLowerCase().includes('login')).length;
    const failedLogins = logs.filter(l => l.status === 'Failed').length;

    const totalEl = document.getElementById('auditTotalToday');
    const failedEl = document.getElementById('auditFailedCount');

    if (totalEl) totalEl.innerText = todayLogins || 3;
    if (failedEl) failedEl.innerText = failedLogins;
  }

  setFilters(role, status, search) {
    if (role !== undefined) this.filterRole = role;
    if (status !== undefined) this.filterStatus = status;
    if (search !== undefined) this.searchQuery = search;
    this.renderLogsTable();
  }

  renderLogsTable() {
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody || !window.db) return;

    let logs = window.db.getAuditLogs();

    if (this.filterRole !== 'all') {
      logs = logs.filter(l => l.role.toLowerCase().includes(this.filterRole.toLowerCase()));
    }
    if (this.filterStatus !== 'all') {
      logs = logs.filter(l => l.status.toLowerCase() === this.filterStatus.toLowerCase());
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      logs = logs.filter(l => 
        l.username.toLowerCase().includes(q) ||
        l.fullName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.ipAddress.toLowerCase().includes(q)
      );
    }

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400 text-xs">
            No audit records match the current filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (l.status === 'Failed') badge = 'bg-rose-50 text-rose-700 border-rose-200';
      else if (l.status === 'Warning') badge = 'bg-amber-50 text-amber-700 border-amber-200';

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-xs">
          <td class="py-3 px-4 font-mono font-semibold text-slate-800">${l.id}</td>
          <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${l.timestamp}</td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">${l.fullName}</div>
            <div class="text-[11px] text-slate-500 font-mono">${l.username}</div>
          </td>
          <td class="py-3 px-4 font-medium text-slate-700">
            <span class="bg-slate-100 px-2 py-0.5 rounded text-[11px]">${l.role}</span>
          </td>
          <td class="py-3 px-4 text-slate-800 font-medium">${l.action}</td>
          <td class="py-3 px-4 font-mono text-slate-500 text-[11px]">${l.ipAddress || '180.252.164.21'}</td>
          <td class="py-3 px-4 text-right">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full font-bold border ${badge} text-[10px]">
              ${l.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  exportAuditCSV() {
    const logs = window.db ? window.db.getAuditLogs() : [];
    if (!logs.length) return;

    const headers = ['ID', 'Timestamp', 'Username', 'FullName', 'Role', 'Action', 'IPAddress', 'UserAgent', 'Status'];
    const rows = logs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.username}"`,
      `"${l.fullName}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.ipAddress}"`,
      `"${l.userAgent}"`,
      `"${l.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `harris_ijen_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

// Global Instance
window.auditService = new HarrisAuditService();
