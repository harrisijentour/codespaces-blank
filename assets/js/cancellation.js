/**
 * Harris Ijen Admin Company Portal - Cancellation and Refund Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Requires stated reason and approval from company leadership / management.
 */

class HarrisCancellationService {
  constructor() {
    this.currentFilter = 'all';
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderTable();
  }

  openRequestModal(preselectedGuestId = null) {
    const modal = document.getElementById('modalRequestCancellation');
    if (!modal) return;
    this.populateGuestSelect('cancelGuestSelect');
    if (preselectedGuestId) {
      const select = document.getElementById('cancelGuestSelect');
      if (select) select.value = preselectedGuestId;
      this.onGuestSelected(preselectedGuestId);
    }
    const slider = document.getElementById('cancelPercentSlider');
    this.updateRefundCalculation(slider ? slider.value : 80);
    modal.classList.remove('hidden');
  }

  // Populate guest selector in the cancellation modal
  populateGuestSelect(selectElementId) {
    const el = document.getElementById(selectElementId);
    if (!el || !window.db) return;

    const guests = window.db.getGuests().filter(g => g.paymentStatus !== 'Refunded');
    el.innerHTML = '<option value="">-- Choose Guest / Booking --</option>' + 
      guests.map(g => `
        <option value="${g.id}" data-amount="${g.paymentAmount}" data-invoice="${g.invoiceNumber}" data-name="${g.guestName}">
          ${g.invoiceNumber} - ${g.guestName} (${g.tourPackageName}) [IDR ${Number(g.paymentAmount).toLocaleString('id-ID')}]
        </option>
      `).join('');
  }

  // Handle guest selection change
  onGuestSelected(guestId) {
    const guest = window.db.getGuestById(guestId);
    const amountInput = document.getElementById('cancelOrigAmount');
    const invoiceInput = document.getElementById('cancelInvoiceNo');
    const guestNameInput = document.getElementById('cancelGuestName');
    
    if (guest) {
      if (amountInput) amountInput.value = guest.paymentAmount;
      if (invoiceInput) invoiceInput.value = guest.invoiceNumber;
      if (guestNameInput) guestNameInput.value = guest.guestName;
      const slider = document.getElementById('cancelPercentSlider');
      this.updateRefundCalculation(slider ? slider.value : 80);
    }
  }

  updateRefundCalculation(percentVal) {
    const percent = Number(percentVal || 80);
    const origAmt = Number(document.getElementById('cancelOrigAmount')?.value || 0);
    const label = document.getElementById('cancelPercentLabel');
    const display = document.getElementById('cancelRefundAmountDisplay');

    if (label) label.innerText = `${percent}%`;
    const refundAmt = Math.round((origAmt * percent) / 100);
    if (display) display.innerText = `IDR ${refundAmt.toLocaleString('id-ID')}`;
  }

  // Submit new cancellation request
  submitRequest(formData) {
    if (!formData.reason || formData.reason.trim().length < 8) {
      alert('Please provide a detailed justification for cancellation (minimum 8 characters).');
      return false;
    }

    const user = window.auth ? window.auth.getUser() : null;
    const requestedBy = user ? `${user.fullName} (${user.employeeNumber})` : 'Operations Staff';

    const result = window.db.requestCancellation({
      guestId: formData.guestId,
      invoiceNumber: formData.invoiceNumber,
      guestName: formData.guestName,
      reason: formData.reason,
      refundPercentage: formData.refundPercentage,
      refundAmount: formData.refundAmount,
      requestedBy: requestedBy
    });

    if (user && window.db) {
      window.db.logActivity({
        username: user.username,
        fullName: user.fullName,
        role: `${user.position} (${user.employeeNumber})`,
        action: `Submitted Cancellation Request #${result.id} for ${formData.guestName}`,
        status: 'Success'
      });
    }

    this.renderTable();
    return result;
  }

  // Management Approval Handler
  approve(cancellationId) {
    if (!window.auth.canApproveRefund()) {
      alert('Access Denied: Only Company Leadership or Administrators have authority to approve refunds.');
      return;
    }

    const notes = prompt('Enter Management Approval Notes / Policy Clearance Remarks:', 'Approved under weather / flight disruption policy.');
    if (notes === null) return;

    const user = window.auth.getUser();
    const managerName = user ? `${user.fullName} (${user.employeeNumber})` : 'MUHAMAD ABDUL HARIS, S.H., LL.M';
    const updated = window.db.approveCancellation(cancellationId, managerName, notes);

    if (updated) {
      window.db.logActivity({
        username: user ? user.username : 'haris_director',
        fullName: managerName,
        role: user ? `${user.position} (${user.employeeNumber})` : 'BUSINESS OWNER',
        action: `Approved Refund #${cancellationId} (IDR ${Number(updated.refundAmount).toLocaleString('id-ID')}) for ${updated.guestName}`,
        status: 'Success'
      });
      alert(`Refund #${cancellationId} has been officially approved! The financial payout has been logged into the transaction ledger.`);
      this.renderTable();
      if (window.app) window.app.updateStatsCounters();
    }
  }

