# Harris Ijen Admin Company Portal
**PT HARRIS IJEN JAYA MANDIRI**  
*Hukum • Travel Agent • Jasa Visa • Banyuwangi, Jawa Timur*  
*Official Web: [https://www.harrisijentourandtravel.com](https://www.harrisijentourandtravel.com)*  
*Employee Directory: [https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html](https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html)*

A mobile-friendly enterprise web application engineered for managing travel agency guest reservations, multi-pax passport archives, payment proofs, discount approval workflows, and Blogspot post page embeds for **PT HARRIS IJEN JAYA MANDIRI** (Harris Ijen & Dolan Ijen Tour & Travel).

---

## 🌟 Key Features & Requirements Matrix

### 1. Multi-Role Authentication & Cloud Database (Requirement 1)
- **User ID & Password Security**: Secure access for guests, employees, and company administrators.
- **Login Options**: Employees can log in using either their system username or their **Official Employee Number** (e.g. `HIC2502982017`).
- **Pre-Configured Official Company Accounts**:
  - `haris_director` / `HIC2502982017` (MUHAMAD ABDUL HARIS, S.H., LL.M - Founder & Business Owner)
  - `ida_marketing` / `HIC2104682023` (IDA AYU PUTRI SARASWATI, S.H., LL.M - Marketing Manager)
  - `nurina_brand` / `HIC1211882018` (NURINA YULIANA, S.H. - Brand Manager)
  - `rapii_ops` / `HIC3105602017` (RAPI'I - Direktur Operasional)
  - `abdul_guide` / `HIC1620832016` (ABDUL KHOLIK - Tour Leader Guide)
  - `andika_guide` / `HIC1620852024` (ANDIKA EKA PUTRA - Tour Guide)
  - `admin` / `HIC-ADM-2026` (Company Administrator)
- **Automatic Cloud Persistence**:
  - Local Google Drive synchronized JSON database (`database/dolan_ijen_db.json`).
  - Google Sheets & Google Drive Web App backend (`google-apps-script/Code.gs`).

### 2. Comprehensive Employee Reservation Records (Requirement 2)
The system records all required parameters:
1. **Guest Name**: Full lead traveler name.
2. **Gender**: Male, Female, Other (recorded per guest).
3. **Number of People (Pax)**: Dynamic counter (1 to 10+ persons) that dynamically generates individual passenger cards for multi-pax groups.
4. **Passport Number (for each guest)**: Individual passport numbers tracked per traveler.
5. **Passport Photo**: Image upload converted into high-resolution Base64, archived directly in Google Drive with instant thumbnail preview.
6. **Country of Origin**: Traveler nationality.
7. **Phone Number / WhatsApp**: Instant click-to-chat integration.
8. **Email Address**: For electronic invoice delivery.
9. **Tour Package Name**: Mount Ijen Midnight Blue Fire, Bromo & Ijen 3D2N, Baluran Safari, etc.
10. **Invoice Number**: Auto-generated corporate format (`INV/HIJ/YYYY/MM/XXX`).
11. **Payment Amount & Method**: Credit Card, BCA, Mandiri, Wise, PayPal, Cash.
12. **Payment Status and Location**:
    - Status: Paid in Full, Partial / Deposit, Pending, Refund Requested, Refunded.
    - Location: Banyuwangi HQ Office, Bali Branch Office, Paltuding Base Camp, Online Gateway, Airport BWX.
13. **Arrival Date and Time**: Precise flight/train arrival timestamp.
14. **Pickup Time & Location**: Hotel lobby, station, or port.
15. **Final Drop-off Location**: Exact final drop-off destination (e.g. *Ketapang Ferry Port to Bali*, *Banyuwangi Airport BWX*, *Dialoog Hotel*, *Surabaya*).

### 3. Discount Requests & Management Approval (Requirement 3 & 5)
- **Dedicated Discount Field**: Employees can request promotional discounts, early-bird rates, or partner agent commissions on bookings.
- **Mandatory Requirements**:
  1. **Upload Proof of Payment (Image)**: Bank transfer receipt, card receipt, or cashier slip.
  2. **Payment Reference Number**: Mandatory transaction reference ID (e.g. `TRX-BCA-982144791`).
  3. Stated justification and discount calculation (% or Fixed IDR).
- **Leadership / Administrator Approval Gate**:
  - Requires explicit sign-off from Company Leadership (MUHAMAD ABDUL HARIS, S.H., LL.M or Administrator).
  - Review modal shows the uploaded payment receipt image, payment reference number, and price adjustment.
  - One-click **Approve** or **Reject**; upon approval, automatically recalculates booking totals, financial statements, and syncs with Google Sheets.

### 4. Top-Left Avatar & Employee ID Display (Requirement 4)
- Positioned in the prominent top-left corner (Desktop Sidebar and Mobile Top Bar):
  - Employee Portrait Avatar with live status indicator.
  - Employee Full Name & Position (e.g. *MUHAMAD ABDUL HARIS, S.H., LL.M - Founder & Business Owner*).
  - Employee Number (e.g. `HIC2502982017`).
  - Verified Identity pill linked directly to the official directory:
    `https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html`.

### 5. Uploaded Files & Passports Vault (Requirement 6)
- High-resolution document viewer and media vault:
  - View all uploaded guest passport photos across all reservations.
  - View proof of payment transfer receipts and discount vouchers.
  - **Interactive Lightbox Viewer**:
    - Zoom In / Zoom Out (up to 350%).
    - 90° Image Rotation.
    - One-click Document Download.
    - Full traveler and invoice metadata.
  - Searchable by traveler name, passport number, invoice number, or employee name.

### 6. Blogspot Post Page Embedding (Requirement 7)
- **Zero-Conflict Architecture**:
  - Designed to be embedded within any Blogspot post or page without affecting or being affected by the default Blogspot template CSS.
  - **Method 1: Responsive Auto-Resizing Iframe (Recommended)**:
    - 100% Sandbox Isolation.
    - Embedded postMessage auto-height script dynamically expands the iframe to fit content without double scrollbars.
  - **Method 2: Scoped Card Container**:
    - Protected with `all: initial` CSS reset to prevent Blogspot template resets (like `-webkit-appearance: none; border-radius: 0`) from distorting form elements.
  - **Built-in Blogger Code Generator**:
    - 1-Click "Copy Blogspot Embed Code" ready to paste into Blogger's HTML post editor.
    - Live simulator previewing the embed within the official Blogspot theme.

---

## 🚀 How to Run the Application

### Option 1: 1-Click Direct Launch
Double-click `Start-App.bat` in the project root folder. The application opens immediately in your default browser.

### Option 2: Local Web Server (For Webcam & Scanner)
1. Double-click `Launch-LocalServer.bat` (or execute `powershell -File server.ps1`).
2. Open your browser at: `http://localhost:8080/`.

---

## 📁 Project Structure

```
k:\My Drive\APPS_DOLAN_IJEN_TOURS/
│
├── index.html                  # Main responsive Single Page Application
├── Start-App.bat               # 1-Click browser launcher
├── Launch-LocalServer.bat      # 1-Click local HTTP server
├── server.ps1                  # Lightweight PowerShell HTTP server
├── README.md                   # System documentation
│
├── assets/
│   ├── css/
│   │   └── styles.css          # Scoped CSS, Blogspot embed isolation, & UI styles
│   ├── js/
│   │   ├── logo-data.js        # Base64 logo for offline jsPDF embedding
│   │   ├── db.js               # Database layer, Google Drive sync, & comprehensive schema
│   │   ├── auth.js             # User ID login & PT Harris Ijen Jaya employee directory
│   │   ├── discounts.js        # Discount requests, payment proof uploads & approvals (Req 3 & 5)
│   │   ├── files.js            # Uploaded files vault & passport lightbox viewer (Req 6)
│   │   ├── invoice.js          # jsPDF generator, multi-pax passports, & proprietary e-sign
│   │   ├── scanner.js          # Cryptographic QR verification engine
│   │   ├── cancellation.js     # Refund & cancellation approval workflow
│   │   ├── reviews.js          # Verified customer reviews with database gate
│   │   ├── finance.js          # Income ledger & operational expenses
│   │   ├── audit.js            # Staff login audit & IP monitoring
│   │   ├── blogspot.js         # Blogspot embed code generator & Blogger API v3 (Req 7)
│   │   └── app.js              # Coordinator controller & dynamic passenger forms
│   └── img/
│       ├── logo.png            # Official company logo
│       └── review_reference.jpg# Reference UI mockup
│
├── database/
│   └── dolan_ijen_db.json      # Google Drive synchronized JSON database
│
└── google-apps-script/
    └── Code.gs                 # Google Sheets & Drive REST Web App backend
```

---

*PT HARRIS IJEN JAYA MANDIRI • Harris Ijen Tour and Travel*  
*JL. KENJO GLONDOK NO 06, DUSUN GLONDOK RT 001 RW 001, Desa/Kelurahan Licin,district Licin, Kab. Banyuwangi
East Java Province, Postal Code 68454.*
