/**
 * Harris Ijen Admin Company Portal - Uploaded Files & Passports Vault
 * PT HARRIS IJEN JAYA MANDIRI
 * Requirement 6: A feature to view files uploaded by employees,
 * such as the passport photos of guests who have made a booking and proof of payments.
 */

class HarrisFileVaultService {
  constructor() {
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.zoomLevel = 1;
    this.rotationAngle = 0;
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('harris_db_updated', () => {
      if (window.app && window.app.currentTab === 'files') {
        this.renderVault();
      }
    });

    const searchInput = document.getElementById('fileSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderVault();
      });
    }

    // Keyboard navigation for lightbox
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('modalFileLightbox');
      if (modal && !modal.classList.contains('hidden')) {
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === '+' || e.key === '=') this.zoomIn();
        if (e.key === '-') this.zoomOut();
        if (e.key === 'r') this.rotateRight();
      }
    });
  }

  setFilter(filterName) {
    this.currentFilter = filterName;
    document.querySelectorAll('.file-filter-btn').forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-slate-100', 'text-slate-700');
    });

    const activeBtn = document.getElementById(`filterBtn_${filterName}`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-100', 'text-slate-700');
      activeBtn.classList.add('bg-blue-600', 'text-white');
    }

    this.renderVault();
  }

  renderVault() {
    const container = document.getElementById('filesGalleryGrid');
    const countDisplay = document.getElementById('filesCountDisplay');
    if (!container || !window.db) return;

    let files = window.db.getAllUploadedFiles();

    // Filter by Category
    if (this.currentFilter !== 'all') {
      files = files.filter(f => f.category === this.currentFilter);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery;
      files = files.filter(f => 
        (f.guestName && f.guestName.toLowerCase().includes(q)) ||
        (f.travelerName && f.travelerName.toLowerCase().includes(q)) ||
        (f.passportNumber && f.passportNumber.toLowerCase().includes(q)) ||
        (f.invoiceNumber && f.invoiceNumber.toLowerCase().includes(q)) ||
        (f.fileName && f.fileName.toLowerCase().includes(q)) ||
        (f.uploadedBy && f.uploadedBy.toLowerCase().includes(q))
      );
    }

    if (countDisplay) {
      countDisplay.innerText = `Displaying ${files.length} uploaded files`;
    }

    if (files.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200">
          <i class="fa-regular fa-folder-open text-4xl text-slate-300 mb-3 block"></i>
          <h4 class="font-bold text-slate-700 text-sm">No uploaded files found</h4>
          <p class="text-xs text-slate-400 mt-1">Uploaded passport photos and payment slips will appear here automatically.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = files.map(f => {
      const isPassport = f.category === 'passport';
      const badgeColor = isPassport ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
      const icon = isPassport ? 'fa-id-card' : 'fa-receipt';

      return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
          <!-- Thumbnail Area with Hover Overlay -->
          <div class="relative bg-slate-100 h-48 overflow-hidden flex items-center justify-center p-3 cursor-pointer" onclick="window.fileVaultService.openLightbox('${f.fileData}', '${f.type}: ${f.travelerName}', '${f.passportNumber} • Invoice: ${f.invoiceNumber}')">
            <img src="${f.fileData}" alt="${f.fileName}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-3 text-white">
              <span class="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition">
                <i class="fa-solid fa-magnifying-glass-plus text-base"></i>
              </span>
            </div>
            <!-- Type Pill -->
            <span class="absolute top-2.5 left-2.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor} backdrop-blur-sm shadow-xs">
              <i class="fa-solid ${icon} mr-1"></i> ${f.type}
            </span>
          </div>

          <!-- Card Body -->
          <div class="p-4 flex-1 flex flex-col justify-between text-xs">
            <div>
              <div class="flex items-start justify-between gap-1 mb-1">
                <h4 class="font-bold text-slate-900 text-sm leading-tight truncate" title="${f.travelerName}">
                  ${f.travelerName}
                </h4>
              </div>

              <div class="space-y-1 text-[11px] text-slate-600 mb-3">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">ID / Passport:</span>
                  <span class="font-mono font-bold text-slate-800">${f.passportNumber || '-'}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Invoice:</span>
                  <span class="font-mono text-blue-600 font-semibold">${f.invoiceNumber}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Uploaded By:</span>
                  <span class="truncate max-w-[130px] font-medium" title="${f.uploadedBy}">${f.uploadedBy}</span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button onclick="window.fileVaultService.openLightbox('${f.fileData}', '${f.type}: ${f.travelerName}', '${f.passportNumber} • Invoice: ${f.invoiceNumber}')" class="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center">
                <i class="fa-solid fa-eye mr-1"></i> Inspect File
              </button>
              <button onclick="window.fileVaultService.downloadFile('${f.fileData}', '${f.fileName}')" class="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition" title="Download Document">
                <i class="fa-solid fa-download"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Open High-Resolution Lightbox Viewer
  openLightbox(fileData, title = 'Document Viewer', subtitle = '') {
    const modal = document.getElementById('modalFileLightbox');
    const img = document.getElementById('lightboxImage');
    const titleEl = document.getElementById('lightboxTitle');
    const subtitleEl = document.getElementById('lightboxSubtitle');
    if (!modal || !img) return;

    this.zoomLevel = 1;
    this.rotationAngle = 0;
    this.currentActiveFileData = fileData;
    this.currentActiveFileName = title.replace(/[^a-zA-Z0-9_-]/g, '_') + '.png';

    img.src = fileData;
    this.applyTransform();

    if (titleEl) titleEl.innerText = title;
    if (subtitleEl) subtitleEl.innerText = subtitle;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    const modal = document.getElementById('modalFileLightbox');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3.5);
    this.applyTransform();
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.5);
    this.applyTransform();
  }

  rotateRight() {
    this.rotationAngle = (this.rotationAngle + 90) % 360;
    this.applyTransform();
  }

  resetTransform() {
    this.zoomLevel = 1;
    this.rotationAngle = 0;
    this.applyTransform();
  }

  applyTransform() {
    const img = document.getElementById('lightboxImage');
    if (img) {
      img.style.transform = `scale(${this.zoomLevel}) rotate(${this.rotationAngle}deg)`;
      img.style.transition = 'transform 0.2s ease-out';
    }
    const zoomText = document.getElementById('lightboxZoomText');
    if (zoomText) zoomText.innerText = `${Math.round(this.zoomLevel * 100)}%`;
  }

  downloadCurrentFile() {
    if (this.currentActiveFileData) {
      this.downloadFile(this.currentActiveFileData, this.currentActiveFileName || 'document.png');
    }
  }

  downloadFile(dataUrl, fileName) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Open modal showing all files for a single guest booking
  openGuestFilesModal(guestId) {
    const guest = window.db.getGuestById(guestId);
    if (!guest) return;

    const modal = document.getElementById('modalGuestFilesList');
    const container = document.getElementById('guestFilesListContent');
    const titleEl = document.getElementById('guestFilesModalTitle');
    if (!modal || !container) return;

    if (titleEl) {
      titleEl.innerText = `Uploaded Files for ${guest.guestName} (#${guest.invoiceNumber})`;
    }

    const files = [];

    // Primary passport
    if (guest.passportPhoto) {
      files.push({
        title: `Primary Passport Photo (${guest.guestName})`,
        passportNo: guest.passportNumber,
        type: 'Passport Photo',
        data: guest.passportPhoto,
        date: guest.createdAt
      });
    }

    // Additional passengers
    if (guest.passengers && Array.isArray(guest.passengers)) {
      guest.passengers.forEach((p, idx) => {
        if (idx > 0 && p.passportPhoto) {
          files.push({
            title: `Passenger ${idx + 1} Passport: ${p.name}`,
            passportNo: p.passportNumber,
            type: 'Passport Photo',
            data: p.passportPhoto,
            date: guest.createdAt
          });
        }
      });
    }

    // Payment proof
    if (guest.paymentProofImage) {
      files.push({
        title: `Proof of Payment / Bank Slip`,
        passportNo: `Ref: ${guest.paymentRefNumber || '-'}`,
        type: 'Payment Receipt',
        data: guest.paymentProofImage,
        date: guest.createdAt
      });
    }

    if (files.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400">
          <i class="fa-regular fa-image text-3xl mb-2 block"></i>
          No files currently uploaded for this guest.
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${files.map(f => `
            <div class="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center space-x-3">
              <div class="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group" onclick="window.fileVaultService.openLightbox('${f.data}', '${f.title}', '${f.passportNo}')">
                <img src="${f.data}" alt="${f.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition">
              </div>
              <div class="flex-1 min-w-0 text-xs">
                <div class="font-bold text-slate-900 truncate">${f.title}</div>
                <div class="text-[11px] font-mono text-slate-500">${f.passportNo}</div>
                <button onclick="window.fileVaultService.openLightbox('${f.data}', '${f.title}', '${f.passportNo}')" class="mt-1 text-blue-600 hover:underline font-bold text-[11px]">
                  View Full Size <i class="fa-solid fa-arrow-up-right-from-square ml-0.5 text-[9px]"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }
}

// Global Singleton Instance
window.fileVaultService = new HarrisFileVaultService();
