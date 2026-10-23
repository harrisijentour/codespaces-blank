/**
 * Harris Ijen Admin Company Portal - Authentication & RBAC Module
 * PT HARRIS IJEN JAYA MANDIRI
 * Official Employee Data Reference: https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html
 */

const AUTH_STORAGE_KEY = 'HARRIS_IJEN_AUTH_USER_V2';

// Official Employee Directory from PT Harris Ijen Jaya Mandiri
const SYSTEM_USERS = [
  {
    username: 'haris_director',
    employeeNumber: 'HIC2502982017',
    password: 'password123',
    fullName: 'MUHAMAD ABDUL HARIS, S.H., LL.M',
    alias: 'I Gusti Haris Pradana, S.H.',
    position: 'BUSINESS OWNER & FOUNDER',
    role: 'director',
    roleLabel: 'Company Leadership (Director)',
    avatar: 'assets/img/logo.png',
    profileUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEggoKdqmT1lUVukLiMufm-QF3sbBPSVuYcaa3rnLTY85A9faZ85CkJZotcdQuA75uBNBpdJOeI0-ehYN_zxepR3LTwrUHQ8ScQjI14psDg6Vc6bshSnz9DZWAkyyM7xlB77j4kAyPUYptGpqfPOFBsG-J6RW8tF4ma0-Q3mJ6_jOHJKOjRowDenYSboPDg/s450/i-gusti-nyoman-haris-pradana11.jpg',
    phone: '+62 812-4994-9035',
    permissions: ['all']
  },
  {
    username: 'ida_marketing',
    employeeNumber: 'HIC2104682023',
    password: 'password123',
    fullName: 'IDA AYU PUTRI SARASWATI, S.H., LL.M',
    alias: 'Ida Ayu Putri',
    position: 'MARKETING MANAGER',
    role: 'admin',
    roleLabel: 'Marketing Manager & Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IdaAyu&gender=female',
    profileUrl: 'https://www.harrisijentourandtravel.com/p/ida-ayu-putri-saraswati-sh-llm.html',
    phone: '+62 813-9876-5432',
    permissions: ['guests', 'invoices', 'scanner', 'cancellations', 'discounts', 'approve_discount', 'reviews', 'finance', 'audit_logs', 'files', 'blogspot', 'settings']
  },
  {
    username: 'nurina_brand',
    employeeNumber: 'HIC1211882018',
    password: 'password123',
    fullName: 'NURINA YULIANA, S.H.',
    alias: 'Nurina Yuliana',
    position: 'BRAND MANAGER',
    role: 'admin',
    roleLabel: 'Brand Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nurina&gender=female',
    profileUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    phone: '+62 812-7788-9900',
    permissions: ['guests', 'invoices', 'scanner', 'cancellations', 'discounts', 'approve_discount', 'reviews', 'files', 'blogspot']
  },
  {
    username: 'rapii_ops',
    employeeNumber: 'HIC3105602017',
    password: 'password123',
    fullName: "RAPI'I",
    alias: 'Rapii Pradana',
    position: 'DIREKTUR OPERASIONAL',
    role: 'director',
    roleLabel: 'Direktur Operasional',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rapii',
    profileUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    phone: '+62 811-2233-4455',
    permissions: ['all']
  },
  {
    username: 'nurul_legal',
    employeeNumber: 'HIC2104682023',
    password: 'password123',
    fullName: 'NURUL SAFII, S.H., M.H.',
    alias: 'Nurul Safii',
    position: 'LEGAL BUSINESS CONSULTANT',
    role: 'admin',
    roleLabel: 'Legal Business',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nurul',
    profileUrl: 'https://scholar.google.com/citations?user=xy4KL04AAAAJ&hl=en',
    phone: '+62 819-3344-5566',
    permissions: ['guests', 'invoices', 'cancellations', 'discounts', 'reviews', 'files']
  },
  {
    username: 'samsul_bali',
    employeeNumber: 'HIC1907672015',
    password: 'password123',
    fullName: 'SAMSUL MUARIF',
    alias: 'Samsul Muarif',
    position: 'BALI SENIOR SUPERVISOR',
    role: 'staff',
    roleLabel: 'Bali Senior Supervisor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samsul',
    profileUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    phone: '+62 851-0022-3344',
    permissions: ['guests', 'invoices', 'scanner', 'discounts', 'files', 'reviews']
  },
  {
    username: 'abdul_guide',
    employeeNumber: 'HIC1620832016',
    password: 'password123',
    fullName: 'ABDUL KHOLIK',
    alias: 'Abdul Kholik',
    position: 'TOUR LEADER GUIDE',
    role: 'staff',
    roleLabel: 'Tour Leader Guide (Operations)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AbdulKholik',
    profileUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    phone: '+62 852-3344-5566',
    permissions: ['guests', 'invoices', 'scanner', 'discounts', 'files', 'reviews']
  },
  {
    username: 'andika_guide',
    employeeNumber: 'HIC1620852024',
    password: 'password123',
    fullName: 'ANDIKA EKA PUTRA',
    alias: 'Andika Eka',
    position: 'TOUR GUIDE',
    role: 'staff',
    roleLabel: 'Tour Guide (Field Operations)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andika',
    profileUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    phone: '+62 853-4455-6677',
    permissions: ['guests', 'invoices', 'scanner', 'discounts', 'files', 'reviews']
  },
  {
    username: 'admin',
    employeeNumber: 'HIC-ADM-2026',
    password: 'password123',
    fullName: 'Company System Administrator',
    alias: 'Admin',
    position: 'SYSTEM ADMINISTRATOR',
    role: 'admin',
    roleLabel: 'Company Administrator',
    avatar: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvAZltJDE2L2lJriYeJvYcUAc6As8Xk35glSlZiSUBVjgrXsIiVmJkbGGd0_It8EmTWZsbpzXKYkv3mauCyL85V8KV46KKUlDKLjVXplF1iB1j6R2VWXWVm6dgtJke09OVcwJ-D9f-EsQauVVq0xEa4xr9Imk8bPEtUP2Ul9Dvpaw5III199pVP6AnCjU/s450/i-putu-putra-arythan.jpg',
    profileUrl: 'https://www.harrisijentourandtravel.com/p/employee-data-pt-harris-ijen-jaya.html',
    phone: '+62 812-3456-7899',
    permissions: ['all']
  },
  {
    username: 'guest',
    employeeNumber: 'GUEST-PUBLIC',
    password: 'guest',
    fullName: 'Valued Guest / Traveler',
    alias: 'Traveler',
    position: 'TOUR GUEST',
    role: 'guest',
    roleLabel: 'Guest Traveler',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GuestUser',
    profileUrl: 'https://www.harrisijentourandtravel.com/',
    phone: '-',
    permissions: ['reviews', 'lookup']
  }
];

