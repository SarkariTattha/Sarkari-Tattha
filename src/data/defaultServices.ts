import { Service } from '../types';

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 1,
    title: 'PAN Card New / Correction Assistance',
    category: 'CSC',
    subcategory: 'Identity & Taxes',
    icon_name: 'CreditCard',
    description: 'Complete assistance for new PAN Card issuance or correction in existing PAN details via NSDL / UTIITSL portals.',
    required_documents: ['Aadhaar Card Copy', 'Passport Size Photograph', 'Active Mobile Number', 'Proof of Date of Birth'],
    processing_time: '7 - 15 Working Days',
    service_charge: 50,
    govt_fee: 107,
    instructions: 'Please ensure your mobile number is linked with Aadhaar for faster online OTP verification.',
    active: true
  },
  {
    id: 2,
    title: 'Aadhaar Address / Phone Link Guidance',
    category: 'CSC',
    subcategory: 'Identity & Taxes',
    icon_name: 'Fingerprint',
    description: 'Guidance and portal application submission for Aadhaar demographic updates and biometric appointment booking.',
    required_documents: ['Aadhaar Card', 'Address Proof (Voter ID/Electricity Bill/Bank Passbook)', 'Mobile Number'],
    processing_time: '3 - 7 Working Days',
    service_charge: 30,
    govt_fee: 50,
    instructions: 'Original documents required during physical appointment at UIDAI update center.',
    active: true
  },
  {
    id: 3,
    title: 'Income / Caste / Residence Certificate',
    category: 'CSC',
    subcategory: 'Government Certificates',
    icon_name: 'FileCheck',
    description: 'State government online portal application filing for official Income, Caste, and Domicile/Residence certificates.',
    required_documents: ['Aadhaar Card', 'Ration Card / Voter ID', 'Self-Declaration Form', 'Salary Slip / Tax Return (for Income)'],
    processing_time: '10 - 21 Working Days',
    service_charge: 60,
    govt_fee: 30,
    instructions: 'Certificates will be issued by the Tehsildar/Revenue Department after verification.',
    active: true
  },
  {
    id: 4,
    title: 'Birth & Death Certificate Registration',
    category: 'CSC',
    subcategory: 'Government Certificates',
    icon_name: 'FileText',
    description: 'Application filing assistance for official municipal or rural birth and death certificates.',
    required_documents: ['Hospital Discharge Slip / Death Summary', 'Parents / Deceased Aadhaar Card', 'Address Proof'],
    processing_time: '7 - 14 Working Days',
    service_charge: 50,
    govt_fee: 20,
    instructions: 'Applications must be submitted within 21 days of event for routine processing.',
    active: true
  },
  {
    id: 5,
    title: 'AEPS Cash Withdrawal & Balance Enquiry',
    category: 'CSP',
    subcategory: 'Aadhaar Banking',
    icon_name: 'Banknote',
    description: 'Instant Aadhaar-enabled Cash Withdrawal, Balance Enquiry, and Mini Statement service for any bank account.',
    required_documents: ['Aadhaar Number', 'Bank Name', 'Biometric Verification (Thumb Impress)'],
    processing_time: 'Instant (1-2 Minutes)',
    service_charge: 0,
    govt_fee: 0,
    instructions: 'Aadhaar must be linked with your bank account. Cash is paid directly at our CSP counter.',
    active: true
  },
  {
    id: 6,
    title: 'Domestic Money Transfer (DMT)',
    category: 'CSP',
    subcategory: 'Banking & Remittance',
    icon_name: 'Send',
    description: 'Immediate NEFT/IMPS fund transfer to any bank account across India 24x7.',
    required_documents: ['Sender Mobile Number', 'Recipient Bank Account Number', 'IFSC Code'],
    processing_time: 'Instant IMPS Transfer',
    service_charge: 25,
    govt_fee: 0,
    instructions: 'Instant SMS receipt with Bank UTR number provided after successful transaction.',
    active: true
  },
  {
    id: 7,
    title: 'Savings / Jan Dhan Account Opening',
    category: 'CSP',
    subcategory: 'Account Opening',
    icon_name: 'Building2',
    description: 'Digital paperless bank account opening assistance with instant debit card and passbook issuing support.',
    required_documents: ['Aadhaar Card', 'PAN Card', 'Passport Photo', 'Nominee Details'],
    processing_time: 'Same Day / 15 Minutes',
    service_charge: 50,
    govt_fee: 0,
    instructions: 'Instant account number generated with zero balance / PMJDY benefits.',
    active: true
  },
  {
    id: 8,
    title: 'Utility Bills & Mobile Recharge',
    category: 'OTHER',
    subcategory: 'Utility Payments',
    icon_name: 'Zap',
    description: 'Electricity, Water, Gas, Broadband, DTH, Mobile Recharge, and FASTag Instant Payment Service.',
    required_documents: ['Consumer / Account Number', 'Mobile Number'],
    processing_time: 'Instant',
    service_charge: 10,
    govt_fee: 0,
    instructions: 'Official BBPS payment receipt provided immediately.',
    active: true
  },
  {
    id: 9,
    title: 'Passport Application & Appointment Assistance',
    category: 'CSC',
    subcategory: 'Travel & Governance',
    icon_name: 'Globe',
    description: 'Passport Seva portal form submission, document verification check, and PSK appointment booking.',
    required_documents: ['Aadhaar Card', '10th Marksheet / Birth Certificate', 'PAN Card / Bank Passbook'],
    processing_time: '3 - 5 Days for Slot',
    service_charge: 100,
    govt_fee: 1500,
    instructions: 'Original documents required during Passport Seva Kendra visit.',
    active: true
  },
  {
    id: 10,
    title: 'PM-Kisan & Government Scheme Filing',
    category: 'CSC',
    subcategory: 'Government Schemes',
    icon_name: 'Award',
    description: 'Application & eKYC updating for PM-Kisan Samman Nidhi, Ayushman Bharat Card, Labor Card, and Pensions.',
    required_documents: ['Aadhaar Card', 'Bank Passbook Copy', 'Land Registration Copy (for PM Kisan)'],
    processing_time: '2 - 5 Days',
    service_charge: 40,
    govt_fee: 0,
    instructions: 'Annual ₹6,000 direct benefit transfer scheme registration.',
    active: true
  }
];

export function getStoredServices(): Service[] {
  try {
    const raw = localStorage.getItem('csc_local_services');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse csc_local_services:', e);
  }
  return DEFAULT_SERVICES;
}

export function saveStoredServices(services: Service[]): void {
  try {
    localStorage.setItem('csc_local_services', JSON.stringify(services));
  } catch (e) {
    console.warn('Failed to save csc_local_services:', e);
  }
}
