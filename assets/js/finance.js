/**
 * Harris Ijen Admin Company Portal - Financial Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Accessible only to Company Leadership and Administrators.
 */

class HarrisFinanceService {
  constructor() {
    this.revenueChart = null;
    this.packageChart = null;
    this.currentFilter = 'all';
  }

  renderModule() {
    const container = document.getElementById('financeModuleContainer');
    if (!container) return;

    if (!window.auth || !window.auth.canAccessFinance()) {
      container.innerHTML = `
        <div class="ui-card p-12 text-center max-w-lg mx-auto my-12">
          <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Restricted Access Module</h3>
          <p class="text-slate-600 text-sm mb-6">
            The Financial Module contains confidential corporate accounting records and is restricted exclusively to Company Leadership (Directors) and Administrators.
          </p>
          <div class="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
            Current Session: <strong>${window.auth.getUser() ? window.auth.getUser().roleLabel : 'Guest'}</strong>
          </div>
        </div>
      `;
      return;
    }

    // Inject full Financial Module UI if not yet rendered
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Financial KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="ui-card p-4">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Income</div>
            <div id="finGrossIncome" class="text-xl md:text-2xl font-extrabold text-emerald-700 mt-1">IDR 0</div>
            <div class="text-[10px] text-slate-400 font-semibold mt-1">All verified bookings</div>
          </div>
          <div class="ui-card p-4">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</div>
            <div id="finTotalExpenses" class="text-xl md:text-2xl font-extrabold text-amber-700 mt-1">IDR 0</div>
            <div class="text-[10px] text-slate-400 font-semibold mt-1">Park permits & jeeps</div>
          </div>
          <div class="ui-card p-4">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refunds Processed</div>
            <div id="finTotalRefunds" class="text-xl md:text-2xl font-extrabold text-rose-600 mt-1">IDR 0</div>
            <div class="text-[10px] text-slate-400 font-semibold mt-1">Leadership approved</div>
          </div>
          <div class="ui-card p-4">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Operating Profit</div>
            <div id="finNetProfit" class="text-xl md:text-2xl font-extrabold text-blue-900 mt-1">IDR 0</div>
            <div class="text-[10px] text-emerald-600 font-semibold mt-1">Income - Costs - Refunds</div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="ui-card p-5 lg:col-span-2 space-y-3">
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500">Revenue Trajectory (Monthly)</h4>
            <div class="h-64 relative">
              <canvas id="chartMonthlyRevenue"></canvas>
            </div>
          </div>
          <div class="ui-card p-5 space-y-3">
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500">Package Revenue Distribution</h4>
            <div class="h-64 relative flex items-center justify-center">
              <canvas id="chartPackageDistribution"></canvas>
            </div>
          </div>
        </div>

        <!-- Ledger Table -->
        <div class="ui-card overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 class="font-bold text-sm text-slate-900">Financial Transaction Ledger</h4>
            <div class="flex items-center space-x-1 text-xs">
              <button onclick="window.financeService.setFilter('all')" class="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">All</button>
              <button onclick="window.financeService.setFilter('Income')" class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">Income</button>
              <button onclick="window.financeService.setFilter('Expense')" class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">Expenses</button>
              <button onclick="window.financeService.setFilter('Refund')" class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">Refunds</button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th class="py-3 px-4">TX ID</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Type</th>
                  <th class="py-3 px-4">Reference / Guest</th>
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4">Method</th>
                  <th class="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody id="finLedgerTableBody">
                <!-- Injected via renderLedger -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.renderKPIs();
    this.renderCharts();
    this.renderLedger();
  }

