import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'csc_database.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  let fileBuffer: Buffer | null = null;

  if (fs.existsSync(DB_FILE)) {
    try {
      fileBuffer = fs.readFileSync(DB_FILE);
    } catch (err) {
      console.error('Failed to read db file:', err);
    }
  }

  if (fileBuffer && fileBuffer.length > 0) {
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  initTables(dbInstance);
  saveDb();
  return dbInstance;
}

export function saveDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to save db to disk:', err);
  }
}

function initTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'customer')),
      address TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('CSC', 'CSP', 'OTHER')),
      subcategory TEXT,
      icon_name TEXT NOT NULL,
      description TEXT NOT NULL,
      required_documents TEXT NOT NULL, -- JSON array
      processing_time TEXT NOT NULL,
      service_charge REAL NOT NULL,
      govt_fee REAL NOT NULL,
      instructions TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_no TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      customer_email TEXT,
      address TEXT,
      dob TEXT,
      service_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      category TEXT NOT NULL,
      additional_info TEXT,
      status TEXT NOT NULL,
      status_notes TEXT,
      preferred_appointment_date TEXT,
      payment_option TEXT NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      pending_amount REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS application_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      document_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      uploaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      application_no TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      service_name TEXT NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      pending_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT NOT NULL,
      staff_id INTEGER,
      staff_name TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      payment_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      receipt_path TEXT,
      added_by_id INTEGER NOT NULL,
      added_by_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      service_id INTEGER,
      service_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      link TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS center_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      uploaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_cash_register (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      opening_cash REAL NOT NULL DEFAULT 0.0,
      cash_collections REAL NOT NULL DEFAULT 0.0,
      cash_expenses REAL NOT NULL DEFAULT 0.0,
      expected_closing REAL NOT NULL DEFAULT 0.0,
      physical_cash REAL DEFAULT 0.0,
      variance REAL DEFAULT 0.0,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN',
      opened_by TEXT,
      closed_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_diff_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      entity_ref TEXT,
      field_name TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      changed_by_name TEXT NOT NULL,
      changed_by_role TEXT NOT NULL,
      action_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      ip_address TEXT
    );
  `);

  const safeAddColumn = (table: string, colDef: string) => {
    try {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    } catch (e) {
      // Column already exists
    }
  };

  safeAddColumn("users", "is_active INTEGER NOT NULL DEFAULT 1");
  safeAddColumn("users", "aadhaar_no TEXT");
  safeAddColumn("users", "pan_no TEXT");
  safeAddColumn("users", "voter_id TEXT");
  safeAddColumn("users", "ration_card TEXT");
  safeAddColumn("users", "dob TEXT");
  safeAddColumn("users", "emergency_contact TEXT");
  safeAddColumn("users", "advance_balance REAL DEFAULT 0.0");
  safeAddColumn("users", "pending_dues REAL DEFAULT 0.0");
  safeAddColumn("users", "permissions TEXT");

  safeAddColumn("applications", "aadhaar_no TEXT");
  safeAddColumn("applications", "pan_no TEXT");
  safeAddColumn("applications", "voter_id TEXT");
  safeAddColumn("applications", "ration_card TEXT");
  safeAddColumn("applications", "emergency_contact TEXT");

  safeAddColumn("payments", "payment_type TEXT DEFAULT 'PARTIAL'");
  safeAddColumn("payments", "balance_after_payment REAL DEFAULT 0.0");

  seedDefaultData(db);
}

function seedDefaultData(db: Database) {
  // Check if users exist
  const userCheck = db.exec("SELECT COUNT(*) as count FROM users");
  if (userCheck[0] && userCheck[0].values[0][0] === 0) {
    const adminPass = bcrypt.hashSync('admin123', 10);
    const staffPass = bcrypt.hashSync('staff123', 10);
    const customerPass = bcrypt.hashSync('customer123', 10);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO users (name, email, mobile, password_hash, role, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Admin Center Manager', 'admin@csc.com', '9876543210', adminPass, 'admin', 'CSC Center Main St', now]
    );
    db.run(
      `INSERT INTO users (name, email, mobile, password_hash, role, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Rahul Sharma (Staff)', 'staff@csc.com', '9876543211', staffPass, 'staff', 'CSC Center Desk 1', now]
    );
    db.run(
      `INSERT INTO users (name, email, mobile, password_hash, role, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Amit Kumar (Customer)', 'customer@csc.com', '9876543212', customerPass, 'customer', 'House No 45, Green Park', now]
    );
  }

  // Check if settings exist
  const settingCheck = db.exec("SELECT COUNT(*) as count FROM settings");
  if (settingCheck[0] && settingCheck[0].values[0][0] === 0) {
    const defaultSettings: Record<string, string> = {
      center_name: 'Sarkari Tattha Digital Service Center',
      tagline: 'Aapka Digital Saathi',
      logo_url: '',
      address: 'Shop No. 12, Main Market Road, Near Bus Stand, District Center',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'support@csc-csp-center.com',
      opening_hours: 'Monday to Saturday: 8:00 AM - 8:00 PM (Sunday Closed)',
      upi_id: 'csc.servicepoint@upi',
      disclaimer_text: 'All services are provided subject to applicable government rules, banking regulations, portal availability and service-provider terms. Government & portal fee charges apply separately.'
    };

    for (const [k, v] of Object.entries(defaultSettings)) {
      db.run(`INSERT INTO settings (key, value) VALUES (?, ?)`, [k, v]);
    }
  } else {
    // Clean up broken logo_url if it was set to missing /logo.png
    try {
      db.run("UPDATE settings SET value = '' WHERE key = 'logo_url' AND value = '/logo.png'");
    } catch (e) {
      // Ignore
    }
  }

  // Check if services exist
  const serviceCheck = db.exec("SELECT COUNT(*) as count FROM services");
  if (serviceCheck[0] && serviceCheck[0].values[0][0] === 0) {
    const defaultServices = [
      {
        title: 'PAN Card New / Correction Assistance',
        category: 'CSC',
        subcategory: 'Identity & Taxes',
        icon_name: 'CreditCard',
        description: 'Complete assistance for new PAN Card issuance or correction in existing PAN details via NSDL / UTIITSL portals.',
        required_documents: JSON.stringify(['Aadhaar Card Copy', 'Passport Size Photograph', 'Active Mobile Number', 'Proof of Date of Birth']),
        processing_time: '7 - 15 Working Days',
        service_charge: 50,
        govt_fee: 107,
        instructions: 'Please ensure your mobile number is linked with Aadhaar for faster online OTP verification.'
      },
      {
        title: 'Aadhaar Address / Phone Link Guidance',
        category: 'CSC',
        subcategory: 'Identity & Taxes',
        icon_name: 'Fingerprint',
        description: 'Guidance and portal application submission for Aadhaar demographic updates and biometric appointment booking.',
        required_documents: JSON.stringify(['Aadhaar Card', 'Address Proof (Voter ID/Electricity Bill/Bank Passbook)', 'Mobile Number']),
        processing_time: '3 - 7 Working Days',
        service_charge: 30,
        govt_fee: 50,
        instructions: 'Original documents required during physical appointment at UIDAI update center.'
      },
      {
        title: 'Income / Caste / Residence Certificate',
        category: 'CSC',
        subcategory: 'Government Certificates',
        icon_name: 'FileCheck',
        description: 'State government online portal application filing for official Income, Caste, and Domicile/Residence certificates.',
        required_documents: JSON.stringify(['Aadhaar Card', 'Ration Card / Voter ID', 'Self-Declaration Form', 'Salary Slip / Tax Return (for Income)']),
        processing_time: '10 - 21 Working Days',
        service_charge: 60,
        govt_fee: 30,
        instructions: 'Certificates will be issued by the Tehsildar/Revenue Department after verification.'
      },
      {
        title: 'Birth & Death Certificate Registration',
        category: 'CSC',
        subcategory: 'Government Certificates',
        icon_name: 'FileText',
        description: 'Application filing assistance for official municipal or rural birth and death certificates.',
        required_documents: JSON.stringify(['Hospital Discharge Slip / Death Summary', 'Parents / Deceased Aadhaar Card', 'Address Proof']),
        processing_time: '7 - 14 Working Days',
        service_charge: 50,
        govt_fee: 20,
        instructions: 'Applications must be submitted within 21 days of event for routine processing.'
      },
      {
        title: 'AEPS Cash Withdrawal & Balance Enquiry',
        category: 'CSP',
        subcategory: 'Aadhaar Banking',
        icon_name: 'Banknote',
        description: 'Instant Aadhaar-enabled Cash Withdrawal, Balance Enquiry, and Mini Statement service for any bank account.',
        required_documents: JSON.stringify(['Aadhaar Number', 'Bank Name', 'Biometric Verification (Thumb Impress)']),
        processing_time: 'Instant (1-2 Minutes)',
        service_charge: 0,
        govt_fee: 0,
        instructions: 'Aadhaar must be linked with your bank account. Cash is paid directly at our CSP counter.'
      },
      {
        title: 'Domestic Money Transfer (DMT)',
        category: 'CSP',
        subcategory: 'Banking & Remittance',
        icon_name: 'Send',
        description: 'Immediate NEFT/IMPS fund transfer to any bank account across India 24x7.',
        required_documents: JSON.stringify(['Sender Mobile Number', 'Recipient Bank Account Number', 'IFSC Code']),
        processing_time: 'Instant IMPS Transfer',
        service_charge: 25,
        govt_fee: 0,
        instructions: 'Instant SMS receipt with Bank UTR number provided after successful transaction.'
      },
      {
        title: 'Savings / Jan Dhan Account Opening',
        category: 'CSP',
        subcategory: 'Account Opening',
        icon_name: 'Building2',
        description: 'Digital paperless bank account opening assistance with instant debit card and passbook issuing support.',
        required_documents: JSON.stringify(['Aadhaar Card', 'PAN Card', 'Passport Photo', 'Nominee Details']),
        processing_time: 'Same Day / 15 Minutes',
        service_charge: 50,
        govt_fee: 0,
        instructions: 'Instant account number generated with zero balance / PMJDY benefits.'
      },
      {
        title: 'Utility Bills & Mobile Recharge',
        category: 'OTHER',
        subcategory: 'Utility Payments',
        icon_name: 'Zap',
        description: 'Electricity, Water, Gas, Broadband, DTH, Mobile Recharge, and FASTag Instant Payment Service.',
        required_documents: JSON.stringify(['Consumer / Account Number', 'Mobile Number']),
        processing_time: 'Instant',
        service_charge: 10,
        govt_fee: 0,
        instructions: 'Official BBPS payment receipt provided immediately.'
      },
      {
        title: 'Passport Application & Appointment Assistance',
        category: 'CSC',
        subcategory: 'Travel & Governance',
        icon_name: 'Globe',
        description: 'Passport Seva portal form submission, document verification check, and PSK appointment booking.',
        required_documents: JSON.stringify(['Aadhaar Card', '10th Marksheet / Birth Certificate', 'PAN Card / Bank Passbook']),
        processing_time: '3 - 5 Days for Slot',
        service_charge: 100,
        govt_fee: 1500,
        instructions: 'Original documents required during Passport Seva Kendra visit.'
      },
      {
        title: 'PM-Kisan & Government Scheme Filing',
        category: 'CSC',
        subcategory: 'Government Schemes',
        icon_name: 'Award',
        description: 'Application & eKYC updating for PM-Kisan Samman Nidhi, Ayushman Bharat Card, Labor Card, and Pensions.',
        required_documents: JSON.stringify(['Aadhaar Card', 'Bank Passbook Copy', 'Land Registration Copy (for PM Kisan)']),
        processing_time: '2 - 5 Days',
        service_charge: 40,
        govt_fee: 0,
        instructions: 'eKYC thumb verification available at center.'
      }
    ];

    for (const s of defaultServices) {
      db.run(
        `INSERT INTO services (title, category, subcategory, icon_name, description, required_documents, processing_time, service_charge, govt_fee, instructions, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [s.title, s.category, s.subcategory, s.icon_name, s.description, s.required_documents, s.processing_time, s.service_charge, s.govt_fee, s.instructions]
      );
    }
  }

  // Seed sample applications if empty
  const appCheck = db.exec("SELECT COUNT(*) as count FROM applications");
  if (appCheck[0] && appCheck[0].values[0][0] === 0) {
    const now = new Date();
    const dateStr = now.toISOString();

    const sampleApps = [
      {
        app_no: 'CSC-2026-000101',
        cust_id: 3,
        cust_name: 'Amit Kumar',
        cust_mobile: '9876543212',
        cust_email: 'customer@csc.com',
        address: 'House No 45, Green Park',
        service_id: 1,
        service_name: 'PAN Card New / Correction Assistance',
        category: 'CSC',
        status: 'Processing',
        notes: 'Documents verified by Rahul. Sent for NSDL portal submission.',
        payment_option: 'Pay at Center',
        total: 157,
        paid: 100,
        pending: 57
      },
      {
        app_no: 'CSC-2026-000102',
        cust_id: 3,
        cust_name: 'Amit Kumar',
        cust_mobile: '9876543212',
        cust_email: 'customer@csc.com',
        address: 'House No 45, Green Park',
        service_id: 3,
        service_name: 'Income / Caste / Residence Certificate',
        category: 'CSC',
        status: 'Completed',
        notes: 'Certificate issued by Tehsildar. Download available.',
        payment_option: 'UPI Payment',
        total: 90,
        paid: 90,
        pending: 0
      },
      {
        app_no: 'CSC-2026-000103',
        cust_id: null,
        cust_name: 'Priya Sharma',
        cust_mobile: '9811223344',
        cust_email: 'priya@gmail.com',
        address: 'Block B, Sector 12',
        service_id: 7,
        service_name: 'Savings / Jan Dhan Account Opening',
        category: 'CSP',
        status: 'Under Review',
        notes: 'Aadhaar eKYC pending verification.',
        payment_option: 'Pay at Center',
        total: 50,
        paid: 0,
        pending: 50
      }
    ];

    for (const a of sampleApps) {
      db.run(
        `INSERT INTO applications
         (application_no, customer_id, customer_name, customer_mobile, customer_email, address, service_id, service_name, category, status, status_notes, payment_option, total_amount, paid_amount, pending_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.app_no, a.cust_id, a.cust_name, a.cust_mobile, a.cust_email, a.address, a.service_id, a.service_name, a.category, a.status, a.notes, a.payment_option, a.total, a.paid, a.pending, dateStr, dateStr]
      );

      // Create payments record
      if (a.paid > 0) {
        db.run(
          `INSERT INTO payments
           (application_id, application_no, customer_name, customer_mobile, service_name, total_amount, paid_amount, pending_amount, payment_method, transaction_id, staff_name, payment_status, payment_date)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [a.app_no, a.cust_name, a.cust_mobile, a.service_name, a.total, a.paid, a.pending, 'UPI', 'UPI' + Math.floor(100000 + Math.random() * 900000), 'Rahul Sharma', a.pending === 0 ? 'Paid' : 'Partially Paid', dateStr]
        );
      }
    }
  }

  // Seed sample expenses if empty
  const expCheck = db.exec("SELECT COUNT(*) as count FROM expenses");
  if (expCheck[0] && expCheck[0].values[0][0] === 0) {
    const today = new Date().toISOString().split('T')[0];
    db.run(
      `INSERT INTO expenses (category, amount, date, description, payment_method, added_by_id, added_by_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Stationery', 450, today, 'A4 Printing Paper reams & laminated sheets', 'Cash', 1, 'Admin Center Manager', new Date().toISOString()]
    );
    db.run(
      `INSERT INTO expenses (category, amount, date, description, payment_method, added_by_id, added_by_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Internet', 1200, today, 'Monthly Broadband Fiber Bill', 'UPI', 1, 'Admin Center Manager', new Date().toISOString()]
    );
  }

  // Seed sample FAQs if empty
  const faqCheck = db.exec("SELECT COUNT(*) as count FROM faqs");
  if (faqCheck[0] && faqCheck[0].values[0][0] === 0) {
    const faqs = [
      { category: 'PAN Card', question: 'How long does it take to get a new PAN Card?', answer: 'Digital e-PAN is generated within 3 to 5 days, while physical plastic card delivery takes 10 to 15 working days via speed post.' },
      { category: 'Banking / AEPS', question: 'What is required for AEPS Cash Withdrawal?', answer: 'You only need your bank account linked Aadhaar number and thumb/fingerprint biometric scan at our CSP terminal.' },
      { category: 'Certificates', question: 'Are government certificates issued directly by your center?', answer: 'We are an authorized CSC application assistance center. Applications are processed through official state government portals and verified by Tehsil/Revenue officers.' },
      { category: 'Payments', question: 'Can I pay online via UPI or Cash at the center?', answer: 'Yes! We accept Cash, UPI (GPay/PhonePe/Paytm), Debit Cards, and NetBanking. Instant printed receipts are issued for every transaction.' },
      { category: 'Documents', question: 'Which documents are required for Income/Caste Certificates?', answer: 'Aadhaar Card, Ration Card/Voter ID, Self-declaration form, and recent photograph.' }
    ];

    for (const f of faqs) {
      db.run(`INSERT INTO faqs (category, question, answer) VALUES (?, ?, ?)`, [f.category, f.question, f.answer]);
    }
  }

  // Seed sample center photos if empty
  const photoCheck = db.exec("SELECT COUNT(*) as count FROM center_photos");
  if (photoCheck[0] && photoCheck[0].values[0][0] === 0) {
    const defaultPhotos = [
      {
        title: 'Main Center Reception & Help Desk',
        category: 'Reception Area',
        description: 'Our primary customer service desk for government document applications and general consultation.',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Banking & AEPS Biometric Terminal',
        category: 'CSP Banking Station',
        description: 'Dedicated AEPS cash withdrawal, balance enquiry, and domestic money transfer counter equipped with fingerprint scanners.',
        image_url: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Digital Application & Online Exam Lab',
        category: 'Computer Lab',
        description: 'High-speed internet computer terminals for online form filling, PAN card applications, and student registrations.',
        image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'High-Speed Color Printing & Lamination Unit',
        category: 'Document Printing',
        description: 'Professional PVC card printing, high-speed document scanning, photo studio, and certificate lamination facility.',
        image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Comfortable Customer Waiting Area',
        category: 'Customer Lounge',
        description: 'Spacious seating for applicants with token display and free Wi-Fi guidance.',
        image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
      }
    ];

    const now = new Date().toISOString();
    for (const p of defaultPhotos) {
      db.run(
        `INSERT INTO center_photos (title, category, description, image_url, uploaded_at) VALUES (?, ?, ?, ?, ?)`,
        [p.title, p.category, p.description, p.image_url, now]
      );
    }
  }
}

