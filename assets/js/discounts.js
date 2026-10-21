/**
 * Harris Ijen Admin Company Portal - Discount Management & Approval Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Requirements:
 * 3. Discount requests require approval from an administrator or company management.
 * 5. A dedicated field is provided for employees to request discounts on guest bookings;
 *    this process requires uploading proof of payment (as an image) and the payment reference number into the system.
 */

class HarrisDiscountService {
  constructor() {
    this.currentProofBase64 = null;
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    // Listen for database changes to re-render
    window.addEventListener('harris_db_updated', () => {
      this.updateBadges();
      if (window.app && window.app.currentTab === 'discounts') {
        this.renderTable();
      }
    });

    // File input listener for proof of payment
    const proofInput = document.getElementById('discProofInput');
    if (proofInput) {
      proofInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, WebP) for proof of payment.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.currentProofBase64 = evt.target.result;
            const preview = document.getElementById('discProofPreview');
            const previewImg = document.getElementById('discProofPreviewImg');
            if (preview && previewImg) {
              previewImg.src = this.currentProofBase64;
              preview.classList.remove('hidden');
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  updateBadges() {
    if (!window.db) return;
    const pendingCount = window.db.getPendingDiscountsCount();
    const badge = document.getElementById('badgeDiscountCount');
    if (badge) {
      badge.innerText = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    }
  }

  renderTable() {
    const tbody = document.getElementById('discountsTableBody');
    if (!tbody || !window.db) return;

    const discounts = window.db.getDiscounts();
    const canApprove = window.auth && window.auth.canApproveDiscount();

    this.updateBadges();

    if (discounts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-10 text-slate-400">
            <i class="fa-solid fa-tags text-3xl mb-2 block text-slate-300"></i>
            No discount requests recorded yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = discounts.map(d => {
      const statusBadge = this.getStatusBadge(d.status);
      const guest = window.db.getGuestById(d.guestId) || window.db.getGuestByInvoice(d.invoiceNumber);

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-xs">
          <td class="py-3 px-4 font-mono font-bold text-blue-700">
            ${d.id}
            <div class="text-[10px] text-slate-400 font-sans">${new Date(d.requestedAt).toLocaleDateString('en-GB')}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">${d.guestName}</div>
            <div class="text-[11px] font-mono text-blue-600">${d.invoiceNumber}</div>
          </td>
          <td class="py-3 px-4 font-mono">
            <div class="text-slate-400 line-through text-[11px]">IDR ${Number(d.originalAmount).toLocaleString('id-ID')}</div>
            <div class="font-bold text-emerald-700">IDR ${Number(d.finalAmount).toLocaleString('id-ID')}</div>
            <div class="text-[10px] text-amber-600 font-semibold">Disc: -IDR ${Number(d.discountAmount).toLocaleString('id-ID')} (${d.discountType === 'percentage' ? d.discountValue + '%' : 'Fixed'})</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block mb-1">
              ${d.paymentRefNumber || '-'}
            </div>
            <div class="text-[11px] text-slate-500 truncate max-w-[150px]" title="${d.reason}">
              ${d.reason}
            </div>
          </td>
          <td class="py-3 px-4">
            ${d.paymentProofImage ? `
              <button onclick="window.fileVaultService.openLightbox('${d.paymentProofImage}', 'Proof of Payment - ${d.paymentRefNumber}', 'Ref: ${d.paymentRefNumber} | Guest: ${d.guestName}')" class="group relative inline-block rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:ring-2 hover:ring-blue-500 transition">
                <img src="${d.paymentProofImage}" alt="Proof" class="w-12 h-12 object-cover">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs">
                  <i class="fa-solid fa-magnifying-glass-plus"></i>
                </div>
              </button>
            ` : `
              <span class="text-slate-400 text-[11px] italic">No proof attached</span>
            `}
          </td>
          <td class="py-3 px-4">
            <div class="font-medium text-slate-800">${d.requestedBy}</div>
            ${d.approvedBy ? `<div class="text-[10px] text-slate-500 mt-0.5">Approved by: ${d.approvedBy}</div>` : ''}
          </td>
          <td class="py-3 px-4">
            ${statusBadge}
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end space-x-1.5">
              ${d.status === 'Pending Approval' && canApprove ? `
                <button onclick="window.discountService.openApprovalModal('${d.id}')" class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center space-x-1">
                  <i class="fa-solid fa-stamp mr-1"></i> Review & Approve
                </button>
              ` : `
                <button onclick="window.discountService.viewDiscountDetail('${d.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition">
                  <i class="fa-solid fa-circle-info mr-1"></i> Details
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  getStatusBadge(status) {
    if (status === 'Approved') {
      return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><i class="fa-solid fa-check-circle mr-1 text-[10px]"></i> Approved</span>';
    } else if (status === 'Rejected') {
      return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><i class="fa-solid fa-circle-xmark mr-1 text-[10px]"></i> Rejected</span>';
    }
    return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"><i class="fa-solid fa-clock mr-1 text-[10px]"></i> Pending Approval</span>';
  }

  // Open the Discount Request Form (Requirement 5)
  openRequestModal(preselectedGuestId = null) {
    const modal = document.getElementById('modalRequestDiscount');
    const select = document.getElementById('discGuestSelect');
    if (!modal || !select || !window.db) return;

    this.currentProofBase64 = null;
    const preview = document.getElementById('discProofPreview');
    if (preview) preview.classList.add('hidden');
    document.getElementById('discProofInput').value = '';
    document.getElementById('discReason').value = '';
    document.getElementById('discPaymentRef').value = '';

    // Populate guest dropdown
    const guests = window.db.getGuests();
    select.innerHTML = '<option value="">-- Choose Traveler / Reservation --</option>' + guests.map(g => `
      <option value="${g.id}" ${g.id === preselectedGuestId ? 'selected' : ''}>
        ${g.guestName} (${g.invoiceNumber}) - IDR ${Number(g.paymentAmount).toLocaleString('id-ID')}
      </option>
    `).join('');

    if (preselectedGuestId) {
      this.onGuestSelected(preselectedGuestId);
    } else {
      document.getElementById('discOrigAmountDisplay').innerText = 'IDR 0';
      document.getElementById('discFinalAmountDisplay').innerText = 'IDR 0';
      document.getElementById('discCalculatedDeduction').innerText = 'IDR 0';
    }

    modal.classList.remove('hidden');
  }

  onGuestSelected(guestId) {
    const guest = window.db.getGuestById(guestId);
    if (!guest) return;

    const origAmt = Number(guest.originalAmount || guest.paymentAmount);
    document.getElementById('discOrigAmountDisplay').innerText = `IDR ${origAmt.toLocaleString('id-ID')}`;
    document.getElementById('discOrigAmountInput').value = origAmt;
    document.getElementById('discInvoiceNoInput').value = guest.invoiceNumber;
    document.getElementById('discGuestNameInput').value = guest.guestName;

    this.recalculateDiscount();
  }

  recalculateDiscount() {
    const origAmt = Number(document.getElementById('discOrigAmountInput').value) || 0;
    const type = document.getElementById('discTypeSelect').value;
    const val = Number(document.getElementById('discValueInput').value) || 0;

    let discountAmt = 0;
    if (type === 'percentage') {
      discountAmt = Math.round((origAmt * val) / 100);
    } else {
      discountAmt = val;
    }

    discountAmt = Math.min(discountAmt, origAmt);
    const finalAmt = Math.max(0, origAmt - discountAmt);

    document.getElementById('discCalculatedDeduction').innerText = `- IDR ${discountAmt.toLocaleString('id-ID')}`;
    document.getElementById('discFinalAmountDisplay').innerText = `IDR ${finalAmt.toLocaleString('id-ID')}`;
  }

  // Handle Discount Request Submission (Requires proof image & payment reference number)
  handleRequestSubmit(e) {
    e.preventDefault();

    const guestId = document.getElementById('discGuestSelect').value;
    const invoiceNumber = document.getElementById('discInvoiceNoInput').value;
    const guestName = document.getElementById('discGuestNameInput').value;
    const origAmt = Number(document.getElementById('discOrigAmountInput').value);
    const type = document.getElementById('discTypeSelect').value;
    const val = Number(document.getElementById('discValueInput').value);
    const paymentRef = document.getElementById('discPaymentRef').value.trim();
    const reason = document.getElementById('discReason').value.trim();

    if (!guestId) {
      alert('Please select a guest reservation.');
      return;
    }

    if (!paymentRef) {
      alert('Payment Reference Number is mandatory for discount requests.');
      return;
    }

    if (!this.currentProofBase64) {
      alert('Please upload an image showing the proof of payment / transfer receipt.');
      return;
    }

    let discountAmt = (type === 'percentage') ? Math.round((origAmt * val) / 100) : val;
    discountAmt = Math.min(discountAmt, origAmt);

    const currentUser = window.auth ? window.auth.getUser() : null;
    const requesterName = currentUser ? `${currentUser.fullName} (${currentUser.employeeNumber})` : 'Operations Staff';

    const newReq = window.db.requestDiscount({
      guestId,
      invoiceNumber,
      guestName,
      discountType: type,
      discountValue: val,
      discountAmount: discountAmt,
      paymentRefNumber: paymentRef,
      proofImage: this.currentProofBase64,
      reason: reason,
      requestedBy: requesterName
    });

    if (window.auth && currentUser) {
      window.db.logActivity({
        username: currentUser.username,
        fullName: currentUser.fullName,
        role: `${currentUser.position} (${currentUser.employeeNumber})`,
        action: `Requested Discount (${discountAmt.toLocaleString('id-ID')} IDR) for ${guestName} #${invoiceNumber}`,
        status: 'Success'
      });
    }

    document.getElementById('modalRequestDiscount').classList.add('hidden');
    if (window.app) {
      window.app.toast(`Discount request ${newReq.id} submitted for Leadership Approval!`, 'success');
      this.renderTable();
    }
  }

  // Open Approval Modal (For Director / Admin)
  openApprovalModal(discountId) {
    const d = window.db.getDiscountById(discountId);
    if (!d) return;

    const modal = document.getElementById('modalApproveDiscount');
    const container = document.getElementById('approveDiscountContent');
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="space-y-4 text-xs">
        <!-- Header Info -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span class="font-bold text-amber-900 text-sm">Reviewing Discount Request: ${d.id}</span>
            <div class="text-[11px] text-amber-700">Submitted by ${d.requestedBy} on ${new Date(d.requestedAt).toLocaleString('en-GB')}</div>
          </div>
          <span class="badge badge-pending">Pending Approval</span>
        </div>

        <!-- Reservation & Financial Summary -->
        <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <div class="text-slate-500 font-semibold mb-0.5">Guest & Booking:</div>
            <div class="font-bold text-slate-900 text-sm">${d.guestName}</div>
            <div class="font-mono text-blue-600 font-semibold">${d.invoiceNumber}</div>
          </div>
          <div>
            <div class="text-slate-500 font-semibold mb-0.5">Price Adjustment:</div>
            <div class="text-slate-400 line-through">Orig: IDR ${Number(d.originalAmount).toLocaleString('id-ID')}</div>
            <div class="text-amber-700 font-bold">Discount: -IDR ${Number(d.discountAmount).toLocaleString('id-ID')} (${d.discountType === 'percentage' ? d.discountValue + '%' : 'Fixed'})</div>
            <div class="text-emerald-700 font-extrabold text-sm">Revised Total: IDR ${Number(d.finalAmount).toLocaleString('id-ID')}</div>
          </div>
        </div>

        <!-- Mandatory Payment Reference -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div class="text-blue-900 font-bold mb-1 flex items-center">
            <i class="fa-solid fa-receipt mr-1.5 text-blue-600"></i> Payment Reference Number:
          </div>
          <div class="font-mono font-bold text-sm text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-100 inline-block">
            ${d.paymentRefNumber}
          </div>
          <div class="text-[11px] text-blue-700 mt-1">
            <strong>Employee Justification:</strong> "${d.reason}"
          </div>
        </div>

        <!-- Proof of Payment Image with Lightbox Preview -->
        <div>
          <div class="font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Uploaded Proof of Payment (Image):</span>
            <span class="text-[11px] text-blue-600 cursor-pointer hover:underline" onclick="window.fileVaultService.openLightbox('${d.paymentProofImage}', 'Proof of Payment - ${d.paymentRefNumber}', 'Ref: ${d.paymentRefNumber}')">
              <i class="fa-solid fa-up-right-and-down-left-from-center mr-1"></i> View Full Resolution
            </span>
          </div>
          <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 max-h-56 flex items-center justify-center p-2 cursor-pointer group" onclick="window.fileVaultService.openLightbox('${d.paymentProofImage}', 'Proof of Payment - ${d.paymentRefNumber}', 'Ref: ${d.paymentRefNumber}')">
            <img src="${d.paymentProofImage}" alt="Proof" class="max-h-52 object-contain group-hover:scale-105 transition duration-200">
          </div>
        </div>

        <!-- Manager Review Notes -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Company Leadership / Administrator Review Notes:</label>
          <textarea id="approveDiscountNotes" rows="2" placeholder="e.g. Authorized under Autumn Early Bird Campaign, verified bank settlement." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
          <button type="button" onclick="document.getElementById('modalApproveDiscount').classList.add('hidden')" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
            Close
          </button>
          <button type="button" onclick="window.discountService.executeReject('${d.id}')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition">
            <i class="fa-solid fa-xmark mr-1"></i> Reject Request
          </button>
          <button type="button" onclick="window.discountService.executeApprove('${d.id}')" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition">
            <i class="fa-solid fa-check-double mr-1"></i> Approve & Apply Discount
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  executeApprove(discountId) {
    const notes = document.getElementById('approveDiscountNotes')?.value || 'Approved by Company Management';
    const currentUser = window.auth ? window.auth.getUser() : null;
    const managerName = currentUser ? `${currentUser.fullName} (${currentUser.employeeNumber})` : 'MUHAMAD ABDUL HARIS, S.H., LL.M';

    const res = window.db.approveDiscount(discountId, managerName, notes);
    if (res) {
      if (window.auth && currentUser) {
        window.db.logActivity({
          username: currentUser.username,
          fullName: currentUser.fullName,
          role: `${currentUser.position} (${currentUser.employeeNumber})`,
          action: `Approved Discount ${res.id} for ${res.guestName} (-IDR ${res.discountAmount.toLocaleString('id-ID')})`,
          status: 'Success'
        });
      }

      document.getElementById('modalApproveDiscount').classList.add('hidden');
      if (window.app) {
        window.app.toast(`Discount ${discountId} APPROVED and updated across Google Drive DB!`, 'success');
        this.renderTable();
        window.app.renderGuestsTable();
        window.app.updateStatsCounters();
      }
    }
  }

  executeReject(discountId) {
    const notes = document.getElementById('approveDiscountNotes')?.value || 'Rejected by Company Management';
    const currentUser = window.auth ? window.auth.getUser() : null;
    const managerName = currentUser ? `${currentUser.fullName} (${currentUser.employeeNumber})` : 'MUHAMAD ABDUL HARIS, S.H., LL.M';

    const res = window.db.rejectDiscount(discountId, managerName, notes);
    if (res) {
      if (window.auth && currentUser) {
        window.db.logActivity({
          username: currentUser.username,
          fullName: currentUser.fullName,
          role: `${currentUser.position} (${currentUser.employeeNumber})`,
          action: `Rejected Discount ${res.id} for ${res.guestName}`,
          status: 'Success'
        });
      }

      document.getElementById('modalApproveDiscount').classList.add('hidden');
      if (window.app) {
        window.app.toast(`Discount request ${discountId} was REJECTED.`, 'info');
        this.renderTable();
        window.app.renderGuestsTable();
      }
    }
  }

  viewDiscountDetail(discountId) {
    this.openApprovalModal(discountId);
  }
}

// Global Singleton Instance
window.discountService = new HarrisDiscountService();