  renderKPIs() {
    const summary = window.db ? window.db.getFinancialSummary() : null;
    if (!summary) return;

    const grossEl = document.getElementById('finGrossIncome');
    const netEl = document.getElementById('finNetProfit');
    const refundsEl = document.getElementById('finTotalRefunds');
    const expEl = document.getElementById('finTotalExpenses');

    if (grossEl) grossEl.innerText = 'IDR ' + summary.grossIncome.toLocaleString('id-ID');
    if (netEl) netEl.innerText = 'IDR ' + summary.netProfit.toLocaleString('id-ID');
    if (refundsEl) refundsEl.innerText = 'IDR ' + summary.totalRefunds.toLocaleString('id-ID');
    if (expEl) expEl.innerText = 'IDR ' + summary.totalExpenses.toLocaleString('id-ID');
  }

  renderCharts() {
    if (!window.Chart || !window.db) return;

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthlyIncome = [12000000, 18500000, 24000000, 29500000, 13200000, 8250000];
    const monthlyExpense = [4000000, 5200000, 7100000, 8300000, 4600000, 2850000];

    const ctxRev = document.getElementById('chartMonthlyRevenue')?.getContext('2d');
    if (ctxRev) {
      if (this.revenueChart) this.revenueChart.destroy();
      this.revenueChart = new Chart(ctxRev, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Gross Income (IDR)',
              data: monthlyIncome,
              backgroundColor: '#0B2545',
              borderRadius: 6
            },
            {
              label: 'Operating Costs & Refunds (IDR)',
              data: monthlyExpense,
              backgroundColor: '#C59B27',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', size: 11 } } }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (val) => (val / 1000000) + 'M' }
            }
          }
        }
      });
    }

    const ctxPkg = document.getElementById('chartPackageDistribution')?.getContext('2d');
    if (ctxPkg) {
      if (this.packageChart) this.packageChart.destroy();
      this.packageChart = new Chart(ctxPkg, {
        type: 'doughnut',
        data: {
          labels: ['Ijen Blue Fire Midnight', 'Bromo & Ijen 3D2N', 'Baluran Safari', 'VIP Family'],
          datasets: [{
            data: [3750000, 6800000, 3900000, 4500000],
            backgroundColor: ['#0B2545', '#13315C', '#C59B27', '#10B981'],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 10 } } }
          }
        }
      });
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderLedger();
  }

  renderLedger() {
    const tbody = document.getElementById('finLedgerTableBody');
    if (!tbody || !window.db) return;

    let items = window.db.getFinancials();
    if (this.currentFilter !== 'all') {
      items = items.filter(i => i.type.toLowerCase() === this.currentFilter.toLowerCase());
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-slate-400">
            No transactions found for current filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => {
      let typeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      let icon = 'fa-arrow-down-left';
      let sign = '+';

      if (item.type === 'Expense') {
        typeBadge = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = 'fa-arrow-up-right';
        sign = '-';
      } else if (item.type === 'Refund') {
        typeBadge = 'bg-rose-50 text-rose-700 border-rose-200';
        icon = 'fa-arrow-rotate-left';
        sign = '-';
      }

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-xs">
          <td class="py-3 px-4 font-mono font-semibold text-slate-800">${item.id}</td>
          <td class="py-3 px-4 text-slate-500">${item.date}</td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold border ${typeBadge}">
              <i class="fa-solid ${icon} mr-1 text-[10px]"></i> ${item.type}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-900">${item.guestName || '-'}</div>
            <div class="text-[11px] text-slate-500 font-mono">${item.invoiceNumber || '-'}</div>
          </td>
          <td class="py-3 px-4 text-slate-600 max-w-xs truncate" title="${item.description}">${item.description}</td>
          <td class="py-3 px-4 text-slate-600">${item.paymentMethod || 'Transfer'}</td>
          <td class="py-3 px-4 text-right font-bold ${sign === '+' ? 'text-emerald-700' : 'text-rose-600'}">
            ${sign} IDR ${Number(item.amount).toLocaleString('id-ID')}
          </td>
        </tr>
      `;
    }).join('');
  }
}

// Global Instance
window.financeService = new HarrisFinanceService();
