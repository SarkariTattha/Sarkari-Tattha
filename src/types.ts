export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  address?: string;
  is_active?: number;
  created_at: string;
}

export type ServiceCategoryType = 'CSC' | 'CSP' | 'OTHER';

export interface Service {
  id: number;
  title: string;
  category: ServiceCategoryType;
  subcategory?: string;
  icon_name: string;
  description: string;
  required_documents: string[];
  processing_time: string;
  service_charge: number;
  govt_fee: number;
  instructions: string;
  active: boolean;
}

export interface ApplicationDocument {
  id: number;
  application_id: number;
  document_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Documents Required'
  | 'Under Review'
  | 'Processing'
  | 'Pending'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface Application {
  id: number;
  application_no: string; // CSC-2026-XXXXXX
  customer_id?: number;
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  address: string;
  dob?: string;
  service_id: number;
  service_name: string;
  category: ServiceCategoryType;
  additional_info?: string;
  status: ApplicationStatus;
  status_notes?: string;
  preferred_appointment_date?: string;
  payment_option: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  created_at: string;
  updated_at: string;
  documents?: ApplicationDocument[];
}

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending' | 'Refunded';

export interface Payment {
  id: number;
  application_id: number;
  application_no: string;
  customer_name: string;
  customer_mobile: string;
  service_name: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  payment_method: string;
  transaction_id: string;
  staff_id?: number;
  staff_name: string;
  payment_status: PaymentStatus;
  payment_date: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
  payment_method: string;
  receipt_path?: string;
  added_by_id: number;
  added_by_name: string;
  created_at: string;
}

export type AppointmentStatus = 'Requested' | 'Approved' | 'Rejected' | 'Rescheduled' | 'Completed';

export interface Appointment {
  id: number;
  customer_id?: number;
  customer_name: string;
  customer_mobile: string;
  service_id?: number;
  service_name: string;
  date: string;
  time: string;
  message?: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export interface CenterSettings {
  center_name: string;
  logo_url?: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  opening_hours: string;
  upi_id: string;
  disclaimer_text: string;
}

export interface DashboardStats {
  total_customers: number;
  todays_applications: number;
  pending_applications: number;
  completed_applications: number;
  todays_collection: number;
  monthly_collection: number;
  pending_amount: number;
  monthly_expenses: number;
  net_income: number;
  daily_revenue: { date: string; amount: number }[];
  monthly_revenue: { month: string; amount: number }[];
  service_stats: { service_name: string; count: number }[];
  category_stats: { category: string; count: number }[];
}

export interface AuditLog {
  id: number;
  user_name: string;
  user_role: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface CenterPhoto {
  id: number;
  title: string;
  category: string;
  description?: string;
  image_url: string;
  uploaded_at?: string;
}
