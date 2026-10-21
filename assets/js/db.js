/**
 * Harris Ijen Admin Company Portal - Database & Storage Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Handles Bookings, Cancellations, Discounts, Reviews, Financials, Uploaded Files, and Audit Logs.
 * Automatically synchronizes with Google Drive (Local File System) and Google Sheets (Web App API).
 */

const DB_KEY = 'HARRIS_IJEN_DATABASE_V2';

// Sample base64 placeholder for passport photo
const DEMO_PASSPORT_PHOTO_1 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%230B2545"/><rect x="15" y="15" width="270" height="370" fill="%23ffffff" rx="10"/><text x="150" y="55" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230B2545" text-anchor="middle">PASSPORT / ID DOCUMENT</text><circle cx="150" cy="140" r="50" fill="%23E2E8F0"/><circle cx="150" cy="125" r="22" fill="%2394A3B8"/><path d="M115,175 Q150,150 185,175 Z" fill="%2394A3B8"/><rect x="40" y="220" width="220" height="15" fill="%23CBD5E1" rx="4"/><rect x="40" y="245" width="160" height="15" fill="%23E2E8F0" rx="4"/><rect x="40" y="270" width="190" height="15" fill="%23E2E8F0" rx="4"/><rect x="40" y="310" width="220" height="40" fill="%23F1F5F9" rx="4"/><text x="50" y="335" font-family="monospace" font-size="10" fill="%2364748B">P&lt;GBRLAWSON&lt;&lt;ADUNNI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text></svg>';
const DEMO_PASSPORT_PHOTO_2 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%231E3A8A"/><rect x="15" y="15" width="270" height="370" fill="%23ffffff" rx="10"/><text x="150" y="55" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231E3A8A" text-anchor="middle">AUSTRALIAN PASSPORT</text><circle cx="150" cy="140" r="50" fill="%23FEF3C7"/><circle cx="150" cy="125" r="22" fill="%23D97706"/><path d="M115,175 Q150,150 185,175 Z" fill="%23D97706"/><rect x="40" y="220" width="220" height="15" fill="%23CBD5E1" rx="4"/><rect x="40" y="245" width="160" height="15" fill="%23E2E8F0" rx="4"/><rect x="40" y="270" width="190" height="15" fill="%23E2E8F0" rx="4"/><text x="50" y="335" font-family="monospace" font-size="10" fill="%2364748B">P&lt;AUSJOHNSON&lt;&lt;DANIEL&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text></svg>';
const DEMO_PAYMENT_PROOF = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23F8FAFC"/><rect x="20" y="20" width="360" height="460" fill="%23ffffff" stroke="%23E2E8F0" rx="8"/><circle cx="200" cy="70" r="25" fill="%2310B981"/><path d="M190,70 L197,77 L212,62" fill="none" stroke="%23ffffff" stroke-width="3"/><text x="200" y="125" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230F172A" text-anchor="middle">TRANSFER SUCCESSFUL</text><text x="200" y="148" font-family="sans-serif" font-size="20" font-weight="bold" fill="%2310B981" text-anchor="middle">IDR 2,125,000</text><line x1="40" y1="170" x2="360" y2="170" stroke="%23E2E8F0"/><text x="40" y="205" font-family="sans-serif" font-size="12" fill="%2364748B">Bank: BCA (Bank Central Asia)</text><text x="40" y="235" font-family="sans-serif" font-size="12" fill="%2364748B">Beneficiary: PT HARRIS IJEN JAYA MANDIRI</text><text x="40" y="265" font-family="sans-serif" font-size="12" fill="%2364748B">Account: 180-293-8821</text><text x="40" y="295" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230F172A">Ref No: TRX-BCA-982144791</text><text x="40" y="325" font-family="sans-serif" font-size="12" fill="%2364748B">Date: 2026-10-18 10:14:22 WIB</text><rect x="40" y="370" width="320" height="60" fill="%23ECFDF5" rx="6"/><text x="200" y="405" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23059669" text-anchor="middle">VERIFIED ELECTRONIC RECEIPT</text></svg>';

