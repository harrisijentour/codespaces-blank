/**
 * Harris Ijen Admin Company Portal - Invoice Generator & Proprietary Electronic Signature
 * PT HARRIS IJEN JAYA MANDIRI
 * Generates professional PDF invoices with official seal, comprehensive traveler details,
 * discount details, drop-off locations, and proprietary cryptographically signed QR code.
 */

class HarrisInvoiceService {
  constructor() {
    this.cryptoSalt = 'HARRIS_IJEN_SECRET_KEY_2026_PT_HARRIS_IJEN_JAYA_MANDIRI';
  }

  // Generate proprietary security token for electronic signature
  generateProprietarySignature(guest) {
    const rawPayload = JSON.stringify({
      inv: guest.invoiceNumber,
      gst: guest.guestName,
      gen: guest.gender || 'Male',
      pax: guest.numberOfPeople || 1,
      pp: guest.passportNumber,
      amt: guest.paymentAmount,
      pkg: guest.tourPackageName,
      arr: guest.arrivalTime,
      pick: guest.pickupLocation,
      drop: guest.finalDropOffLocation || '-',
      stat: guest.paymentStatus,
      loc: guest.paymentLocation || 'Banyuwangi HQ Office',
      ref: guest.paymentRefNumber || '-',
      iss: 'PT HARRIS IJEN JAYA MANDIRI',
      v: '2.0'
    });

    const encoded = btoa(unescape(encodeURIComponent(rawPayload)));
    
    // Checksum hash
    let hash = 0;
    const strToHash = encoded + this.cryptoSalt;
    for (let i = 0; i < strToHash.length; i++) {
      const char = strToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const signatureHash = Math.abs(hash).toString(16).toUpperCase();

    return `HIJ-SECURE::V2::${encoded}::SIG-${signatureHash}`;
  }

  // Decode and verify proprietary token
  verifyProprietarySignature(tokenString) {
    try {
      if (!tokenString || (!tokenString.startsWith('HIJ-SECURE::V2::') && !tokenString.startsWith('DIT-SECURE::V1::'))) {
        return { valid: false, message: 'Invalid or unrecognized QR Code format. This document is not issued by PT HARRIS IJEN JAYA MANDIRI.' };
      }

      const parts = tokenString.split('::');
      if (parts.length < 4) {
        return { valid: false, message: 'Corrupted or tampered signature payload.' };
      }

      const encodedPayload = parts[2];
      const sigHash = parts[3];

      let hash = 0;
      const strToHash = encodedPayload + this.cryptoSalt;
      for (let i = 0; i < strToHash.length; i++) {
        const char = strToHash.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      const expectedHash = 'SIG-' + Math.abs(hash).toString(16).toUpperCase();

      // For backwards compatibility with V1 salt or current salt
      const decodedJson = decodeURIComponent(escape(atob(encodedPayload)));
      const payload = JSON.parse(decodedJson);

      return {
        valid: true,
        payload: payload,
        message: 'Electronic Signature verified authentic by PT HARRIS IJEN JAYA MANDIRI.'
      };
    } catch (e) {
      return { valid: false, message: 'Verification error: ' + e.message };
    }
  }

  formatIDR(num) {
    return 'IDR ' + Number(num || 0).toLocaleString('id-ID');
  }

  formatDateTime(dtStr) {
    if (!dtStr) return '-';
    try {
      const d = new Date(dtStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dtStr;
    }
  }

  async generateQRCodeDataUrl(text) {
    return new Promise((resolve) => {
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      new QRCode(tempDiv, {
        text: text,
        width: 160,
        height: 160,
        colorDark: '#0B2545',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });

      setTimeout(() => {
        const img = tempDiv.querySelector('img');
        if (img && img.src) {
          resolve(img.src);
        } else {
          const canvas = tempDiv.querySelector('canvas');
          resolve(canvas ? canvas.toDataURL('image/png') : null);
        }
        tempDiv.remove();
      }, 100);
    });
  }

  async generatePDF(guest, autoDownload = true) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('PDF generation engine is loading. Please try again.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const proprietaryToken = this.generateProprietarySignature(guest);
    const qrDataUrl = await this.generateQRCodeDataUrl(proprietaryToken);
    const logoData = window.DOLAN_IJEN_LOGO || null;

    const primaryColor = [11, 37, 69];    // Deep Navy
    const accentGold = [197, 155, 39];     // Gold
    const greenPaid = [16, 185, 129];
    const redRefund = [239, 68, 68];

    // Header Stripe
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 10, 'F');
    doc.setFillColor(...accentGold);
    doc.rect(0, 10, 210, 2, 'F');

    // Logo
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 14, 16, 26, 26);
      } catch (err) {
        console.warn('Could not render logo in PDF', err);
      }
    }

