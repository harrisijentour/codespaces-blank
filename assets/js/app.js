/**
 * Harris Ijen Admin Company Portal - Main Application Coordinator
 * PT HARRIS IJEN JAYA MANDIRI
 * Integrates Guests, Discounts, File Vault, Invoices, Scanner, Cancellations, Reviews, and Blogspot.
 */

class HarrisPortalApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.globalSearchQuery = '';
    this.editingGuestId = null;
    this.primaryPassportBase64 = null;
    this.extraPassengers = [];
    this.isEmbedded = window.location.search.includes('embed=true') || window.location.hash.includes('embed') || window !== window.parent;
  }

  init() {
    this.setupEventListeners();
    this.checkAuthenticationState();
    this.renderCurrentView();
    this.updateStatsCounters();

    if (this.isEmbedded) {
      document.body.classList.add('is-embedded-portal');
      this.initEmbeddedResizeNotifier();
    }

    // Auto-update review dashboard if service ready
    if (window.reviewsService) {
      window.reviewsService.renderDashboard();
    }
  }

  initEmbeddedResizeNotifier() {
    const notifyParent = () => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.getElementById('mainContentContainer')?.scrollHeight || 750
      );
      try {
        window.parent.postMessage({ type: 'HARRIS_PORTAL_RESIZE', height: height }, '*');
      } catch (e) {}
    };

    window.addEventListener('resize', notifyParent);
    window.addEventListener('harris_db_updated', () => setTimeout(notifyParent, 150));
    setTimeout(notifyParent, 300);
    setTimeout(notifyParent, 1200);
  }

  setupEventListeners() {
    window.addEventListener('harris_db_updated', () => {
      this.updateStatsCounters();
      this.renderCurrentView();
    });

    window.addEventListener('harris_auth_changed', (e) => {
      this.checkAuthenticationState();
    });

    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleGlobalSearch(e.target.value);
      });
    }

    // Modal background close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      });
    });

    // Primary Passport Photo Input
    const passportPhotoInput = document.getElementById('inputPassportPhoto');
    if (passportPhotoInput) {
      passportPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.primaryPassportBase64 = evt.target.result;
            const preview = document.getElementById('passportPhotoPreview');
            const previewImg = document.getElementById('passportPhotoPreviewImg');
            if (preview && previewImg) {
              previewImg.src = this.primaryPassportBase64;
              preview.classList.remove('hidden');
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Dynamic Number of People (Pax) selector listener
    const paxInput = document.getElementById('inputNumberOfPeople');
    if (paxInput) {
      paxInput.addEventListener('change', (e) => {
        this.updatePassengerRows(parseInt(e.target.value) || 1);
      });
    }
  }

  /**
   * REQUIREMENT 4:
   * The top-left corner shall display an avatar along with the employee
   * or company administrator's ID information
   * (linked data: https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html).
   */
  checkAuthenticationState() {
    const isLoggedIn = window.auth && window.auth.isLoggedIn();
    const user = isLoggedIn ? window.auth.getUser() : null;

    const loginSection = document.getElementById('loginModal');
    const topLeftProfileSection = document.getElementById('sidebarUserProfile');
    const headerUserDisplay = document.getElementById('headerUserBadge');
    const mobileTopLeftSection = document.getElementById('mobileTopLeftProfile');

    const navFinance = document.getElementById('navItem_finance');
    const navAudit = document.getElementById('navItem_audit');
    const navDiscounts = document.getElementById('navItem_discounts');
    const navFiles = document.getElementById('navItem_files');

    const officialDirectoryUrl = 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html';

    if (isLoggedIn && user) {
      if (loginSection) loginSection.classList.add('hidden');

      // 1. Desktop Top-Left Profile in Sidebar
      if (topLeftProfileSection) {
        topLeftProfileSection.innerHTML = `
          <div class="p-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center space-x-3">
              <div class="relative flex-shrink-0">
                <img src="${user.avatar}" alt="${user.fullName}" class="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200">
                <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-extrabold text-xs text-slate-900 leading-tight truncate" title="${user.fullName}">${user.fullName}</div>
                <div class="text-[11px] font-bold text-blue-700 tracking-tight truncate">${user.position}</div>
                <div class="text-[10px] font-mono font-semibold text-slate-500 mt-0.5 truncate">
                  ID: <span class="text-slate-800 font-bold">${user.employeeNumber}</span>
                </div>
              </div>
              <button onclick="app.handleLogout()" class="text-slate-400 hover:text-rose-600 transition p-1" title="Log Out of Portal">
                <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              </button>
            </div>
            <!-- Official Employee Directory Link -->
            <div class="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <a href="${officialDirectoryUrl}" target="_blank" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1" title="Verify ID on Official PT Harris Ijen Jaya Mandiri Employee Directory">
                <i class="fa-solid fa-shield-halved text-[10px]"></i>
                <span>Official ID Directory</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
              </a>
              <span class="text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Verified</span>
            </div>
          </div>
        `;
      }

      // 2. Mobile Top-Left Header Display
      if (mobileTopLeftSection) {
        mobileTopLeftSection.innerHTML = `
          <div class="flex items-center space-x-2">
            <img src="${user.avatar}" alt="${user.fullName}" class="w-8 h-8 rounded-lg object-cover border border-slate-200">
            <div class="leading-none text-left">
              <div class="font-bold text-xs text-slate-900 truncate max-w-[120px]">${user.fullName.split(',')[0]}</div>
              <a href="${officialDirectoryUrl}" target="_blank" class="text-[10px] font-mono font-bold text-blue-600">
                ${user.employeeNumber} <i class="fa-solid fa-arrow-up-right-from-square text-[7px]"></i>
              </a>
            </div>
          </div>
        `;
      }

      // 3. Top Header User Badge (with quick switch / logout)
      if (headerUserDisplay) {
        headerUserDisplay.innerHTML = `
          <div class="flex items-center space-x-2">
            <a href="${officialDirectoryUrl}" target="_blank" class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition" title="Open Official Directory">
              <i class="fa-solid fa-id-badge mr-1.5 text-blue-600"></i> ${user.employeeNumber}
            </a>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              <i class="fa-solid fa-user-tie mr-1 text-slate-600"></i> ${user.roleLabel.split('(')[0]}
            </span>
          </div>
        `;
      }

      // Role-dependent menu tabs
      if (navFinance) navFinance.style.display = window.auth.canAccessFinance() ? 'flex' : 'none';
      if (navAudit) navAudit.style.display = window.auth.canAccessAuditLogs() ? 'flex' : 'none';
      if (navDiscounts) navDiscounts.style.display = 'flex';
      if (navFiles) navFiles.style.display = 'flex';

    } else {
      if (loginSection) loginSection.classList.remove('hidden');

      if (topLeftProfileSection) {
        topLeftProfileSection.innerHTML = `
          <button onclick="app.showLoginModal()" class="w-full py-2.5 px-3 bg-brand-navy hover:bg-brand-blue text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2">
            <i class="fa-solid fa-lock"></i>
            <span>Log In via User ID</span>
          </button>
        `;
      }

      if (mobileTopLeftSection) {
        mobileTopLeftSection.innerHTML = `
          <button onclick="app.showLoginModal()" class="text-xs font-bold text-blue-600">
            <i class="fa-solid fa-lock mr-1"></i> Log In
          </button>
        `;
      }

      if (headerUserDisplay) {
        headerUserDisplay.innerHTML = `
          <button onclick="app.showLoginModal()" class="text-xs font-bold text-blue-600 hover:underline">
            <i class="fa-solid fa-user-shield mr-1"></i> Staff Login
          </button>
        `;
      }

      if (navFinance) navFinance.style.display = 'none';
      if (navAudit) navAudit.style.display = 'none';
    }
  }

  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('hidden');
  }

  handleLogin(e) {
    if (e) e.preventDefault();
    const u = document.getElementById('loginUsername')?.value;
    const p = document.getElementById('loginPassword')?.value;
    const rem = document.getElementById('loginRememberMe')?.checked;

    if (!u || !p) {
      alert('Please enter your User ID or Employee Number and Password.');
      return;
    }

    const res = window.auth.login(u, p, rem);
    if (res.success) {
      document.getElementById('loginModal')?.classList.add('hidden');
      this.toast(`Welcome back, ${res.user.fullName}!`, 'success');
      this.renderCurrentView();
    } else {
      alert(res.message);
    }
  }

  quickDemoLogin(identifier) {
    const res = window.auth.login(identifier, 'password123', true);
    if (res.success) {
      document.getElementById('loginModal')?.classList.add('hidden');
      this.toast(`Logged in as ${res.user.fullName} (${res.user.position})`, 'success');
      this.renderCurrentView();
    } else {
      alert(res.message);
    }
  }

  handleLogout() {
    if (confirm('Are you sure you want to log out of Harris Ijen Admin Company Portal?')) {
      window.auth.logout();
      this.toast('You have successfully logged out.', 'info');
      this.switchTab('dashboard');
    }
  }

  switchTab(tabName) {
    if (tabName === 'finance' && (!window.auth || !window.auth.canAccessFinance())) {
      alert('Access Restricted: Only Company Leadership or Administrators can view financial ledgers.');
      return;
    }
    if (tabName === 'audit' && (!window.auth || !window.auth.canAccessAuditLogs())) {
      alert('Access Restricted: Only Company Leadership or Administrators can view login audit activity.');
      return;
    }

    this.currentTab = tabName;

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    const activeNav = document.getElementById(`navItem_${tabName}`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.add('hidden');
    });
    const targetView = document.getElementById(`view_${tabName}`);
    if (targetView) targetView.classList.remove('hidden');

    document.getElementById('sidebar')?.classList.add('-translate-x-full');

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView() {
    switch (this.currentTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'guests':
        this.renderGuestsTable();
        break;
      case 'discounts':
        if (window.discountService) window.discountService.renderTable();
        break;
      case 'files':
        if (window.fileVaultService) window.fileVaultService.renderVault();
        break;
      case 'invoices':
        this.renderInvoicesView();
        break;
      case 'scanner':
        break;
      case 'cancellations':
        if (window.cancellationService) window.cancellationService.renderTable();
        break;
      case 'finance':
        if (window.financeService) window.financeService.renderModule();
        break;
      case 'reviews':
        if (window.reviewsService) window.reviewsService.renderDashboard();
        break;
      case 'audit':
        if (window.auditService) window.auditService.renderModule();
        break;
      case 'blogspot':
        if (window.blogspotService) {
          window.blogspotService.updatePreview();
          window.blogspotService.updateEmbedCodeInputs();
        }
        break;
    }
  }

  updateStatsCounters() {
    if (!window.db) return;
    const guests = window.db.getGuests();
    const cancellations = window.db.getCancellations();
    const discounts = window.db.getDiscounts();
    const reviews = window.db.getReviews();
    const files = window.db.getAllUploadedFiles();
    const fin = window.db.getFinancialSummary();

    // Discount badge
    const discountBadge = document.getElementById('badgeDiscountCount');
    const pendingDiscounts = discounts.filter(d => d.status === 'Pending Approval').length;
    if (discountBadge) {
      discountBadge.innerText = pendingDiscounts;
      discountBadge.style.display = pendingDiscounts > 0 ? 'inline-flex' : 'none';
    }

    // Cancellation badge
    const cancelBadge = document.getElementById('badgeCancelCount');
    const pendingCancels = cancellations.filter(c => c.status === 'Pending Approval').length;
    if (cancelBadge) {
      cancelBadge.innerText = pendingCancels;
      cancelBadge.style.display = pendingCancels > 0 ? 'inline-flex' : 'none';
    }

    // Files count badge
    const filesBadge = document.getElementById('badgeFilesCount');
    if (filesBadge) {
      filesBadge.innerText = files.length;
    }

    // Review badge
    const reviewBadge = document.getElementById('badgeReviewCount');
    if (reviewBadge) {
      reviewBadge.innerText = reviews.length;
    }

    // Dashboard top KPI cards
    const dGuests = document.getElementById('dashTotalGuests');
    const dRev = document.getElementById('dashGrossRevenue');
    const dRating = document.getElementById('dashAvgRating');
    const dPendingRefunds = document.getElementById('dashPendingRefunds');
    const dPendingDiscounts = document.getElementById('dashPendingDiscounts');

    if (dGuests) dGuests.innerText = guests.length;
    if (dRev) dRev.innerText = 'IDR ' + (fin.grossIncome / 1000000).toFixed(1) + 'M';
    if (dRating) {
      const m = window.db.getReviewMetrics();
      dRating.innerText = m.averageRating.toFixed(1);
    }
    if (dPendingRefunds) dPendingRefunds.innerText = pendingCancels;
    if (dPendingDiscounts) dPendingDiscounts.innerText = pendingDiscounts;
  }

  renderDashboard() {
    const tbody = document.getElementById('dashRecentBookingsBody');
    if (!tbody || !window.db) return;

    const guests = window.db.getGuests().slice(0, 5);
    tbody.innerHTML = guests.map(g => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-xs">
        <td class="py-3 px-4 font-mono font-semibold text-blue-600">${g.invoiceNumber}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900 flex items-center space-x-1.5">
            <span>${g.guestName}</span>
            <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">${g.gender || 'Male'}</span>
          </div>
          <div class="text-[11px] text-slate-500">${g.country} • ${g.phone} • ${g.numberOfPeople || 1} Pax</div>
        </td>
        <td class="py-3 px-4 font-medium text-slate-800">${g.tourPackageName}</td>
        <td class="py-3 px-4 font-bold text-slate-900">
          IDR ${Number(g.paymentAmount).toLocaleString('id-ID')}
          ${g.discountAmount ? `<span class="block text-[10px] text-amber-600 font-normal">Disc: -IDR ${Number(g.discountAmount).toLocaleString('id-ID')}</span>` : ''}
        </td>
        <td class="py-3 px-4">
          <span class="badge ${this.getBadgeClass(g.paymentStatus)}">${g.paymentStatus}</span>
        </td>
        <td class="py-3 px-4 text-slate-600">
          <div class="font-semibold text-slate-800">Drop-off: ${(g.finalDropOffLocation || 'Airport').substring(0, 18)}</div>
          <div class="text-[11px] text-slate-500">Pick: ${g.pickupTime}</div>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="app.generateAndDownloadInvoice('${g.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition" title="Generate Invoice PDF">
            <i class="fa-solid fa-file-pdf text-rose-600 mr-1"></i> PDF
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Render Full Guests Table (Requirement 2 & 6)
  renderGuestsTable(filteredList = null) {
    const tbody = document.getElementById('guestsTableBody');
    if (!tbody || !window.db) return;

    const guests = filteredList || window.db.getGuests();
    const countEl = document.getElementById('guestsCountDisplay');
    if (countEl) countEl.innerText = `Showing ${guests.length} registered reservations`;

    if (guests.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-10 text-slate-400">
            <i class="fa-solid fa-users-slash text-3xl mb-2 block"></i>
            No guests found matching search criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = guests.map(g => {
      const hasFiles = g.passportPhoto || g.paymentProofImage;

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-xs">
          <td class="py-3 px-4 font-mono font-bold text-blue-700">
            ${g.invoiceNumber}
            <div class="text-[10px] text-slate-400 font-sans">${new Date(g.createdAt || Date.now()).toLocaleDateString('en-GB')}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <span>${g.guestName}</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${g.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}">
                ${g.gender || 'Male'}
              </span>
            </div>
            <div class="text-slate-500 text-[11px] flex items-center space-x-1 mt-0.5">
              <i class="fa-regular fa-envelope"></i> <span>${g.email}</span>
              <span>•</span>
              <i class="fa-solid fa-phone text-[10px]"></i> <span>${g.phone}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center space-x-1">
              <span class="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                ${g.country}
              </span>
              <span class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                ${g.numberOfPeople || 1} Pax
              </span>
            </div>
            <div class="text-[11px] font-mono text-slate-600 mt-0.5">PP: <strong>${g.passportNumber || '-'}</strong></div>
          </td>
          <td class="py-3 px-4 font-medium text-slate-800 max-w-[180px] truncate" title="${g.tourPackageName}">
            ${g.tourPackageName}
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">IDR ${Number(g.paymentAmount).toLocaleString('id-ID')}</div>
            ${g.discountAmount ? `<div class="text-[10px] text-amber-600 font-bold">Disc: -IDR ${Number(g.discountAmount).toLocaleString('id-ID')}</div>` : ''}
            <div class="text-[10px] text-slate-500">${g.paymentMethod} • <span class="text-slate-700">${g.paymentLocation || 'HQ'}</span></div>
          </td>
          <td class="py-3 px-4">
            <span class="badge ${this.getBadgeClass(g.paymentStatus)}">${g.paymentStatus}</span>
            ${g.discountStatus === 'Pending Approval' ? `<span class="block text-[9px] font-bold text-amber-700 mt-1 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">Discount Pending</span>` : ''}
          </td>
          <td class="py-3 px-4 text-slate-700">
            <div class="text-[11px] font-semibold text-slate-800 max-w-[130px] truncate" title="${g.pickupLocation}">
              <i class="fa-solid fa-car text-[10px] text-blue-600 mr-0.5"></i> ${g.pickupLocation} (${g.pickupTime})
            </div>
            <div class="text-[11px] font-semibold text-emerald-700 max-w-[130px] truncate mt-0.5" title="${g.finalDropOffLocation || 'Airport'}">
              <i class="fa-solid fa-location-dot text-[10px] text-emerald-600 mr-0.5"></i> ${g.finalDropOffLocation || 'Banyuwangi Airport'}
            </div>
          </td>
          <!-- Uploaded Files Indicator (Requirement 6) -->
          <td class="py-3 px-4 text-center">
            ${hasFiles ? `
              <button onclick="window.fileVaultService.openGuestFilesModal('${g.id}')" class="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition border border-blue-200" title="View Guest Passport Photos & Uploaded Files">
                <i class="fa-solid fa-image"></i>
                <span>Files</span>
              </button>
            ` : `
              <span class="text-slate-400 text-[11px] italic">None</span>
            `}
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end space-x-1">
              <button onclick="app.generateAndDownloadInvoice('${g.id}')" class="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition" title="Download Official PDF Invoice">
                <i class="fa-solid fa-file-pdf"></i>
              </button>
              <button onclick="app.previewInvoiceModal('${g.id}')" class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="Preview E-Invoice & Electronic Signature">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button onclick="window.discountService.openRequestModal('${g.id}')" class="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition" title="Request Discount on this Booking (Upload Proof)">
                <i class="fa-solid fa-percent"></i>
              </button>
              <button onclick="app.openEditGuestModal('${g.id}')" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition" title="Edit Booking Details">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  getBadgeClass(status) {
    if (!status) return 'badge-pending';
    if (status.includes('Paid')) return 'badge-paid';
    if (status.includes('Deposit') || status.includes('Partial')) return 'badge-partial';
    if (status.includes('Refunded')) return 'badge-refunded';
    if (status.includes('Refund Requested')) return 'badge-refund-requested';
    return 'badge-pending';
  }

  handleGlobalSearch(query) {
    this.globalSearchQuery = query;
    const dropdown = document.getElementById('searchDropdownResults');
    if (!dropdown || !window.db) return;

    if (!query || query.trim().length === 0) {
      dropdown.classList.add('hidden');
      return;
    }

    const matches = window.db.searchGuests(query).slice(0, 6);
    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div class="p-3 text-xs text-slate-400 text-center">
          No traveler or invoice found matching "${query}"
        </div>
      `;
    } else {
      dropdown.innerHTML = matches.map(m => `
        <div onclick="app.jumpToGuest('${m.id}')" class="p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between text-xs">
          <div>
            <span class="font-bold text-slate-900">${m.guestName}</span>
            <span class="text-[11px] text-slate-500 ml-1 font-mono">${m.invoiceNumber}</span>
            <div class="text-[11px] text-slate-400">${m.country} • ${m.tourPackageName}</div>
          </div>
          <span class="badge ${this.getBadgeClass(m.paymentStatus)}">${m.paymentStatus}</span>
        </div>
      `).join('');
    }
    dropdown.classList.remove('hidden');
  }

  jumpToGuest(guestId) {
    document.getElementById('searchDropdownResults')?.classList.add('hidden');
    this.switchTab('guests');
    const guest = window.db.getGuestById(guestId);
    if (guest) {
      this.renderGuestsTable([guest]);
      this.toast(`Focused reservation: ${guest.guestName} (${guest.invoiceNumber})`, 'info');
    }
  }

  // --- Dynamic Passenger Rows for Multi-Pax Reservations (Requirement 2) ---
  updatePassengerRows(paxCount) {
    const container = document.getElementById('extraPassengersContainer');
    if (!container) return;

    if (paxCount <= 1) {
      container.innerHTML = '';
      return;
    }

    let rowsHtml = `
      <div class="mt-3 pt-3 border-t border-slate-200">
        <h4 class="font-bold text-xs text-slate-700 mb-2 flex items-center">
          <i class="fa-solid fa-users-rectangle text-blue-600 mr-1.5"></i>
          Additional Passengers Details (Pax 2 to ${paxCount}):
        </h4>
        <div class="space-y-3">
    `;

    for (let i = 2; i <= paxCount; i++) {
      rowsHtml += `
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div class="font-bold text-blue-800 text-[11px]">Passenger #${i}:</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label class="block font-semibold text-slate-600 mb-0.5">Full Name *:</label>
              <input type="text" id="passengerName_${i}" required placeholder="Passenger ${i} Full Name" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-0.5">Gender *:</label>
              <select id="passengerGender_${i}" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-0.5">Passport Number *:</label>
              <input type="text" id="passengerPassport_${i}" required placeholder="Passport No" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-mono">
            </div>
          </div>
        </div>
      `;
    }

    rowsHtml += `</div></div>`;
    container.innerHTML = rowsHtml;
  }

  openNewGuestModal() {
    this.editingGuestId = null;
    this.primaryPassportBase64 = null;
    document.getElementById('guestForm').reset();
    document.getElementById('guestModalTitle').innerText = 'Input Guest Data & Reservation';

    // Auto-generate invoice number
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const seq = String(window.db.getGuests().length + 1).padStart(3, '0');
    document.getElementById('inputInvoiceNumber').value = `INV/HIJ/${y}/${m}/${seq}`;

    // Reset Pax and additional passenger rows
    document.getElementById('inputNumberOfPeople').value = '1';
    this.updatePassengerRows(1);

    const preview = document.getElementById('passportPhotoPreview');
    if (preview) preview.classList.add('hidden');

    document.getElementById('guestInputModal').classList.remove('hidden');
  }

  openEditGuestModal(guestId) {
    const guest = window.db.getGuestById(guestId);
    if (!guest) return;

    this.editingGuestId = guestId;
    document.getElementById('guestModalTitle').innerText = `Edit Reservation: ${guest.guestName}`;

    document.getElementById('inputGuestName').value = guest.guestName;
    document.getElementById('inputGender').value = guest.gender || 'Male';
    document.getElementById('inputNumberOfPeople').value = guest.numberOfPeople || 1;
    document.getElementById('inputCountry').value = guest.country;
    document.getElementById('inputPhone').value = guest.phone;
    document.getElementById('inputEmail').value = guest.email;
    document.getElementById('inputPassport').value = guest.passportNumber;
    document.getElementById('inputInvoiceNumber').value = guest.invoiceNumber;
    document.getElementById('inputTourPackage').value = guest.tourPackageName;
    document.getElementById('inputPaymentAmount').value = guest.paymentAmount;
    document.getElementById('inputPaymentMethod').value = guest.paymentMethod;
    document.getElementById('inputPaymentStatus').value = guest.paymentStatus;
    document.getElementById('inputPaymentLocation').value = guest.paymentLocation || 'Banyuwangi HQ Office';
    document.getElementById('inputArrivalTime').value = guest.arrivalTime ? guest.arrivalTime.slice(0, 16) : '';
    document.getElementById('inputPickupTime').value = guest.pickupTime;
    document.getElementById('inputPickupLocation').value = guest.pickupLocation;
    document.getElementById('inputFinalDropOffLocation').value = guest.finalDropOffLocation || 'Banyuwangi Airport (BWX)';
    document.getElementById('inputSpecialNotes').value = guest.specialNotes || '';

    // Passport photo preview
    this.primaryPassportBase64 = guest.passportPhoto || null;
    const preview = document.getElementById('passportPhotoPreview');
    const previewImg = document.getElementById('passportPhotoPreviewImg');
    if (this.primaryPassportBase64 && preview && previewImg) {
      previewImg.src = this.primaryPassportBase64;
      preview.classList.remove('hidden');
    } else if (preview) {
      preview.classList.add('hidden');
    }

    // Passengers
    const pax = guest.numberOfPeople || 1;
    this.updatePassengerRows(pax);
    if (guest.passengers && Array.isArray(guest.passengers)) {
      guest.passengers.forEach((p, idx) => {
        if (idx > 0) {
          const nameEl = document.getElementById(`passengerName_${idx + 1}`);
          const genEl = document.getElementById(`passengerGender_${idx + 1}`);
          const ppEl = document.getElementById(`passengerPassport_${idx + 1}`);
          if (nameEl) nameEl.value = p.name || '';
          if (genEl) genEl.value = p.gender || 'Male';
          if (ppEl) ppEl.value = p.passportNumber || '';
        }
      });
    }

    document.getElementById('guestInputModal').classList.remove('hidden');
  }

  // Handle saving guest data (Requirement 2)
  handleSaveGuest(e) {
    e.preventDefault();

    const paxCount = parseInt(document.getElementById('inputNumberOfPeople').value) || 1;
    const leadName = document.getElementById('inputGuestName').value.trim();
    const leadGender = document.getElementById('inputGender').value;
    const leadPassport = document.getElementById('inputPassport').value.trim();

    // Construct passenger list
    const passengers = [
      {
        name: leadName,
        gender: leadGender,
        passportNumber: leadPassport,
        passportPhoto: this.primaryPassportBase64 || null
      }
    ];

    for (let i = 2; i <= paxCount; i++) {
      const pName = document.getElementById(`passengerName_${i}`)?.value.trim() || `Passenger ${i}`;
      const pGen = document.getElementById(`passengerGender_${i}`)?.value || 'Male';
      const pPassport = document.getElementById(`passengerPassport_${i}`)?.value.trim() || 'N/A';

      passengers.push({
        name: pName,
        gender: pGen,
        passportNumber: pPassport,
        passportPhoto: this.primaryPassportBase64 || null
      });
    }

    const currentUser = window.auth ? window.auth.getUser() : null;
    const recordedBy = currentUser ? `${currentUser.fullName} (${currentUser.employeeNumber})` : 'Portal Employee';

    const guestData = {
      guestName: leadName,
      gender: leadGender,
      numberOfPeople: paxCount,
      passengers: passengers,
      country: document.getElementById('inputCountry').value.trim(),
      phone: document.getElementById('inputPhone').value.trim(),
      email: document.getElementById('inputEmail').value.trim(),
      passportNumber: leadPassport,
      passportPhoto: this.primaryPassportBase64 || null,
      invoiceNumber: document.getElementById('inputInvoiceNumber').value.trim(),
      tourPackageName: document.getElementById('inputTourPackage').value,
      paymentAmount: Number(document.getElementById('inputPaymentAmount').value),
      paymentMethod: document.getElementById('inputPaymentMethod').value,
      paymentStatus: document.getElementById('inputPaymentStatus').value,
      paymentLocation: document.getElementById('inputPaymentLocation').value,
      arrivalTime: document.getElementById('inputArrivalTime').value,
      pickupTime: document.getElementById('inputPickupTime').value.trim(),
      pickupLocation: document.getElementById('inputPickupLocation').value.trim(),
      finalDropOffLocation: document.getElementById('inputFinalDropOffLocation').value.trim(),
      specialNotes: document.getElementById('inputSpecialNotes').value.trim(),
      recordedBy: recordedBy
    };

    if (this.editingGuestId) {
      window.db.updateGuest(this.editingGuestId, guestData);
      this.toast(`Reservation details for ${guestData.guestName} updated!`, 'success');
      if (window.auth && currentUser) {
        window.db.logActivity({
          username: currentUser.username,
          fullName: currentUser.fullName,
          role: `${currentUser.position} (${currentUser.employeeNumber})`,
          action: `Updated Reservation: ${guestData.guestName} (${guestData.invoiceNumber})`,
          status: 'Success'
        });
      }
    } else {
      window.db.addGuest(guestData);
      this.toast(`New traveler ${guestData.guestName} registered into Google Drive DB!`, 'success');
      if (window.auth && currentUser) {
        window.db.logActivity({
          username: currentUser.username,
          fullName: currentUser.fullName,
          role: `${currentUser.position} (${currentUser.employeeNumber})`,
          action: `Recorded New Reservation: ${guestData.guestName} (${guestData.invoiceNumber})`,
          status: 'Success'
        });
      }
    }

    document.getElementById('guestInputModal').classList.add('hidden');
    this.renderGuestsTable();
    this.updateStatsCounters();
  }

  // --- Invoice Preview & E-Sign ---
  async generateAndDownloadInvoice(guestId) {
    const guest = window.db.getGuestById(guestId);
    if (!guest) return;

    this.toast('Generating official PDF invoice with cryptographic signature...', 'info');
    await window.invoiceService.generatePDF(guest, true);
    this.toast(`Invoice PDF downloaded for ${guest.guestName}!`, 'success');

    if (window.auth && window.auth.getUser()) {
      const u = window.auth.getUser();
      window.db.logActivity({
        username: u.username,
        fullName: u.fullName,
        role: `${u.position} (${u.employeeNumber})`,
        action: `Generated & Downloaded Invoice PDF #${guest.invoiceNumber}`,
        status: 'Success'
      });
    }
  }

  async previewInvoiceModal(guestId) {
    const guest = window.db.getGuestById(guestId);
    if (!guest) return;

    const modal = document.getElementById('invoicePreviewModal');
    const container = document.getElementById('invoicePreviewContent');

    const token = window.invoiceService.generateProprietarySignature(guest);
    const qrDataUrl = await window.invoiceService.generateQRCodeDataUrl(token);

    container.innerHTML = `
      <div class="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-slate-200 pb-4">
          <div class="flex items-center space-x-3">
            <img src="${window.DOLAN_IJEN_LOGO || 'assets/img/logo.png'}" class="w-14 h-14 object-contain">
            <div>
              <h3 class="font-extrabold text-slate-900 text-base leading-tight">PT HARRIS IJEN JAYA MANDIRI</h3>
              <p class="text-xs text-amber-700 font-bold uppercase tracking-wider">Harris Ijen Tour & Travel Service</p>
              <p class="text-[11px] text-slate-500">Official Company Portal • Banyuwangi, East Java</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-mono font-bold text-blue-700 block">${guest.invoiceNumber}</span>
            <span class="badge ${this.getBadgeClass(guest.paymentStatus)} mt-1">${guest.paymentStatus}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <strong class="text-slate-800 block mb-1">TRAVELER DETAILS:</strong>
            <p><strong>Name:</strong> ${guest.guestName} (${guest.gender || 'Male'})</p>
            <p><strong>Pax:</strong> ${guest.numberOfPeople || 1} Person(s)</p>
            <p><strong>Passport:</strong> ${guest.passportNumber || '-'}</p>
            <p><strong>Country:</strong> ${guest.country}</p>
          </div>
          <div>
            <strong class="text-slate-800 block mb-1">LOGISTICS & DROP-OFF:</strong>
            <p><strong>Arrival:</strong> ${window.invoiceService.formatDateTime(guest.arrivalTime)}</p>
            <p><strong>Pickup:</strong> ${guest.pickupTime} @ ${guest.pickupLocation}</p>
            <p><strong>Final Drop-off:</strong> <span class="text-emerald-700 font-bold">${guest.finalDropOffLocation || 'Banyuwangi Airport'}</span></p>
            <p><strong>Payment Location:</strong> ${guest.paymentLocation || 'HQ'}</p>
          </div>
        </div>

        <div class="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <div class="text-blue-900 font-bold">Package: ${guest.tourPackageName}</div>
            ${guest.discountAmount ? `<div class="text-[11px] text-amber-700 font-semibold">Applied Discount: -IDR ${Number(guest.discountAmount).toLocaleString('id-ID')} (Ref: ${guest.paymentRefNumber || 'N/A'})</div>` : ''}
          </div>
          <div class="text-right font-bold text-base text-slate-900">
            IDR ${Number(guest.paymentAmount).toLocaleString('id-ID')}
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="${qrDataUrl}" class="w-16 h-16 rounded border border-slate-200 p-0.5 bg-white">
            <div class="text-[11px] text-slate-500 max-w-xs">
              <div class="font-bold text-slate-800">Proprietary QR E-Signature</div>
              <div>Cryptographically signed by MUHAMAD ABDUL HARIS (HIC2502982017).</div>
            </div>
          </div>
          <button onclick="app.generateAndDownloadInvoice('${guest.id}')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition">
            <i class="fa-solid fa-file-pdf mr-1"></i> Download PDF
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  renderInvoicesView() {
    const listContainer = document.getElementById('invoicesListGrid');
    if (!listContainer || !window.db) return;

    const guests = window.db.getGuests();
    listContainer.innerHTML = guests.map(g => `
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <span class="font-mono font-bold text-blue-700 text-xs">${g.invoiceNumber}</span>
            <span class="badge ${this.getBadgeClass(g.paymentStatus)}">${g.paymentStatus}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm mb-1">${g.guestName}</h4>
          <p class="text-xs text-slate-500 mb-2 truncate">${g.tourPackageName}</p>
          <div class="text-xs font-semibold text-slate-700">Pax: ${g.numberOfPeople || 1} • Drop: ${(g.finalDropOffLocation || 'Airport').substring(0, 18)}</div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div class="font-bold text-slate-900 text-sm">IDR ${Number(g.paymentAmount).toLocaleString('id-ID')}</div>
          <div class="flex items-center space-x-1.5">
            <button onclick="app.previewInvoiceModal('${g.id}')" class="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs hover:bg-blue-100 transition">
              Preview
            </button>
            <button onclick="app.generateAndDownloadInvoice('${g.id}')" class="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg text-xs hover:bg-rose-100 transition">
              PDF
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Toast notification
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const colorClass = type === 'success' ? 'bg-emerald-600 text-white' : type === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white';

    toast.className = `${colorClass} px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center space-x-2 pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Global Application Controller
window.app = new HarrisPortalApp();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