// Utility functions for executing SQL queries
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export async function run(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
  const db = await getDb();
  db.run(sql, params);
  const lastIdResult = db.exec("SELECT last_insert_rowid()");
  const lastInsertRowid = (lastIdResult[0] && lastIdResult[0].values[0] && lastIdResult[0].values[0][0]) as number || 0;
  const changesResult = db.exec("SELECT changes()");
  const changes = (changesResult[0] && changesResult[0].values[0] && changesResult[0].values[0][0]) as number || 0;
  saveDb();
  return { lastInsertRowid, changes };
}

export async function logAudit(userName: string, userRole: string, action: string, details: string) {
  try {
    const timestamp = new Date().toISOString();
    await run(
      `INSERT INTO audit_logs (user_name, user_role, action, details, timestamp) VALUES (?, ?, ?, ?, ?)`,
      [userName, userRole, action, details, timestamp]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

export async function logDiffAudit(
  entityType: string,
  entityId: number,
  entityRef: string,
  fieldName: string,
  oldValue: any,
  newValue: any,
  changedByName: string,
  changedByRole: string,
  actionType: string = 'UPDATE',
  ipAddress: string = ''
) {
  try {
    const timestamp = new Date().toISOString();
    const oldStr = oldValue !== undefined && oldValue !== null ? String(oldValue) : '';
    const newStr = newValue !== undefined && newValue !== null ? String(newValue) : '';
    await run(
      `INSERT INTO audit_diff_logs (entity_type, entity_id, entity_ref, field_name, old_value, new_value, changed_by_name, changed_by_role, action_type, timestamp, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [entityType, entityId, entityRef, fieldName, oldStr, newStr, changedByName, changedByRole, actionType, timestamp, ipAddress]
    );
  } catch (err) {
    console.error('Diff audit log failed:', err);
  }
}