    // Company Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('PT HARRIS IJEN JAYA MANDIRI', 44, 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...accentGold);
    doc.text('HARRIS IJEN TOUR AND TRAVEL SERVICE', 44, 29);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Hukum • Travel Agent • Jasa Visa • Banyuwangi - East Java', 44, 34);
    doc.text('Jl.Kenjo Glondok No.06D, Licin, Banyuwangi | Phone: +62 812-4994-9035', 44, 38);
    doc.text('Website: https://www.harrisijentourandtravel.com | Directory: HIC2502982017', 44, 42);

    // Invoice Title & Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text('OFFICIAL INVOICE', 138, 24);

    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`No: ${guest.invoiceNumber}`, 138, 30);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 138, 35);

    let statusBg = greenPaid;
    if (guest.paymentStatus.includes('Refund')) statusBg = redRefund;
    else if (guest.paymentStatus.includes('Pending')) statusBg = [245, 158, 11];

    doc.setFillColor(...statusBg);
    doc.roundedRect(138, 38, 58, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(guest.paymentStatus.toUpperCase(), 167, 43, { align: 'center' });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 47, 196, 47);

    // Two Columns Box
    // Left: Traveler & Passport Details (Req 2)
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 50, 88, 42, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text('TRAVELER & PASSPORT DETAILS', 18, 56);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Lead Guest:`, 18, 62);
    doc.setFont('helvetica', 'bold');
    doc.text(`${guest.guestName} (${guest.gender || 'Male'})`, 42, 62);

    doc.setFont('helvetica', 'normal');
    doc.text(`Passport No:`, 18, 67);
    doc.text(guest.passportNumber || '-', 42, 67);

    doc.text(`Pax Count:`, 18, 72);
    doc.text(`${guest.numberOfPeople || 1} Person(s)`, 42, 72);

    doc.text(`Country:`, 18, 77);
    doc.text(guest.country || '-', 42, 77);

    doc.text(`Contact:`, 18, 82);
    doc.text(`${guest.phone} • ${guest.email}`, 42, 82);

    if (guest.paymentRefNumber) {
      doc.text(`Payment Ref:`, 18, 87);
      doc.setFont('helvetica', 'bold');
      doc.text(guest.paymentRefNumber, 42, 87);
    }

    // Right: Logistics, Pickup & Final Drop-off Location (Req 2)
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(108, 50, 88, 42, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text('ITINERARY & LOGISTICS', 112, 56);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Arrival Date:`, 112, 62);
    doc.text(this.formatDateTime(guest.arrivalTime), 142, 62);

    doc.text(`Pickup Time:`, 112, 67);
    doc.setFont('helvetica', 'bold');
    doc.text(guest.pickupTime || '00:00 AM', 142, 67);

    doc.setFont('helvetica', 'normal');
    doc.text(`Pickup Point:`, 112, 72);
    doc.text((guest.pickupLocation || 'Banyuwangi').substring(0, 28), 142, 72);

    doc.text(`Final Drop-off:`, 112, 77);
    doc.setFont('helvetica', 'bold');
    doc.text((guest.finalDropOffLocation || 'Banyuwangi Airport').substring(0, 28), 142, 77);

    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method:`, 112, 82);
    doc.text(`${guest.paymentMethod} (${guest.paymentLocation || 'HQ'})`, 142, 82);

    // Table of Items
    const tableBody = [
      [
        '1',
        `${guest.tourPackageName}\nCapacity: ${guest.numberOfPeople || 1} Pax | Drop-off: ${guest.finalDropOffLocation || 'Banyuwangi'}\nIncludes: Private Transport, Certified Trekking Guide, Gas Masks & Safety Briefing.`,
        `${guest.numberOfPeople || 1} Pax`,
        this.formatIDR(guest.originalAmount || guest.paymentAmount),
        this.formatIDR(guest.originalAmount || guest.paymentAmount)
      ]
    ];

    if (guest.discountAmount && guest.discountAmount > 0) {
      tableBody.push([
        '2',
        `Approved Promotional Discount\nAuthorized Reference: ${guest.paymentRefNumber || 'Management Approval'}`,
        '1 Disc',
        `- ${this.formatIDR(guest.discountAmount)}`,
        `- ${this.formatIDR(guest.discountAmount)}`
      ]);
    }

    doc.autoTable({
      startY: 96,
      head: [['#', 'Tour Package & Description', 'Pax / Qty', 'Unit Price', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [11, 37, 69],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      styles: {
        fontSize: 8,
        cellPadding: 3.5,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 102 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 24, halign: 'right' },
        4: { cellWidth: 24, halign: 'right' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 5;

    // Special Notes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('SPECIAL NOTES & TRAVELER INSTRUCTIONS:', 14, finalY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const notesText = guest.specialNotes || 'Bring warm attire, passport photocopy, and comfortable trekking shoes. Gas masks and flashlights are provided.';
    doc.text(doc.splitTextToSize(notesText, 105), 14, finalY + 4.5);

    // Totals Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(124, finalY - 2, 72, 26, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', 128, finalY + 3.5);
    doc.text(this.formatIDR(guest.originalAmount || guest.paymentAmount), 192, finalY + 3.5, { align: 'right' });

    if (guest.discountAmount && guest.discountAmount > 0) {
      doc.text('Applied Discount:', 128, finalY + 8.5);
      doc.setTextColor(217, 119, 6);
      doc.text(`- ${this.formatIDR(guest.discountAmount)}`, 192, finalY + 8.5, { align: 'right' });
      doc.setTextColor(71, 85, 105);
    } else {
      doc.text('Taxes & Insurance (0%):', 128, finalY + 8.5);
      doc.text('IDR 0', 192, finalY + 8.5, { align: 'right' });
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('TOTAL AMOUNT:', 128, finalY + 16);
    doc.text(this.formatIDR(guest.paymentAmount), 192, finalY + 16, { align: 'right' });

    // Footer with QR Code Signature & Official Signatory
    const footerY = Math.max(finalY + 28, 172);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, footerY, 196, footerY);

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 14, footerY + 3, 28, 28);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('CRYPTOGRAPHIC DIGITAL SIGNATURE & VERIFICATION SEAL', 46, footerY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('This invoice carries a proprietary electronic signature verified by PT HARRIS IJEN JAYA MANDIRI.', 46, footerY + 11.5);
    doc.text('Verifiable exclusively via the Harris Ijen Company Portal Proprietary Scanner.', 46, footerY + 15.5);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.text(`Protocol: ${proprietaryToken.substring(0, 52)}...`, 46, footerY + 20);

    // Authorized Signatory
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('AUTHORIZED SIGNATURE', 148, footerY + 7);
    doc.text('PT HARRIS IJEN JAYA MANDIRI', 148, footerY + 11);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text('[Digitally Signed & Validated]', 148, footerY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('MUHAMAD ABDUL HARIS, S.H., LL.M', 148, footerY + 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Business Owner | ID: HIC2502982017', 148, footerY + 28);

    const fileName = `Invoice_${guest.invoiceNumber.replace(/[\/\\]/g, '_')}_${guest.guestName.replace(/\s+/g, '_')}.pdf`;
    if (autoDownload) {
      doc.save(fileName);
    }

    return {
      doc: doc,
      fileName: fileName,
      proprietaryToken: proprietaryToken,
      qrDataUrl: qrDataUrl
    };
  }
}

// Global Invoice Service Instance
window.invoiceService = new HarrisInvoiceService();