class HarrisAuth {
  constructor() {
    this.currentUser = this.loadSession();
    // Default to Muhamad Abdul Haris if session not initialized
    if (!this.currentUser) {
      this.currentUser = SYSTEM_USERS[0]; // Business Owner
    }
  }

  loadSession() {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Session load error', e);
    }
    return null;
  }

  login(identifier, password, rememberMe = false) {
    const idClean = identifier.trim().toLowerCase();
    
    // Allow login by Username OR Employee Number (e.g. HIC2502982017)
    const user = SYSTEM_USERS.find(u => 
      (u.username.toLowerCase() === idClean || u.employeeNumber.toLowerCase() === idClean) && 
      u.password === password
    );

    if (user) {
      const sessionUser = {
        username: user.username,
        employeeNumber: user.employeeNumber,
        fullName: user.fullName,
        alias: user.alias,
        position: user.position,
        role: user.role,
        roleLabel: user.roleLabel,
        avatar: user.avatar,
        profileUrl: user.profileUrl,
        phone: user.phone,
        permissions: user.permissions,
        loginTime: new Date().toISOString()
      };

      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      }

      this.currentUser = sessionUser;

      // Log successful login to Audit Logs
      if (window.db) {
        window.db.logActivity({
          username: user.username,
          fullName: user.fullName,
          role: `${user.position} (${user.employeeNumber})`,
          action: 'Portal Login Successful',
          status: 'Success'
        });
      }

      window.dispatchEvent(new CustomEvent('harris_auth_changed', { detail: { user: sessionUser } }));
      return { success: true, user: sessionUser };
    }

    // Log failed login attempt
    if (window.db) {
      window.db.logActivity({
        username: identifier,
        fullName: 'Unknown User',
        role: 'Unknown',
        action: `Failed Login Attempt (ID: ${identifier})`,
        status: 'Failed'
      });
    }

    return { success: false, message: 'Invalid User ID / Employee Number or password. Please try again.' };
  }

  logout() {
    if (this.currentUser && window.db) {
      window.db.logActivity({
        username: this.currentUser.username,
        fullName: this.currentUser.fullName,
        role: `${this.currentUser.position} (${this.currentUser.employeeNumber})`,
        action: 'Portal Logged Out',
        status: 'Success'
      });
    }

    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.currentUser = null;

    window.dispatchEvent(new CustomEvent('harris_auth_changed', { detail: { user: null } }));
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getUser() {
    return this.currentUser;
  }

  hasPermission(permission) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'director' || (this.currentUser.permissions && this.currentUser.permissions.includes('all'))) {
      return true;
    }
    return this.currentUser.permissions && this.currentUser.permissions.includes(permission);
  }

  canAccessFinance() {
    return this.isLoggedIn() && ['director', 'admin'].includes(this.currentUser.role);
  }

  canAccessAuditLogs() {
    return this.isLoggedIn() && ['director', 'admin'].includes(this.currentUser.role);
  }

  canApproveDiscount() {
    return this.isLoggedIn() && ['director', 'admin'].includes(this.currentUser.role);
  }

  canApproveRefund() {
    return this.isLoggedIn() && ['director', 'admin'].includes(this.currentUser.role);
  }

  isEmployee() {
    return this.isLoggedIn() && this.currentUser.role !== 'guest';
  }
}

// Global Auth Instance
window.auth = new HarrisAuth();
window.SYSTEM_USERS = SYSTEM_USERS;