const SEED_DATA_V2 = {
  guests: [
    {
      id: 'GST-1001',
      guestName: 'Adunni Lawson',
      country: 'United Kingdom',
      phone: '+44 7911 123456',
      email: 'adunni.lawson@example.com',
      passportNumber: 'UK98452109',
      passportPhoto: DEMO_PASSPORT_PHOTO_1,
      gender: 'Female',
      numberOfPeople: 2,
      passengers: [
        {
          name: 'Adunni Lawson',
          gender: 'Female',
          passportNumber: 'UK98452109',
          passportPhoto: DEMO_PASSPORT_PHOTO_1
        },
        {
          name: 'Tariq Lawson',
          gender: 'Male',
          passportNumber: 'UK98452110',
          passportPhoto: DEMO_PASSPORT_PHOTO_1
        }
      ],
      invoiceNumber: 'INV/HIJ/2026/09/001',
      tourPackageName: 'Ijen Blue Fire Midnight Tour & Sunrise',
      paymentAmount: 2500000,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid in Full',
      paymentLocation: 'Banyuwangi HQ Office',
      arrivalTime: '2026-09-12T14:30',
      pickupTime: '00:15 AM',
      pickupLocation: 'Hotel Santika Banyuwangi Lobby',
      finalDropOffLocation: 'Ketapang Ferry Port (Crossing to Bali)',
      specialNotes: 'Vegetarian breakfast requested, 2 gas masks size M, warm jacket provided',
      createdAt: '2026-09-08T10:20:00Z',
      recordedBy: 'ABDUL KHOLIK (HIC1620832016)'
    },
    {
      id: 'GST-1002',
      guestName: 'Johnson Daniel',
      country: 'Australia',
      phone: '+61 412 345 678',
      email: 'johnson.daniel@example.com',
      passportNumber: 'PA7731294',
      passportPhoto: DEMO_PASSPORT_PHOTO_2,
      gender: 'Male',
      numberOfPeople: 2,
      passengers: [
        {
          name: 'Johnson Daniel',
          gender: 'Male',
          passportNumber: 'PA7731294',
          passportPhoto: DEMO_PASSPORT_PHOTO_2
        },
        {
          name: 'Clara Daniel',
          gender: 'Female',
          passportNumber: 'PA7731295',
          passportPhoto: DEMO_PASSPORT_PHOTO_2
        }
      ],
      invoiceNumber: 'INV/HIJ/2026/09/002',
      tourPackageName: 'Mount Bromo & Ijen Crater Overland 3D2N',
      paymentAmount: 6800000,
      paymentMethod: 'Wise Transfer',
      paymentStatus: 'Paid in Full',
      paymentLocation: 'Online Payment Gateway',
      arrivalTime: '2026-09-08T11:00',
      pickupTime: '09:00 AM',
      pickupLocation: 'Banyuwangi Airport (BWX) Arrival Gate',
      finalDropOffLocation: 'Denpasar / Seminyak Hotel, Bali',
      specialNotes: 'Private 4x4 Jeep, warm jackets provided for 2 guests',
      createdAt: '2026-09-02T15:45:00Z',
      recordedBy: 'ANDIKA EKA PUTRA (HIC1620852024)'
    },
    {
      id: 'GST-1003',
      guestName: 'Deji Olatunji',
      country: 'Nigeria',
      phone: '+234 803 123 4567',
      email: 'deji.olatunji@example.com',
      passportNumber: 'A19384722',
      passportPhoto: DEMO_PASSPORT_PHOTO_1,
      gender: 'Male',
      numberOfPeople: 1,
      passengers: [
        {
          name: 'Deji Olatunji',
          gender: 'Male',
          passportNumber: 'A19384722',
          passportPhoto: DEMO_PASSPORT_PHOTO_1
        }
      ],
      invoiceNumber: 'INV/HIJ/2026/09/003',
      tourPackageName: 'Baluran African Van Java Safari & Ijen Tour',
      paymentAmount: 3900000,
      paymentMethod: 'Bank Transfer (BCA)',
      paymentStatus: 'Paid in Full',
      paymentLocation: 'Banyuwangi HQ Office',
      arrivalTime: '2026-09-05T16:00',
      pickupTime: '06:00 AM',
      pickupLocation: 'Ketapang Ferry Harbor Terminal 2',
      finalDropOffLocation: 'Banyuwangi Airport (BWX)',
      specialNotes: 'Needs drone flight photography documentation assistance',
      createdAt: '2026-09-01T09:12:00Z',
      recordedBy: 'ABDUL KHOLIK (HIC1620832016)'
    },
    {
      id: 'GST-1004',
      guestName: 'Sophie Moreau',
      country: 'France',
      phone: '+33 6 12 34 56 78',
      email: 'sophie.moreau@example.fr',
      passportNumber: 'FR55210984',
      passportPhoto: DEMO_PASSPORT_PHOTO_1,
      gender: 'Female',
      numberOfPeople: 2,
      passengers: [
        {
          name: 'Sophie Moreau',
          gender: 'Female',
          passportNumber: 'FR55210984',
          passportPhoto: DEMO_PASSPORT_PHOTO_1
        },
        {
          name: 'Julien Blanc',
          gender: 'Male',
          passportNumber: 'FR55210985',
          passportPhoto: DEMO_PASSPORT_PHOTO_2
        }
      ],
      invoiceNumber: 'INV/HIJ/2026/10/004',
      tourPackageName: 'Ijen Blue Fire Midnight Tour & Sunrise',
      paymentAmount: 2125000, // discounted from 2,500,000 (15% promo)
      originalAmount: 2500000,
      paymentMethod: 'Bank Transfer (BCA)',
      paymentStatus: 'Paid in Full',
      paymentLocation: 'Banyuwangi HQ Office',
      arrivalTime: '2026-10-18T19:00',
      pickupTime: '00:30 AM',
      pickupLocation: 'Dialoog Banyuwangi Hotel',
      finalDropOffLocation: 'Dialoog Banyuwangi Hotel',
      specialNotes: 'Discount approved (15% Early Bird). Proof of payment verified.',
      discountAmount: 375000,
      discountStatus: 'Approved',
      paymentRefNumber: 'TRX-BCA-982144791',
      paymentProofImage: DEMO_PAYMENT_PROOF,
      createdAt: '2026-10-10T14:20:00Z',
      recordedBy: 'SAMSUL MUARIF (HIC1907672015)'
    },
    {
      id: 'GST-1005',
      guestName: 'Klaus Schmidt',
      country: 'Germany',
      phone: '+49 151 23456789',
      email: 'klaus.schmidt@example.de',
      passportNumber: 'C19283746',
      passportPhoto: DEMO_PASSPORT_PHOTO_2,
      gender: 'Male',
      numberOfPeople: 1,
      passengers: [
        {
          name: 'Klaus Schmidt',
          gender: 'Male',
          passportNumber: 'C19283746',
          passportPhoto: DEMO_PASSPORT_PHOTO_2
        }
      ],
      invoiceNumber: 'INV/HIJ/2026/10/005',
      tourPackageName: 'Banyuwangi Heritage, Jagir Waterfall & Ijen',
      paymentAmount: 3200000,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Refund Requested',
      paymentLocation: 'Online Payment Gateway',
      arrivalTime: '2026-10-16T12:00',
      pickupTime: '01:00 AM',
      pickupLocation: 'Kokoon Hotel Banyuwangi',
      finalDropOffLocation: 'Stasiun Kereta Api Banyuwangi Kota',
      specialNotes: 'Guest had sudden flight cancellation at CGK Jakarta',
      createdAt: '2026-10-08T11:00:00Z',
      recordedBy: 'ABDUL KHOLIK (HIC1620832016)'
    },
    {
      id: 'GST-1006',
      guestName: 'Arief Wicaksono',
      country: 'Indonesia',
      phone: '+62 812 3456 7890',
      email: 'arief.wicaksono@example.com',
      passportNumber: 'W8849201',
      passportPhoto: DEMO_PASSPORT_PHOTO_2,
      gender: 'Male',
      numberOfPeople: 3,
      passengers: [
        { name: 'Arief Wicaksono', gender: 'Male', passportNumber: 'W8849201', passportPhoto: DEMO_PASSPORT_PHOTO_2 },
        { name: 'Siti Rahmawati', gender: 'Female', passportNumber: 'W8849202', passportPhoto: DEMO_PASSPORT_PHOTO_1 },
        { name: 'Rizky Wicaksono', gender: 'Male', passportNumber: 'W8849203', passportPhoto: DEMO_PASSPORT_PHOTO_2 }
      ],
      invoiceNumber: 'INV/HIJ/2026/10/006',
      tourPackageName: 'Ijen Blue Fire Family VIP Package',
      paymentAmount: 4500000,
      paymentMethod: 'Bank Transfer (Mandiri)',
      paymentStatus: 'Paid in Full',
      paymentLocation: 'Banyuwangi HQ Office',
      arrivalTime: '2026-10-20T17:30',
      pickupTime: '00:00 AM',
      pickupLocation: 'Stasiun Kereta Api Banyuwangi Kota',
      finalDropOffLocation: 'Hotel Santika Banyuwangi',
      specialNotes: 'Troli / gerobak dorong Ijen (sulky taxi) booked for elderly parent',
      createdAt: '2026-10-14T08:30:00Z',
      recordedBy: 'ANDIKA EKA PUTRA (HIC1620852024)'
    }
  ],
  discounts: [
    {
      id: 'DSC-2026-001',
      guestId: 'GST-1004',
      invoiceNumber: 'INV/HIJ/2026/10/004',
      guestName: 'Sophie Moreau',
      originalAmount: 2500000,
      discountType: 'percentage',
      discountValue: 15,
      discountAmount: 375000,
      finalAmount: 2125000,
      paymentRefNumber: 'TRX-BCA-982144791',
      paymentProofImage: DEMO_PAYMENT_PROOF,
      reason: 'Early bird promotion & 2 pax couple booking discount authorized for European market.',
      requestedBy: 'SAMSUL MUARIF (HIC1907672015)',
      requestedAt: '2026-10-10T15:00:00Z',
      status: 'Approved',
      approvedBy: 'MUHAMAD ABDUL HARIS, S.H., LL.M (HIC2502982017)',
      approvedAt: '2026-10-10T16:30:00Z',
      managerNotes: 'Approved 15% promotional rate.'
    },
    {
      id: 'DSC-2026-002',
      guestId: 'GST-1006',
      invoiceNumber: 'INV/HIJ/2026/10/006',
      guestName: 'Arief Wicaksono',
      originalAmount: 4500000,
      discountType: 'fixed',
      discountValue: 300000,
      discountAmount: 300000,
      finalAmount: 4200000,
      paymentRefNumber: 'MANDIRI-FT-7782103',
      paymentProofImage: DEMO_PAYMENT_PROOF,
      reason: 'Loyal customer return booking + 3 pax family group bundle.',
      requestedBy: 'ANDIKA EKA PUTRA (HIC1620852024)',
      requestedAt: '2026-10-14T09:00:00Z',
      status: 'Pending Approval',
      approvedBy: null,
      approvedAt: null,
      managerNotes: 'Awaiting Director review.'
    }
  ],
  cancellations: [
    {
      id: 'CAN-2026-001',
      guestId: 'GST-1005',
      invoiceNumber: 'INV/HIJ/2026/10/005',
      guestName: 'Klaus Schmidt',
      reason: 'Sudden domestic flight cancellation from Jakarta to Banyuwangi due to weather disruption; unable to reach Banyuwangi on schedule.',
      refundPercentage: 80,
      refundAmount: 2560000,
      originalAmount: 3200000,
      status: 'Pending Approval',
      requestedAt: '2026-10-15T10:15:00Z',
      requestedBy: 'ABDUL KHOLIK (HIC1620832016)',
      approvedAt: null,
      approvedBy: null,
      managerNotes: 'Pending leadership sign-off on 80% refund policy.'
    }
  ],
  reviews: [
    {
      id: 'REV-001',
      invoiceNumber: 'INV/HIJ/2026/09/001',
      guestName: 'Adunni Lawson',
      country: 'United Kingdom',
      location: 'Ikeja / Banyuwangi',
      date: 'September 12, 2025',
      rating: 5,
      tag: 'Ijen Blue Fire Midnight Tour',
      reviewText: 'Oliver, Harris and the Dolan Ijen team did an outstanding job! He arrived on time, was very professional, and completed the trek exactly as requested. The gas masks were clean and high quality, safety briefings were crystal clear, and the blue flame spectacle in the crater was breathtaking. Highly recommend Harris Ijen Tour to international travelers!',
      categories: {
        professionalism: 5,
        qualityOfWork: 5,
        timeliness: 5,
        communication: 5
      },
      helpfulCount: 12,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      response: {
        date: 'September 13, 2025',
        author: 'PT HARRIS IJEN JAYA MANDIRI Management',
        text: 'Dear Adunni, thank you sincerely for your glowing feedback! We are thrilled you enjoyed the Midnight Blue Fire trek and our team hospitality. Hope to welcome you back to East Java again!'
      }
    },
    {
      id: 'REV-002',
      invoiceNumber: 'INV/HIJ/2026/09/002',
      guestName: 'Johnson Daniel',
      country: 'Australia',
      location: 'Ajah / Bromo-Ijen',
      date: 'September 8, 2025',
      rating: 5,
      tag: 'Mount Bromo & Ijen Crater Overland',
      reviewText: 'Quick and efficient service. Emeka and Harris installed all 4 new itinerary legs smoothly and explained everything clearly. Fair pricing and excellent workmanship on logistics. Will definitely use their services again for Bali and Java tours.',
      categories: {
        professionalism: 5,
        qualityOfWork: 5,
        timeliness: 5,
        communication: 5
      },
      helpfulCount: 9,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      response: {
        date: 'September 9, 2025',
        author: 'PT HARRIS IJEN JAYA MANDIRI Operations',
        text: 'Thank you Daniel! It was our pleasure coordinating your 3D2N Bromo & Ijen journey. Have a safe flight back home!'
      }
    },
    {
      id: 'REV-003',
      invoiceNumber: 'INV/HIJ/2026/09/003',
      guestName: 'Deji Olatunji',
      country: 'Nigeria',
      location: 'Surulere / Baluran',
      date: 'September 5, 2025',
      rating: 4.8,
      tag: 'Baluran Safari & Ijen Tour',
      reviewText: 'Good work overall. The safari tour was great and the savanna animals were visible. Emeka was polite and professional. Only minor delay in arrival due to ferry traffic, but he called to inform me. Would recommend.',
      categories: {
        professionalism: 5,
        qualityOfWork: 5,
        timeliness: 4.5,
        communication: 5
      },
      helpfulCount: 7,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
      response: {
        date: 'September 6, 2025',
        author: 'PT HARRIS IJEN JAYA MANDIRI Management',
        text: 'Thanks Deji for the honest feedback! We take timeliness very seriously and ferry crossing congestion is something we continuously optimize with advance ticketing. Safe travels!'
      }
    }
  ],
  financials: [
    {
      id: 'FIN-101',
      type: 'Income',
      category: 'Tour Booking',
      invoiceNumber: 'INV/HIJ/2026/09/001',
      guestName: 'Adunni Lawson',
      amount: 2500000,
      date: '2026-09-08',
      paymentMethod: 'Credit Card',
      status: 'Received',
      description: 'Payment for Ijen Blue Fire Midnight Tour (2 Pax)'
    },
    {
      id: 'FIN-102',
      type: 'Income',
      category: 'Tour Booking',
      invoiceNumber: 'INV/HIJ/2026/09/002',
      guestName: 'Johnson Daniel',
      amount: 6800000,
      date: '2026-09-02',
      paymentMethod: 'Wise Transfer',
      status: 'Received',
      description: 'Payment for Bromo & Ijen 3D2N (2 Pax)'
    },
    {
      id: 'FIN-103',
      type: 'Income',
      category: 'Tour Booking',
      invoiceNumber: 'INV/HIJ/2026/09/003',
      guestName: 'Deji Olatunji',
      amount: 3900000,
      date: '2026-09-01',
      paymentMethod: 'Bank Transfer (BCA)',
      status: 'Received',
      description: 'Payment for Baluran & Ijen Safari (1 Pax)'
    },
    {
      id: 'FIN-104',
      type: 'Income',
      category: 'Tour Booking',
      invoiceNumber: 'INV/HIJ/2026/10/004',
      guestName: 'Sophie Moreau',
      amount: 2125000,
      date: '2026-10-10',
      paymentMethod: 'Bank Transfer (BCA)',
      status: 'Received (Discounted)',
      description: 'Payment for Ijen Blue Fire (2 Pax, 15% Promo)'
    },
    {
      id: 'FIN-105',
      type: 'Income',
      category: 'Tour Booking',
      invoiceNumber: 'INV/HIJ/2026/10/006',
      guestName: 'Arief Wicaksono',
      amount: 4500000,
      date: '2026-10-14',
      paymentMethod: 'Bank Transfer (Mandiri)',
      status: 'Received',
      description: 'Payment for Ijen VIP Family Package (3 Pax)'
    },
    {
      id: 'FIN-EXP-01',
      type: 'Expense',
      category: 'Park Entrance & Ranger Tickets',
      invoiceNumber: 'EXP/BKSDA/26/01',
      guestName: 'BKSDA Ijen & Baluran',
      amount: 2850000,
      date: '2026-09-10',
      paymentMethod: 'Online Payment',
      status: 'Completed',
      description: 'Simaksi Natural Reserve Entrance Tickets & Local Ranger fees'
    },
    {
      id: 'FIN-EXP-02',
      type: 'Expense',
      category: 'Transport & Fuel',
      invoiceNumber: 'EXP/TRAN/26/02',
      guestName: 'Pertamina & 4x4 Troop',
      amount: 1750000,
      date: '2026-09-11',
      paymentMethod: 'Cash',
      status: 'Completed',
      description: 'Jeep 4WD fuel and shuttle rental across Paltuding'
    }
  ],
  auditLogs: [
    {
      id: 'AUD-901',
      timestamp: '2026-10-21 21:45:21',
      username: 'haris_director',
      fullName: 'MUHAMAD ABDUL HARIS, S.H., LL.M',
      role: 'BUSINESS OWNER (HIC2502982017)',
      action: 'Portal Login Successful',
      ipAddress: '180.252.164.21',
      userAgent: 'Chrome 130.0 Win11',
      status: 'Success'
    },
    {
      id: 'AUD-902',
      timestamp: '2026-10-21 20:10:05',
      username: 'ida_marketing',
      fullName: 'IDA AYU PUTRI SARASWATI, S.H., LL.M',
      role: 'MARKETING MANAGER (HIC2104682023)',
      action: 'Reviewed Discount Request DSC-2026-002',
      ipAddress: '180.252.164.21',
      userAgent: 'Chrome 130.0 Win11',
      status: 'Success'
    },
    {
      id: 'AUD-903',
      timestamp: '2026-10-21 19:30:12',
      username: 'abdul_guide',
      fullName: 'ABDUL KHOLIK',
      role: 'TOUR LEADER GUIDE (HIC1620832016)',
      action: 'Uploaded Guest Passport Photos for GST-1001',
      ipAddress: '114.122.45.89',
      userAgent: 'Mobile Safari iOS 18.0',
      status: 'Success'
    }
  ],
  blogspotConfig: {
    blogId: '3136808355151123445',
    blogUrl: 'https://www.harrisijentourandtravel.com',
    employeePageUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    defaultLabels: 'Ijen Tour, Mount Ijen Blue Fire, Harris Ijen, Banyuwangi Travel',
    autoPublishReviews: true,
    postTitleTemplate: '[Travel Review] {guestName} from {country} - {package}'
  },
  settings: {
    companyName: 'PT HARRIS IJEN JAYA MANDIRI',
    brandName: 'Harris Ijen Tour & Travel',
    tagline: 'Hukum • Travel Agent • Jasa Visa • Banyuwangi, Jawa Timur',
    address: 'Jl. Raya Ijen No. 88, Licin, Banyuwangi, Jawa Timur 68454',
    phone: '+62 812-3456-7890',
    email: 'info@harrisijentourandtravel.com',
    website: 'https://www.harrisijentourandtravel.com',
    employeeDirectoryUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    googleSheetSyncUrl: '', // Google Apps Script Web App URL
    autoSyncIntervalMinutes: 5,
    lastSyncTime: new Date().toISOString()
  }
};

