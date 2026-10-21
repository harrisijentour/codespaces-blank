/**
 * Harris Ijen Admin Company Portal - Proprietary QR Scanner Service
 * PT HARRIS IJEN JAYA MANDIRI
 * Validates cryptographic electronic signatures on company invoices and documents.
 */

class HarrisScannerService {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.mode = 'camera';
  }

  setMode(mode) {
    this.mode = mode;
    this.stopCamera();

    const camContainer = document.getElementById('scannerCameraContainer');
    const uploadContainer = document.getElementById('scannerUploadContainer');
    const manualContainer = document.getElementById('scannerManualContainer');
    const btnCam = document.getElementById('btnScannerModeCamera');
    const btnUp = document.getElementById('btnScannerModeUpload');
    const btnMan = document.getElementById('btnScannerModeManual');

    [btnCam, btnUp, btnMan].forEach(b => {
      if (b) {
        b.className = 'px-3 py-1.5 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-200 transition bg-slate-100';
      }
    });

    if (camContainer) camContainer.classList.add('hidden');
    if (uploadContainer) uploadContainer.classList.add('hidden');
    if (manualContainer) manualContainer.classList.add('hidden');

    if (mode === 'camera') {
      if (camContainer) camContainer.classList.remove('hidden');
      if (btnCam) btnCam.className = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs transition';
    } else if (mode === 'upload') {
      if (uploadContainer) uploadContainer.classList.remove('hidden');
      if (btnUp) btnUp.className = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs transition';
    } else if (mode === 'manual') {
      if (manualContainer) manualContainer.classList.remove('hidden');
      if (btnMan) btnMan.className = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs transition';
    }
  }

  async startCamera() {
    if (this.isScanning) {
      await this.stopCamera();
    }

    try {
      this.html5QrCode = new Html5Qrcode('qr-reader');
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          this.stopCamera();
          this.verifyToken(decodedText);
        },
        (errorMessage) => {
          // Scanning frame
        }
      );

      this.isScanning = true;
      document.getElementById('btnStartCamera')?.classList.add('hidden');
      document.getElementById('btnStopCamera')?.classList.remove('hidden');
    } catch (err) {
      alert('Camera permission denied or camera not found: ' + err.message);
    }
  }

  async stopCamera() {
    if (this.html5QrCode && this.isScanning) {
      try {
        await this.html5QrCode.stop();
        this.html5QrCode.clear();
      } catch (e) {}
      this.isScanning = false;
      document.getElementById('btnStartCamera')?.classList.remove('hidden');
      document.getElementById('btnStopCamera')?.classList.add('hidden');
    }
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qrFileScannerHidden');
      const decodedText = await html5QrCode.scanFile(file, true);
      this.verifyToken(decodedText);
      html5QrCode.clear();
    } catch (err) {
      this.displayResult({
        valid: false,
        message: 'No recognizable QR code found in the image. Please make sure the QR code is clearly visible.'
      });
    }
  }

  handleManualVerify() {
    const text = document.getElementById('scannerManualTokenInput')?.value.trim();
    if (!text) {
      alert('Please enter a signature token string.');
      return;
    }
    this.verifyToken(text);
  }

  verifyToken(tokenText) {
    if (!window.invoiceService) return;

    const res = window.invoiceService.verifyProprietarySignature(tokenText);
    if (!res.valid) {
      this.displayResult(res);
      return;
    }

    const payload = res.payload;
    const dbRecord = window.db ? window.db.getGuestByInvoice(payload.inv) : null;

    const verifiedResult = {
      valid: true,
      tokenText: tokenText,
      payload: payload,
      dbMatch: !!dbRecord,
      dbGuest: dbRecord,
      message: 'AUTHENTIC & VERIFIED: Cryptographically validated by PT HARRIS IJEN JAYA MANDIRI.',
      verifiedAt: new Date().toLocaleString('en-GB')
    };

    if (window.db && window.auth && window.auth.getUser()) {
      const user = window.auth.getUser();
      window.db.logActivity({
        username: user.username,
        fullName: user.fullName,
        role: `${user.position} (${user.employeeNumber})`,
        action: `Verified Invoice #${payload.inv} via Scanner`,
        status: 'Success'
      });
    }

    this.displayResult(verifiedResult);
  }

  displayResult(result) {
    const box = document.getElementById('scannerResultBox');
    if (!box) return;

    if (!result.valid) {
      box.className = 'p-5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-2 block';
      box.innerHTML = `
        <div class="flex items-center space-x-2 font-bold text-sm text-rose-800">
          <i class="fa-solid fa-triangle-exclamation text-base"></i>
          <span>Verification Failed / Signature Invalid</span>
        </div>
        <p class="text-xs text-rose-700">${result.message}</p>
      `;
      return;
    }

    const p = result.payload;
    box.className = 'p-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-slate-800 text-xs space-y-3 block';
    box.innerHTML = `
      <div class="flex items-center justify-between border-b border-emerald-200 pb-3">
        <div class="flex items-center space-x-2 font-extrabold text-sm text-emerald-800">
          <i class="fa-solid fa-certificate text-lg text-emerald-600"></i>
          <span>Official Certificate of Authenticity</span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">GENUINE DOCUMENT</span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-emerald-100">
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Traveler Name</span>
          <span class="font-bold text-slate-900 text-sm">${p.gst}</span>
          <span class="block text-[11px] text-slate-500">Passport: ${p.pp || '-'} • Pax: ${p.pax || 1}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Invoice & Status</span>
          <span class="font-mono font-bold text-blue-700 text-xs">${p.inv}</span>
          <span class="block text-[11px] text-emerald-700 font-bold">${p.stat || 'Paid in Full'}</span>
        </div>
      </div>

      <div class="space-y-1 text-slate-700">
        <div><strong>Tour Package:</strong> ${p.pkg}</div>
        <div><strong>Drop-off Location:</strong> ${p.drop || 'Banyuwangi Airport'}</div>
        <div><strong>Payment Amount:</strong> IDR ${Number(p.amt).toLocaleString('id-ID')}</div>
        <div><strong>Verified At:</strong> ${result.verifiedAt}</div>
      </div>

      <div class="text-[10px] text-slate-500 font-mono truncate pt-1 border-t border-emerald-100">
        Token Checksum: ${result.tokenText.substring(0, 60)}...
      </div>
    `;
  }
}

// Global Instances
window.scannerService = new HarrisScannerService();
window.scannerTool = window.scannerService;