  // Management Rejection Handler
  reject(cancellationId) {
    if (!window.auth.canApproveRefund()) {
      alert('Access Denied: Only Company Leadership or Administrators have authority to reject refunds.');
      return;
    }

    const reason = prompt('Enter Reason for Rejecting this Refund Request:', 'Cancellation requested outside allowable policy window.');
    if (reason === null) return;

    const user = window.auth.getUser();
    const managerName = user ? `${user.fullName} (${user.employeeNumber})` : 'MUHAMAD ABDUL HARIS, S.H., LL.M';
    const updated = window.db.rejectCancellation(cancellationId, managerName, reason);

    if (updated) {
      window.db.logActivity({
        username: user ? user.username : 'haris_director',
        fullName: managerName,
        role: user ? `${user.position} (${user.employeeNumber})` : 'BUSINESS OWNER',
        action: `Rejected Refund #${cancellationId} for ${updated.guestName}. Reason: ${reason}`,
        status: 'Warning'
      });
      alert(`Refund request #${cancellationId} has been rejected.`);
      this.renderTable();
      if (window.app) window.app.updateStatsCounters();
    }
  }

  // Render Table in UI
  renderTable() {
    const tbody = document.getElementById('cancellationsTableBody');
    if (!tbody || !window.db) return;

    let items = window.db.getCancellations();
    if (this.currentFilter !== 'all') {
      items = items.filter(i => i.status.toLowerCase().includes(this.currentFilter.toLowerCase()));
    }

    const canApprove = window.auth && window.auth.canApproveRefund();

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400">
            <i class="fa-solid fa-file-circle-check text-3xl mb-2 block"></i>
            No cancellation or refund records matching current filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => {
      let badgeClass = 'badge-pending';
      if (item.status === 'Approved') badgeClass = 'badge-paid';
      else if (item.status === 'Rejected') badgeClass = 'badge-refunded';

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-xs">
          <td class="py-3 px-4 font-mono font-bold text-slate-800">${item.id}</td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">${item.guestName}</div>
            <div class="text-[11px] text-blue-600 font-mono">${item.invoiceNumber}</div>
          </td>
          <td class="py-3 px-4 text-slate-700 max-w-xs">
            <p class="truncate" title="${item.reason}">${item.reason}</p>
          </td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-900">IDR ${Number(item.refundAmount).toLocaleString('id-ID')}</span>
            <span class="text-[11px] text-slate-500 block">(${item.refundPercentage}%)</span>
          </td>
          <td class="py-3 px-4">
            <span class="badge ${badgeClass}">${item.status}</span>
            ${item.approvedBy ? `<div class="text-[10px] text-slate-500 mt-1">By: ${item.approvedBy}</div>` : ''}
          </td>
          <td class="py-3 px-4 text-slate-500">
            ${new Date(item.requestedAt).toLocaleDateString('en-GB')}
          </td>
          <td class="py-3 px-4 text-right">
            ${item.status === 'Pending Approval' ? `
              ${canApprove ? `
                <div class="flex items-center justify-end space-x-1.5">
                  <button onclick="cancellationService.approve('${item.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1">
                    <i class="fa-solid fa-check"></i>
                    <span>Approve</span>
                  </button>
                  <button onclick="cancellationService.reject('${item.id}')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1">
                    <i class="fa-solid fa-xmark"></i>
                    <span>Reject</span>
                  </button>
                </div>
              ` : `
                <span class="text-xs text-amber-600 italic font-semibold">Awaiting Leadership Approval</span>
              `}
            ` : `
              <span class="text-xs text-slate-400 font-medium">Completed</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }
}

// Global handler function
function handleCancellationSubmit(e) {
  e.preventDefault();
  const guestId = document.getElementById('cancelGuestSelect').value;
  const invoiceNumber = document.getElementById('cancelInvoiceNo').value;
  const guestName = document.getElementById('cancelGuestName').value;
  const reason = document.getElementById('cancelReason').value;
  const percent = Number(document.getElementById('cancelPercentSlider').value);
  const origAmt = Number(document.getElementById('cancelOrigAmount').value);
  const refundAmount = Math.round((origAmt * percent) / 100);

  if (!guestId) {
    alert('Please select a booking to cancel.');
    return;
  }

  window.cancellationService.submitRequest({
    guestId,
    invoiceNumber,
    guestName,
    reason,
    refundPercentage: percent,
    refundAmount
  });

  document.getElementById('modalRequestCancellation').classList.add('hidden');
  if (window.app) {
    window.app.toast('Cancellation request submitted for Leadership approval.', 'info');
  }
}
window.handleCancellationSubmit = handleCancellationSubmit;

// Global Cancellation Service Instance
window.cancellationService = new HarrisCancellationService();