class HarrisDatabase {
  constructor() {
    this.data = this.loadDatabase();
  }

  loadDatabase() {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure discounts array exists
        if (!parsed.discounts) parsed.discounts = SEED_DATA_V2.discounts;
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using seed data', e);
    }
    this.saveDatabase(SEED_DATA_V2);
    return JSON.parse(JSON.stringify(SEED_DATA_V2));
  }

  saveDatabase(dataToSave) {
    const data = dataToSave || this.data;
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('harris_db_updated', { detail: { timestamp: new Date().toISOString() } }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- Guest Operations (Requirement 2) ---
  getGuests() {
    return this.data.guests || [];
  }

  getGuestById(id) {
    return this.data.guests.find(g => g.id === id);
  }

  getGuestByInvoice(invoiceNumber) {
    if (!invoiceNumber) return null;
    return this.data.guests.find(g => g.invoiceNumber.trim().toUpperCase() === invoiceNumber.trim().toUpperCase());
  }

  getGuestByEmail(email) {
    if (!email) return null;
    return this.data.guests.find(g => g.email.trim().toLowerCase() === email.trim().toLowerCase());
  }

  searchGuests(query) {
    if (!query) return this.getGuests();
    const q = query.toLowerCase().trim();
    return this.getGuests().filter(g => 
      (g.guestName && g.guestName.toLowerCase().includes(q)) ||
      (g.invoiceNumber && g.invoiceNumber.toLowerCase().includes(q)) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.passportNumber && g.passportNumber.toLowerCase().includes(q)) ||
      (g.phone && g.phone.toLowerCase().includes(q)) ||
      (g.country && g.country.toLowerCase().includes(q)) ||
      (g.tourPackageName && g.tourPackageName.toLowerCase().includes(q)) ||
      (g.pickupLocation && g.pickupLocation.toLowerCase().includes(q)) ||
      (g.finalDropOffLocation && g.finalDropOffLocation.toLowerCase().includes(q))
    );
  }

  addGuest(guestData) {
    const newGuest = {
      id: 'GST-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      gender: guestData.gender || 'Male',
      numberOfPeople: Number(guestData.numberOfPeople) || 1,
      passengers: guestData.passengers || [
        {
          name: guestData.guestName,
          gender: guestData.gender || 'Male',
          passportNumber: guestData.passportNumber,
          passportPhoto: guestData.passportPhoto || null
        }
      ],
      paymentLocation: guestData.paymentLocation || 'Banyuwangi HQ Office',
      finalDropOffLocation: guestData.finalDropOffLocation || 'Banyuwangi Airport (BWX)',
      ...guestData
    };

    this.data.guests.unshift(newGuest);

    // Auto-record financial income if paid
    if (newGuest.paymentAmount > 0 && (newGuest.paymentStatus === 'Paid in Full' || newGuest.paymentStatus === 'Partial / Deposit')) {
      this.addFinancialRecord({
        type: 'Income',
        category: 'Tour Booking',
        invoiceNumber: newGuest.invoiceNumber,
        guestName: newGuest.guestName,
        amount: Number(newGuest.paymentAmount),
        date: new Date().toISOString().split('T')[0],
        paymentMethod: newGuest.paymentMethod,
        status: newGuest.paymentStatus,
        description: `Booking for ${newGuest.tourPackageName} (${newGuest.numberOfPeople} Pax)`
      });
    }

    this.saveDatabase();
    return newGuest;
  }

  updateGuest(id, updatedFields) {
    const idx = this.data.guests.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.data.guests[idx] = { ...this.data.guests[idx], ...updatedFields };
      this.saveDatabase();
      return this.data.guests[idx];
    }
    return null;
  }

  deleteGuest(id) {
    const idx = this.data.guests.findIndex(g => g.id === id);
    if (idx !== -1) {
      const removed = this.data.guests.splice(idx, 1);
      this.saveDatabase();
      return removed[0];
    }
    return null;
  }

  // --- Discount Requests & Approvals (Requirement 3 & 5) ---
  getDiscounts() {
    return this.data.discounts || [];
  }

  getDiscountById(id) {
    return this.data.discounts.find(d => d.id === id);
  }

  getPendingDiscountsCount() {
    return this.getDiscounts().filter(d => d.status === 'Pending Approval').length;
  }

  requestDiscount({ guestId, invoiceNumber, guestName, discountType, discountValue, discountAmount, paymentRefNumber, proofImage, reason, requestedBy }) {
    const guest = this.getGuestById(guestId) || this.getGuestByInvoice(invoiceNumber);
    const origAmt = guest ? Number(guest.originalAmount || guest.paymentAmount) : 0;
    const discAmt = Number(discountAmount);
    const finalAmt = Math.max(0, origAmt - discAmt);

    const newDiscount = {
      id: 'DSC-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      guestId: guest ? guest.id : guestId,
      invoiceNumber: invoiceNumber,
      guestName: guestName,
      originalAmount: origAmt,
      discountType: discountType || 'fixed',
      discountValue: Number(discountValue),
      discountAmount: discAmt,
      finalAmount: finalAmt,
      paymentRefNumber: paymentRefNumber.trim(),
      paymentProofImage: proofImage || null,
      reason: reason.trim(),
      requestedBy: requestedBy || 'Employee',
      requestedAt: new Date().toISOString(),
      status: 'Pending Approval',
      approvedBy: null,
      approvedAt: null,
      managerNotes: ''
    };

    if (!this.data.discounts) this.data.discounts = [];
    this.data.discounts.unshift(newDiscount);

    // Update guest record with pending discount status
    if (guest) {
      this.updateGuest(guest.id, {
        discountStatus: 'Pending Approval',
        pendingDiscountAmount: discAmt,
        paymentRefNumber: paymentRefNumber.trim(),
        paymentProofImage: proofImage || guest.paymentProofImage
      });
    }

    this.saveDatabase();
    return newDiscount;
  }

  approveDiscount(discountId, managerName, notes = '') {
    const discount = this.data.discounts.find(d => d.id === discountId);
    if (!discount) return null;

    discount.status = 'Approved';
    discount.approvedBy = managerName;
    discount.approvedAt = new Date().toISOString();
    discount.managerNotes = notes;

    // Apply discount to guest booking
    const guest = this.getGuestById(discount.guestId) || this.getGuestByInvoice(discount.invoiceNumber);
    if (guest) {
      if (!guest.originalAmount) guest.originalAmount = guest.paymentAmount;
      guest.paymentAmount = discount.finalAmount;
      guest.discountAmount = discount.discountAmount;
      guest.discountStatus = 'Approved';
      guest.paymentRefNumber = discount.paymentRefNumber;
      if (discount.paymentProofImage) guest.paymentProofImage = discount.paymentProofImage;
      this.updateGuest(guest.id, guest);
    }

    // Adjust financial record if exists
    const fin = this.data.financials.find(f => f.invoiceNumber === discount.invoiceNumber);
    if (fin) {
      fin.amount = discount.finalAmount;
      fin.description += ` (Discount IDR ${discount.discountAmount.toLocaleString('id-ID')} applied)`;
    }

    this.saveDatabase();
    return discount;
  }

  rejectDiscount(discountId, managerName, rejectionReason = '') {
    const discount = this.data.discounts.find(d => d.id === discountId);
    if (!discount) return null;

    discount.status = 'Rejected';
    discount.approvedBy = managerName;
    discount.approvedAt = new Date().toISOString();
    discount.managerNotes = rejectionReason;

    // Revert guest discount status
    const guest = this.getGuestById(discount.guestId) || this.getGuestByInvoice(discount.invoiceNumber);
    if (guest) {
      this.updateGuest(guest.id, {
        discountStatus: 'Rejected'
      });
    }

    this.saveDatabase();
    return discount;
  }

  // --- Uploaded Files & Vault Operations (Requirement 6) ---
  getAllUploadedFiles() {
    const files = [];

    // Collect passport photos
    this.getGuests().forEach(guest => {
      // Primary passport photo
      if (guest.passportPhoto) {
        files.push({
          id: `FILE-PP-${guest.id}-1`,
          guestId: guest.id,
          invoiceNumber: guest.invoiceNumber,
          guestName: guest.guestName,
          travelerName: guest.guestName,
          passportNumber: guest.passportNumber,
          type: 'Passport Photo',
          category: 'passport',
          fileData: guest.passportPhoto,
          fileName: `Passport_${guest.guestName.replace(/\s+/g, '_')}_${guest.passportNumber}.svg`,
          date: guest.createdAt || '2026-10-18',
          uploadedBy: guest.recordedBy || 'Staff'
        });
      }

      // Additional passengers passport photos
      if (guest.passengers && Array.isArray(guest.passengers)) {
        guest.passengers.forEach((p, idx) => {
          if (idx > 0 && p.passportPhoto) {
            files.push({
              id: `FILE-PP-${guest.id}-${idx + 1}`,
              guestId: guest.id,
              invoiceNumber: guest.invoiceNumber,
              guestName: guest.guestName,
              travelerName: p.name,
              passportNumber: p.passportNumber,
              type: 'Passport Photo',
              category: 'passport',
              fileData: p.passportPhoto,
              fileName: `Passport_${p.name.replace(/\s+/g, '_')}_${p.passportNumber}.svg`,
              date: guest.createdAt || '2026-10-18',
              uploadedBy: guest.recordedBy || 'Staff'
            });
          }
        });
      }

      // Proof of payment
      if (guest.paymentProofImage) {
        files.push({
          id: `FILE-PROOF-${guest.id}`,
          guestId: guest.id,
          invoiceNumber: guest.invoiceNumber,
          guestName: guest.guestName,
          travelerName: guest.guestName,
          passportNumber: guest.paymentRefNumber || 'N/A',
          type: 'Proof of Payment',
          category: 'payment_proof',
          fileData: guest.paymentProofImage,
          fileName: `Receipt_${guest.invoiceNumber.replace(/\//g, '_')}.svg`,
          date: guest.createdAt || '2026-10-18',
          uploadedBy: guest.recordedBy || 'Staff'
        });
      }
    });

    // Collect proof from discount requests
    this.getDiscounts().forEach(disc => {
      if (disc.paymentProofImage && !files.some(f => f.fileData === disc.paymentProofImage)) {
        files.push({
          id: `FILE-DISC-${disc.id}`,
          guestId: disc.guestId,
          invoiceNumber: disc.invoiceNumber,
          guestName: disc.guestName,
          travelerName: disc.guestName,
          passportNumber: `Ref: ${disc.paymentRefNumber}`,
          type: 'Discount Payment Proof',
          category: 'discount_proof',
          fileData: disc.paymentProofImage,
          fileName: `DiscountProof_${disc.id}_${disc.paymentRefNumber}.svg`,
          date: disc.requestedAt,
          uploadedBy: disc.requestedBy
        });
      }
    });

    return files;
  }

  // --- Cancellation & Refund Operations ---
  getCancellations() {
    return this.data.cancellations || [];
  }

  requestCancellation({ guestId, invoiceNumber, guestName, reason, refundPercentage, refundAmount, requestedBy }) {
    const guest = this.getGuestById(guestId) || this.getGuestByInvoice(invoiceNumber);
    const newReq = {
      id: 'CAN-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      guestId: guest ? guest.id : guestId,
      invoiceNumber: invoiceNumber,
      guestName: guestName,
      reason: reason,
      refundPercentage: Number(refundPercentage),
      refundAmount: Number(refundAmount),
      originalAmount: guest ? Number(guest.paymentAmount) : Number(refundAmount),
      status: 'Pending Approval',
      requestedAt: new Date().toISOString(),
      requestedBy: requestedBy || 'staff',
      approvedAt: null,
      approvedBy: null,
      managerNotes: ''
    };

    this.data.cancellations.unshift(newReq);

    if (guest) {
      this.updateGuest(guest.id, { paymentStatus: 'Refund Requested' });
    }

    this.saveDatabase();
    return newReq;
  }

  approveCancellation(cancellationId, managerName, notes = '') {
    const item = this.data.cancellations.find(c => c.id === cancellationId);
    if (item) {
      item.status = 'Approved';
      item.approvedAt = new Date().toISOString();
      item.approvedBy = managerName;
      item.managerNotes = notes;

      const guest = this.getGuestById(item.guestId) || this.getGuestByInvoice(item.invoiceNumber);
      if (guest) {
        this.updateGuest(guest.id, { paymentStatus: 'Refunded' });
      }

      this.addFinancialRecord({
        type: 'Refund',
        category: 'Guest Refund Payout',
        invoiceNumber: item.invoiceNumber,
        guestName: item.guestName,
        amount: item.refundAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer (Refund)',
        status: 'Approved & Processed',
        description: `Approved cancellation refund (${item.refundPercentage}%) for ${item.guestName}`
      });

      this.saveDatabase();
      return item;
    }
    return null;
  }

  rejectCancellation(cancellationId, managerName, rejectionReason) {
    const item = this.data.cancellations.find(c => c.id === cancellationId);
    if (item) {
      item.status = 'Rejected';
      item.approvedAt = new Date().toISOString();
      item.approvedBy = managerName;
      item.managerNotes = rejectionReason;

      const guest = this.getGuestById(item.guestId) || this.getGuestByInvoice(item.invoiceNumber);
      if (guest) {
        this.updateGuest(guest.id, { paymentStatus: 'Paid in Full' });
      }

      this.saveDatabase();
      return item;
    }
    return null;
  }

  // --- Reviews Operations ---
  getReviews() {
    return this.data.reviews || [];
  }

  addReview(reviewData) {
    const newRev = {
      id: 'REV-' + Math.floor(100 + Math.random() * 900),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewData.guestName)}&backgroundColor=0b2545,13315c`,
      response: null,
      ...reviewData
    };

    this.data.reviews.unshift(newRev);
    this.saveDatabase();
    return newRev;
  }

  replyToReview(reviewId, author, text) {
    const rev = this.data.reviews.find(r => r.id === reviewId);
    if (rev) {
      rev.response = {
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        author: author || 'PT HARRIS IJEN JAYA MANDIRI Management',
        text: text
      };
      this.saveDatabase();
      return rev;
    }
    return null;
  }

  voteReviewHelpful(reviewId) {
    const rev = this.data.reviews.find(r => r.id === reviewId);
    if (rev) {
      rev.helpfulCount = (rev.helpfulCount || 0) + 1;
      this.saveDatabase();
      return rev.helpfulCount;
    }
    return 0;
  }

  getReviewMetrics() {
    const revs = this.getReviews();
    if (revs.length === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        fiveStarPercent: 100,
        monthRating: 5.0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categoryAverages: { professionalism: 5.0, qualityOfWork: 5.0, timeliness: 5.0, communication: 5.0 }
      };
    }

    let sum = 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let catSums = { professionalism: 0, qualityOfWork: 0, timeliness: 0, communication: 0 };
    let catCounts = { professionalism: 0, qualityOfWork: 0, timeliness: 0, communication: 0 };

    revs.forEach(r => {
      const rounded = Math.round(r.rating);
      if (breakdown[rounded] !== undefined) breakdown[rounded]++;
      sum += r.rating;

      if (r.categories) {
        if (r.categories.professionalism) { catSums.professionalism += r.categories.professionalism; catCounts.professionalism++; }
        if (r.categories.qualityOfWork) { catSums.qualityOfWork += r.categories.qualityOfWork; catCounts.qualityOfWork++; }
        if (r.categories.timeliness) { catSums.timeliness += r.categories.timeliness; catCounts.timeliness++; }
        if (r.categories.communication) { catSums.communication += r.categories.communication; catCounts.communication++; }
      }
    });

    const averageRating = (sum / revs.length).toFixed(1);
    const fiveStarPercent = Math.round(((breakdown[5] || 0) / revs.length) * 100);

    return {
      averageRating: parseFloat(averageRating),
      totalReviews: revs.length,
      fiveStarPercent,
      monthRating: parseFloat(averageRating),
      breakdown,
      categoryAverages: {
        professionalism: catCounts.professionalism ? (catSums.professionalism / catCounts.professionalism).toFixed(1) : '5.0',
        qualityOfWork: catCounts.qualityOfWork ? (catSums.qualityOfWork / catCounts.qualityOfWork).toFixed(1) : '5.0',
        timeliness: catCounts.timeliness ? (catSums.timeliness / catCounts.timeliness).toFixed(1) : '4.8',
        communication: catCounts.communication ? (catSums.communication / catCounts.communication).toFixed(1) : '5.0'
      }
    };
  }

  // --- Financial Module ---
  getFinancials() {
    return this.data.financials || [];
  }

  addFinancialRecord(record) {
    const newRec = {
      id: 'FIN-' + Math.floor(1000 + Math.random() * 9000),
      ...record
    };
    this.data.financials.unshift(newRec);
    this.saveDatabase();
    return newRec;
  }

  getFinancialSummary() {
    const list = this.getFinancials();
    let grossIncome = 0;
    let totalExpenses = 0;
    let totalRefunds = 0;

    list.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'Income') {
        grossIncome += amt;
      } else if (item.type === 'Refund') {
        totalRefunds += amt;
      } else if (item.type === 'Expense') {
        totalExpenses += amt;
      }
    });

    const netProfit = grossIncome - totalExpenses - totalRefunds;

    return {
      grossIncome,
      totalExpenses,
      totalRefunds,
      netProfit,
      transactionCount: list.length
    };
  }

  // --- Audit Log Operations ---
  getAuditLogs() {
    return this.data.auditLogs || [];
  }

  logActivity({ username, fullName, role, action, status = 'Success', ipAddress = null }) {
    const newLog = {
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      username: username || 'system',
      fullName: fullName || 'System Automated',
      role: role || 'System',
      action: action,
      ipAddress: ipAddress || (window.location.hostname === 'localhost' ? '127.0.0.1 (Local)' : '180.252.164.21'),
      userAgent: navigator.userAgent.substring(0, 45) + '...',
      status: status
    };

    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
    this.saveDatabase();
    return newLog;
  }

  // --- Settings & Cloud Sync ---
  getBlogspotConfig() {
    return this.data.blogspotConfig || {};
  }

  updateBlogspotConfig(newConfig) {
    this.data.blogspotConfig = { ...this.data.blogspotConfig, ...newConfig };
    this.saveDatabase();
  }

  getSettings() {
    return this.data.settings || {};
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveDatabase();
  }

  // Export JSON Backup
  exportDatabaseJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `harris_ijen_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Export Guests CSV with all comprehensive fields
  exportGuestsCSV() {
    const guests = this.getGuests();
    if (!guests.length) return;
    
    const headers = [
      'ID', 'Invoice Number', 'Guest Name', 'Gender', 'Pax Count', 'Country', 'Phone', 'Email',
      'Passport Number', 'Tour Package', 'Payment Amount (IDR)', 'Discount (IDR)', 'Payment Method',
      'Payment Status', 'Payment Location', 'Arrival Time', 'Pickup Time', 'Pickup Location',
      'Final Drop-off Location', 'Special Notes'
    ];

    const rows = guests.map(g => [
      g.id,
      `"${g.invoiceNumber}"`,
      `"${g.guestName}"`,
      `"${g.gender || 'Male'}"`,
      g.numberOfPeople || 1,
      `"${g.country}"`,
      `"${g.phone}"`,
      `"${g.email}"`,
      `"${g.passportNumber}"`,
      `"${g.tourPackageName}"`,
      g.paymentAmount,
      g.discountAmount || 0,
      `"${g.paymentMethod}"`,
      `"${g.paymentStatus}"`,
      `"${g.paymentLocation || '-'}"`,
      `"${g.arrivalTime}"`,
      `"${g.pickupTime}"`,
      `"${g.pickupLocation}"`,
      `"${g.finalDropOffLocation || '-'}"`,
      `"${(g.specialNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `harris_ijen_guests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  importDatabaseJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.guests && Array.isArray(parsed.guests)) {
        this.data = parsed;
        this.saveDatabase();
        return { success: true, count: parsed.guests.length };
      }
      throw new Error('Invalid database format');
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA_V2));
    this.saveDatabase();
  }
}

// Global Singleton Instance
window.db = new HarrisDatabase();
