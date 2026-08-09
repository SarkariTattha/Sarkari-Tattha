import React, { useState, useEffect } from 'react';
import { UserProfileModal } from '../components/UserProfileModal';
import {
  ShieldAlert,
  Users,
  FileText,
  DollarSign,
  PlusCircle,
  Search,
  Settings,
  TrendingUp,
  Download,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  BarChart3,
  Building2,
  RefreshCw,
  Clock,
  UserX,
  UserCheck,
  Key,
  Lock,
  Shield,
  Info,
  Edit3,
  Ban,
  Upload,
  Image as ImageIcon,
  Globe,
  Palette,
  Megaphone,
  PhoneCall,
  Mail,
  MapPin,
  Sparkles,
  Database,
  Calendar,
  Landmark,
  ShieldCheck,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { syncLocalDbToFirestore } from '../lib/firebaseStore';
import { compressImageFile, compressImageDataUrl } from '../lib/imageCompressor';
import { Service, Application, User, UserRole, Expense, DailyCashRegister, StaffPermissions } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { CenterGallerySection } from '../components/CenterGallerySection';
import { ExtendedCustomerModal } from '../components/ExtendedCustomerModal';
import { StaffPermissionsModal } from '../components/StaffPermissionsModal';
import { DailyCashRegisterModal } from '../components/DailyCashRegisterModal';
import { ReportsAndDiffLogsSection } from '../components/ReportsAndDiffLogsSection';
import { DuplicateCheckModal } from '../components/DuplicateCheckModal';
import { getStoredServices, saveStoredServices } from '../data/defaultServices';
import { getStoredUsers, setUserActiveStatus, deleteStoredUser, saveStoredUser, processFetchedUsers } from '../utils/userStorage';

export const AdminDashboard: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { updateSettings, refreshSettings } = useSettings();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'services' | 'photos' | 'pending' | 'users' | 'expenses' | 'settings' | 'reports' | 'logs' | 'appointments'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingApps, setPendingApps] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [centerSettings, setCenterSettings] = useState<any>({});
  const [appointments, setAppointments] = useState<any[]>([]);
  const [apptSearchTerm, setApptSearchTerm] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [svcTitle, setSvcTitle] = useState('');
  const [svcCategory, setSvcCategory] = useState<'CSC' | 'CSP' | 'OTHER'>('CSC');
  const [svcSubcat, setSvcSubcat] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcGovtFee, setSvcGovtFee] = useState('');
  const [svcCharge, setSvcCharge] = useState('');
  const [svcProcTime, setSvcProcTime] = useState('2-3 Days');
  const [svcDocs, setSvcDocs] = useState('Aadhaar Card, Mobile Number');

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [usrName, setUsrName] = useState('');
  const [usrEmail, setUsrEmail] = useState('');
  const [usrMobile, setUsrMobile] = useState('');
  const [usrPassword, setUsrPassword] = useState('');
  const [usrRole, setUsrRole] = useState<UserRole>('staff');

  // Edit User modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUsrName, setEditUsrName] = useState('');
  const [editUsrEmail, setEditUsrEmail] = useState('');
  const [editUsrMobile, setEditUsrMobile] = useState('');
  const [editUsrAddress, setEditUsrAddress] = useState('');
  const [editUsrRole, setEditUsrRole] = useState<UserRole>('staff');
  const [editUsrActive, setEditUsrActive] = useState<boolean>(true);
  const [editUsrPassword, setEditUsrPassword] = useState('');

  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [receiptAppNo, setReceiptAppNo] = useState<string | null>(null);

  // Cash Register State
  const [cashRegisterModalOpen, setCashRegisterModalOpen] = useState(false);
  const [cashRegisterData, setCashRegisterData] = useState<DailyCashRegister | null>(null);

  // Extended Customer Profile State
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);

  // Staff Permissions State
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [permissionStaffUser, setPermissionStaffUser] = useState<User | null>(null);

  // Duplicate Check Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);

  const fetchCashRegisterToday = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/cash-register/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCashRegisterData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCashRegister = async (openingCash: number) => {
    const res = await fetch('/api/admin/cash-register/open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ opening_cash: openingCash })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to set opening cash');
    }
    await fetchCashRegisterToday();
  };

  const handleReconcileCashRegister = async (physicalCash: number, notes: string, lock: boolean) => {
    const res = await fetch('/api/admin/cash-register/reconcile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ physical_cash: physicalCash, notes, lock })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reconcile cash register');
    }
    await fetchCashRegisterToday();
  };

  const handleSaveCustomerProfile = async (custData: any) => {
    const isEdit = Boolean(custData.id);
    const url = isEdit ? `/api/admin/customers/${custData.id}` : '/api/admin/customers';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(custData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save customer profile');
    }
    fetchAdminData();
  };

  const handleAddCustomerAdvance = async (customerId: number, amount: number, method: string, notes: string) => {
    const res = await fetch(`/api/admin/customers/${customerId}/add-advance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount, payment_method: method, notes })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to deposit advance balance');
    }
    fetchAdminData();
  };

  const handleSaveStaffPermissions = async (staffId: number, permissions: StaffPermissions) => {
    const res = await fetch(`/api/admin/staff/${staffId}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ permissions })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update permissions');
    }
    fetchAdminData();
  };

  const handleCheckCustomerDuplicate = async (data: { mobile?: string; aadhaar_no?: string; pan_no?: string }) => {
    try {
      const res = await fetch('/api/admin/customers/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.matches || [];
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  };

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      return null;
    }
  };

  const fetchAdminData = () => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      safeFetchJson('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
      safeFetchJson('/api/services'),
      safeFetchJson('/api/applications', { headers: { Authorization: `Bearer ${token}` } }),
      safeFetchJson('/api/payments/pending', { headers: { Authorization: `Bearer ${token}` } }),
      safeFetchJson('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      safeFetchJson('/api/expenses', { headers: { Authorization: `Bearer ${token}` } }),
      safeFetchJson('/api/admin/settings'),
      safeFetchJson('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } }),
      safeFetchJson('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(([st, sv, ap, pd, us, ex, set, lg, apt]) => {
        setStats(st || {});
        setServices(Array.isArray(sv) && sv.length > 0 ? sv : getStoredServices());
        setApplications(Array.isArray(ap) ? ap : []);
        setPendingApps(Array.isArray(pd) ? pd : []);
        setUsers(Array.isArray(us) && us.length > 0 ? processFetchedUsers(us) : getStoredUsers());
        setExpenses(Array.isArray(ex) ? ex : []);
        setCenterSettings(set || {});
        setLogs(Array.isArray(lg) ? lg : []);

        // Merge API appointments with local appointments backup
        let localAppts: any[] = [];
        try {
          const raw = localStorage.getItem('csc_local_appointments');
          if (raw) localAppts = JSON.parse(raw);
        } catch (e) {
          console.error('Error reading local appointments:', e);
        }

        const apiAppts = Array.isArray(apt) ? apt : [];
        const apptMap = new Map<string | number, any>();
        apiAppts.forEach((a) => apptMap.set(a.id, a));
        localAppts.forEach((a) => {
          if (!apptMap.has(a.id)) apptMap.set(a.id, a);
        });

        setAppointments(Array.from(apptMap.values()));
      })
      .catch((err) => {
        console.error('Fetch admin data catch block:', err);
        setServices(getStoredServices());
        setUsers(getStoredUsers());
      })
      .finally(() => setLoading(false));
  };

  const handleUpdateAppointmentStatus = async (id: number | string, newStatus: string) => {
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error('API update appointment status error:', e);
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    try {
      const raw = localStorage.getItem('csc_local_appointments');
      if (raw) {
        const list = JSON.parse(raw);
        const updated = list.map((a: any) => (a.id === id ? { ...a, status: newStatus } : a));
        localStorage.setItem('csc_local_appointments', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Handle Service Save / Update
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const docArray = svcDocs.split(',').map((d) => d.trim()).filter(Boolean);

    const payload = {
      title: svcTitle,
      category: svcCategory,
      subcategory: svcSubcat,
      description: svcDesc,
      govt_fee: Number(svcGovtFee) || 0,
      service_charge: Number(svcCharge) || 0,
      processing_time: svcProcTime,
      required_documents: docArray
    };

    const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
    const method = editingService ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setServiceModalOpen(false);
        setEditingService(null);
        fetchAdminData();
        return;
      }
      throw new Error('API unavailable');
    } catch (err) {
      let currentServices = getStoredServices();
      if (editingService) {
        currentServices = currentServices.map((s) =>
          s.id === editingService.id
            ? { ...s, ...payload, icon_name: s.icon_name || 'FileText', active: true }
            : s
        );
      } else {
        const newSvc: Service = {
          id: Date.now(),
          ...payload,
          instructions: '',
          icon_name: 'FileText',
          active: true
        };
        currentServices.unshift(newSvc);
      }
      saveStoredServices(currentServices);
      setServices(currentServices);
      setServiceModalOpen(false);
      setEditingService(null);
      alert(editingService ? 'Service updated successfully!' : 'Service created successfully!');
    }
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = usrEmail.toLowerCase().trim();
    const newUserObj: User = {
      id: Date.now(),
      name: usrName,
      email: cleanEmail,
      mobile: usrMobile,
      role: usrRole,
      address: '',
      is_active: 1,
      created_at: new Date().toISOString()
    };

    saveStoredUser(newUserObj, usrPassword);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: usrName,
          email: cleanEmail,
          mobile: usrMobile,
          password: usrPassword,
          role: usrRole
        })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        alert(data.message || `${usrRole.toUpperCase()} account created successfully!`);
        setUserModalOpen(false);
        setUsrName('');
        setUsrEmail('');
        setUsrMobile('');
        setUsrPassword('');
        fetchAdminData();
        return;
      }
      throw new Error('API unavailable');
    } catch (err) {
      setUsers(getStoredUsers());
      alert(`${usrRole.toUpperCase()} account created successfully!`);
      setUserModalOpen(false);
      setUsrName('');
      setUsrEmail('');
      setUsrMobile('');
      setUsrPassword('');
    }
  };

  // Handle Toggle User Active Status (Deactivate / Activate)
  const handleToggleUserStatus = async (targetUser: User) => {
    const isUserSelf = Boolean(
      (currentUser?.email && targetUser.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      targetUser.id === currentUser?.id
    );
    if (isUserSelf) {
      alert('You cannot deactivate your own logged-in admin account.');
      return;
    }

    const currentStatus = targetUser.is_active !== 0;
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} the account for ${targetUser.name} (${targetUser.email})?`)) {
      return;
    }

    setUserActiveStatus(targetUser, newStatus);
    setUsers(getStoredUsers());

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        alert(data.message || `Account ${actionText}d successfully.`);
        fetchAdminData();
        return;
      }
      alert(`Account ${actionText}d successfully.`);
    } catch (err) {
      alert(`Account ${actionText}d successfully.`);
    }
  };

  // Handle Delete User Account
  const handleDeleteUser = async (targetUser: User) => {
    const isUserSelf = Boolean(
      (currentUser?.email && targetUser.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      targetUser.id === currentUser?.id
    );
    if (isUserSelf) {
      alert('You cannot delete your own logged-in admin account.');
      return;
    }

    if (
      !window.confirm(
        `CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE the user account for ${targetUser.name} (${targetUser.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    deleteStoredUser(targetUser);
    setUsers(getStoredUsers());

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        alert(data.message || 'User account deleted successfully.');
        fetchAdminData();
        return;
      }
      alert('User account deleted successfully.');
    } catch (err) {
      alert('User account deleted successfully.');
    }
  };

  // Handle Open Edit User Modal
  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditUsrName(u.name || '');
    setEditUsrEmail(u.email || '');
    setEditUsrMobile(u.mobile || '');
    setEditUsrAddress(u.address || '');
    setEditUsrRole(u.role || 'staff');
    setEditUsrActive(u.is_active !== 0);
    setEditUsrPassword('');
    setEditUserModalOpen(true);
  };

  // Handle Save Edit User
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUser: User = {
      ...editingUser,
      name: editUsrName,
      email: editUsrEmail.toLowerCase().trim(),
      mobile: editUsrMobile,
      address: editUsrAddress,
      role: editUsrRole,
      is_active: editUsrActive ? 1 : 0
    };

    saveStoredUser(updatedUser, editUsrPassword);
    setUsers(getStoredUsers());

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editUsrName,
          email: editUsrEmail,
          mobile: editUsrMobile,
          address: editUsrAddress,
          role: editUsrRole,
          is_active: editUsrActive,
          new_password: editUsrPassword
        })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        alert('User account updated successfully.');
        setEditUserModalOpen(false);
        setEditingUser(null);
        fetchAdminData();
        return;
      }
      alert('User account updated successfully.');
      setEditUserModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      alert('User account updated successfully.');
      setEditUserModalOpen(false);
      setEditingUser(null);
    }
  };

  const [syncingFirebase, setSyncingFirebase] = useState(false);

  const handleFirebaseSync = async () => {
    setSyncingFirebase(true);
    try {
      const ok = await syncLocalDbToFirestore();
      if (ok) {
        alert('🔥 Success! All center settings and services have been synced to Google Firebase Firestore.');
      } else {
        alert('Firebase sync completed with warnings.');
      }
    } catch (err) {
      console.error(err);
      alert('Firebase sync failed.');
    } finally {
      setSyncingFirebase(false);
    }
  };

  // Handle Logo Upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      try {
        const compressedBase64 = await compressImageFile(file, 500, 500, 0.8);
        setCenterSettings((prev: any) => ({ ...prev, logo_url: compressedBase64 }));
      } catch (err) {
        console.error('Logo compression error:', err);
      }
    }
  };

  // Handle Hero Photo Upload
  const handleHeroPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      try {
        const compressedBase64 = await compressImageFile(file, 1000, 1000, 0.75);
        setCenterSettings((prev: any) => ({ ...prev, hero_photo_url: compressedBase64 }));
      } catch (err) {
        console.error('Hero photo compression error:', err);
      }
    }
  };

  // Handle About Photo Upload
  const handleAboutPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      try {
        const compressedBase64 = await compressImageFile(file, 1000, 1000, 0.75);
        setCenterSettings((prev: any) => ({ ...prev, about_photo_url: compressedBase64 }));
      } catch (err) {
        console.error('About photo compression error:', err);
      }
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Compress any large image data URLs in settings before saving
      const settingsToSave = { ...centerSettings };
      if (settingsToSave.logo_url) {
        settingsToSave.logo_url = await compressImageDataUrl(settingsToSave.logo_url, 500, 500, 0.8);
      }
      if (settingsToSave.hero_photo_url) {
        settingsToSave.hero_photo_url = await compressImageDataUrl(settingsToSave.hero_photo_url, 1000, 1000, 0.75);
      }
      if (settingsToSave.about_photo_url) {
        settingsToSave.about_photo_url = await compressImageDataUrl(settingsToSave.about_photo_url, 1000, 1000, 0.75);
      }

      const success = await updateSettings(settingsToSave, token || undefined);
      if (success) {
        alert('🎉 Website Center Information, Branding, Logos & Public Settings saved successfully!');
      } else {
        alert('🎉 Center settings updated & saved locally!');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      alert('Failed to save settings.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl border border-emerald-900">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              👑 CSC + CSP Master Admin Panel
            </span>
            {currentUser && (
              <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 text-[11px] font-mono font-bold rounded-md border border-purple-400/30">
                User ID: #{currentUser.id}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Admin: {currentUser?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-300 flex items-center space-x-3">
            <span>Role: <strong className="text-emerald-300 font-semibold">{currentUser?.role.toUpperCase()}</strong></span>
            <span>•</span>
            <span>Mobile: <strong className="text-slate-200 font-mono">{currentUser?.mobile || '9876543210'}</strong></span>
            <span>•</span>
            <span>Email: <strong className="text-slate-200">{currentUser?.email}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              fetchCashRegisterToday();
              setCashRegisterModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 border border-emerald-500/40 cursor-pointer"
          >
            <Landmark className="w-4 h-4 text-emerald-300" />
            <span>Daily Cash Register</span>
          </button>

          <button
            onClick={() => {
              setEditingCustomer(null);
              setCustomerModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 border border-blue-500/40 cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-300" />
            <span>+ Extended Customer</span>
          </button>

          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 border border-white/20 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-emerald-300" />
            <span>My Profile</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
            <p className="text-2xl font-black text-slate-900">{stats.total_applications || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-600">₹{stats.total_revenue || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Balance</p>
            <p className="text-2xl font-black text-amber-600">₹{stats.total_pending_amount || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Center Expenses</p>
            <p className="text-2xl font-black text-red-600">₹{stats.total_expenses || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Profit</p>
            <p className="text-2xl font-black text-emerald-700">₹{stats.net_profit || 0}</p>
          </div>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'services', label: `Services (${services.length})` },
          { id: 'photos', label: 'Center Gallery & Photos' },
          { id: 'pending', label: `Pending Amounts (${pendingApps.length})` },
          { id: 'users', label: `User Management (${users.length})` },
          { id: 'expenses', label: 'Expenses' },
          { id: 'reports', label: 'Reports & Export' },
          { id: 'settings', label: 'Center Settings' },
          { id: 'appointments', label: `Center Visits (${appointments.length})` },
          { id: 'logs', label: 'Audit Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Applications Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">App ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Total / Paid</th>
                    <th className="p-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {applications.slice(0, 10).map((app) => (
                    <tr key={app.id}>
                      <td className="p-3 font-mono font-bold">{app.application_no}</td>
                      <td className="p-3">{app.customer_name} ({app.customer_mobile})</td>
                      <td className="p-3">{app.service_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3">₹{app.total_amount} / ₹{app.paid_amount}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setReceiptAppNo(app.application_no)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Services Management */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Service Directory Catalog</h3>
            <button
              onClick={() => {
                setEditingService(null);
                setSvcTitle('');
                setSvcCategory('CSC');
                setSvcSubcat('');
                setSvcDesc('');
                setSvcGovtFee('0');
                setSvcCharge('50');
                setSvcProcTime('2-3 Days');
                setSvcDocs('Aadhaar Card, Mobile Number');
                setServiceModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Govt Fee</th>
                    <th className="p-3">Service Charge</th>
                    <th className="p-3">Proc. Time</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {services.map((svc) => (
                    <tr key={svc.id}>
                      <td className="p-3 font-bold text-emerald-700">{svc.category}</td>
                      <td className="p-3 font-bold text-slate-900">{svc.title}</td>
                      <td className="p-3">₹{svc.govt_fee}</td>
                      <td className="p-3 font-bold text-emerald-700">₹{svc.service_charge}</td>
                      <td className="p-3">{svc.processing_time}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingService(svc);
                            setSvcTitle(svc.title);
                            setSvcCategory(svc.category);
                            setSvcSubcat(svc.subcategory || '');
                            setSvcDesc(svc.description);
                            setSvcGovtFee(String(svc.govt_fee));
                            setSvcCharge(String(svc.service_charge));
                            setSvcProcTime(svc.processing_time);
                            setSvcDocs(svc.required_documents.join(', '));
                            setServiceModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2.5: Center Gallery & Photos */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <CenterGallerySection
            title="Manage Center Infrastructure Photos"
            subtitle="Upload, categorize, and showcase your physical center photos for online visitors."
          />
        </div>
      )}

      {/* Tab 3: Pending Amounts */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Pending Amount Ledger ({pendingApps.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">App ID</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Pending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingApps.map((app) => (
                  <tr key={app.id}>
                    <td className="p-3 font-mono font-bold text-slate-900">{app.application_no}</td>
                    <td className="p-3 font-bold text-slate-900">{app.customer_name}</td>
                    <td className="p-3">{app.customer_mobile}</td>
                    <td className="p-3">{app.service_name}</td>
                    <td className="p-3 font-bold">₹{app.total_amount}</td>
                    <td className="p-3 text-emerald-700 font-bold">₹{app.paid_amount}</td>
                    <td className="p-3 text-amber-600 font-black">₹{app.pending_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Information & Credentials Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-orange-400 font-extrabold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Admin & Staff Access Management</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-slate-800/80 pt-3">
              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-bold text-white text-sm">How to create and manage Staff / Admin accounts:</p>
                <p>
                  1. Click <span className="font-bold text-orange-300">"+ Create Staff / User"</span> to generate a new user ID with customized role.
                </p>
                <p>
                  2. Use the <span className="font-bold text-emerald-400">Activate / Deactivate</span> button to block or restore access instantly.
                </p>
                <p>
                  3. Use the <span className="font-bold text-amber-300">Edit / Password</span> button to reset forgotten passwords or update user details.
                </p>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-[11px] font-mono space-y-1.5 shrink-0">
                <div className="text-orange-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                  <Key className="w-3 h-3" />
                  <span>Default Accounts Checklist:</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-purple-300 font-bold">Admin ID:</span> admin@sarkari.gov.in / admin123
                </div>
                <div className="text-slate-300">
                  <span className="text-blue-300 font-bold">Staff ID:</span> staff@sarkari.gov.in / staff123
                </div>
              </div>
            </div>
          </div>

          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Role Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {(['ALL', 'admin', 'staff', 'customer'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    userRoleFilter === r
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {r === 'ALL' ? `All Accounts (${users.length})` : `${r.toUpperCase()}s`}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 w-48 sm:w-60"
                />
              </div>

              <button
                onClick={() => setUserModalOpen(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Staff / User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">User Details</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users
                    .filter((u) => {
                      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                      const matchesSearch =
                        !userSearchQuery ||
                        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.mobile.includes(userSearchQuery);
                      return matchesRole && matchesSearch;
                    })
                    .map((u) => {
                      const isActive = u.is_active !== 0;
                      const isSelf = Boolean(
                        (currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                        u.id === currentUser?.id
                      );

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-700">{u.mobile}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : u.role === 'staff'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {isActive ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold text-[10px] border border-red-200">
                                <UserX className="w-3 h-3 text-red-600" />
                                <span>Deactivated</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {(u.role === 'staff' || u.role === 'admin') && (
                              <button
                                onClick={() => {
                                  setPermissionStaffUser(u);
                                  setPermissionsModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                                title="Configure granular permissions matrix"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Permissions</span>
                              </button>
                            )}

                            {/* Edit / Password Button */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                              title="Edit details or reset password"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit</span>
                            </button>

                            {/* Activate / Deactivate Button */}
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              disabled={isSelf}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1 ${
                                isSelf
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                  : isActive
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 cursor-pointer'
                              }`}
                              title={isSelf ? 'Cannot deactivate logged-in self' : isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {isActive ? (
                                <>
                                  <Ban className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isSelf}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1 ${
                                isSelf
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                  : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 cursor-pointer'
                              }`}
                              title={isSelf ? 'Cannot delete logged-in self' : 'Permanently delete user'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Financial Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Center Operating Expenses Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Logged By</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenses.map((ex) => (
                  <tr key={ex.id}>
                    <td className="p-3 font-bold text-slate-900">{ex.category}</td>
                    <td className="p-3 text-slate-700">{ex.description}</td>
                    <td className="p-3 text-red-600 font-bold">₹{ex.amount}</td>
                    <td className="p-3 text-slate-500">{ex.added_by_name || 'Staff'}</td>
                    <td className="p-3 text-slate-400">{new Date(ex.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Reports & Export */}
      {activeTab === 'reports' && (
        <ReportsAndDiffLogsSection token={token || undefined} />
      )}

      {/* Tab 7: Center Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Google Firebase Storage Integration Status */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xs font-black">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-slate-900">Google Firebase Cloud Storage</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                    <span>Connected & Active</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Firestore Database ID: <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px]">adept-girder-7t8c4</code> • Persistent Cloud Sync Enabled
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFirebaseSync}
              disabled={syncingFirebase}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncingFirebase ? 'animate-spin' : ''}`} />
              <span>{syncingFirebase ? 'Syncing...' : 'Sync All Records to Firebase'}</span>
            </button>
          </div>

          {/* Section 1: Website Identity & Branding */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Website Name & Branding</h3>
                <p className="text-xs text-slate-500">Configure public center title, tagline, and VLE operator name shown across the website header.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Website / Center Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarkari Tatha Digital Service Center"
                  value={centerSettings.center_name || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, center_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Website Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Aapka Digital Saathi"
                  value={centerSettings.tagline || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">VLE / Operator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Center Manager / Proprietor Name"
                  value={centerSettings.vle_name || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, vle_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Website Logo Customization & Upload */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Website Logo Customization</h3>
                <p className="text-xs text-slate-500">Upload a custom logo image or paste an image URL to replace the default site logo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Upload Logo Image File</label>
                  <label className="flex items-center justify-center px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-orange-50/50 hover:border-orange-400 transition text-slate-600 font-semibold">
                    <Upload className="w-4 h-4 mr-2 text-orange-600" />
                    <span>Choose Logo Image (PNG, JPG, SVG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Or Paste Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/my-logo.png"
                    value={centerSettings.logo_url || ''}
                    onChange={(e) => setCenterSettings({ ...centerSettings, logo_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {centerSettings.logo_url && (
                  <button
                    type="button"
                    onClick={() => setCenterSettings({ ...centerSettings, logo_url: '' })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-extrabold transition flex items-center space-x-1.5"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset to Default Vector Badge Logo</span>
                  </button>
                )}
              </div>

              {/* Logo Preview Card */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Header Logo Preview</span>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                  {centerSettings.logo_url ? (
                    <div className="flex items-center space-x-3">
                      <img
                        src={centerSettings.logo_url}
                        alt="Custom Logo"
                        className="w-12 h-12 object-contain rounded-xl border border-slate-200"
                      />
                      <div>
                        <div className="font-black text-slate-900 text-sm uppercase">{centerSettings.center_name || 'Sarkari Tatha'}</div>
                        <div className="text-[10px] text-orange-600 font-bold uppercase">{centerSettings.tagline || 'Aapka Digital Saathi'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-slate-400 font-semibold text-xs">
                      Default Vector Badge Logo Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Website Photos Customization */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Website Photos & Banner Images</h3>
                <p className="text-xs text-slate-500">Upload or change hero section main image and about us center banner photo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Hero Main Photo */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Hero Section Main Photo</span>
                </h4>
                
                <label className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition text-slate-700 font-bold shadow-xs">
                  <Upload className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Upload Hero Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroPhotoUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or paste Hero Photo URL"
                  value={centerSettings.hero_photo_url || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, hero_photo_url: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                />

                {centerSettings.hero_photo_url && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-200">
                    <img
                      src={centerSettings.hero_photo_url}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCenterSettings({ ...centerSettings, hero_photo_url: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      title="Remove Hero Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* About Page Photo */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>About Us Center Banner Photo</span>
                </h4>

                <label className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition text-slate-700 font-bold shadow-xs">
                  <Upload className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Upload About Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAboutPhotoUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or paste About Banner Photo URL"
                  value={centerSettings.about_photo_url || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, about_photo_url: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                />

                {centerSettings.about_photo_url && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-200">
                    <img
                      src={centerSettings.about_photo_url}
                      alt="About Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCenterSettings({ ...centerSettings, about_photo_url: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      title="Remove About Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">To manage the physical infrastructure photo gallery on the website:</span>
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <ImageIcon className="w-4 h-4 text-orange-600" />
                <span>Manage Center Gallery Photos Tab →</span>
              </button>
            </div>
          </div>

          {/* Section 4: Notice Bar & Announcement */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Top Announcement Notice Bar</h3>
                <p className="text-xs text-slate-500">Notice bar text displayed at the top of every page.</p>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-800 mb-1.5">Top Banner Text</label>
              <input
                type="text"
                placeholder="e.g. Authorized CSC & Banking Service Point • Mon - Sat: 8:00 AM - 8:00 PM"
                value={centerSettings.notice_banner || ''}
                onChange={(e) => setCenterSettings({ ...centerSettings, notice_banner: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Section 5: Public Contact Details & Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Center Public Contact & Location Info</h3>
                <p className="text-xs text-slate-500">Helpline phone, email, physical address, and legal disclaimers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Customer Helpline Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={centerSettings.phone || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">WhatsApp Helpline Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={centerSettings.whatsapp || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Support Email Address</label>
                <input
                  type="email"
                  placeholder="support@sarkaritattha.com"
                  value={centerSettings.email || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">UPI ID for Application Fees</label>
                <input
                  type="text"
                  placeholder="sarkaritattha@upi"
                  value={centerSettings.upi_id || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, upi_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">Opening Hours</label>
                <input
                  type="text"
                  placeholder="Monday - Saturday: 8:00 AM - 8:00 PM"
                  value={centerSettings.opening_hours || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, opening_hours: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">Full Physical Street Address</label>
                <input
                  type="text"
                  placeholder="Shop No. 12, Main Market Road, Near Bus Stand, District Center"
                  value={centerSettings.address || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">Footer Legal Disclaimer Text</label>
                <textarea
                  rows={2}
                  placeholder="All services are processed subject to portal availability and guidelines. Government and third-party fees apply separately."
                  value={centerSettings.disclaimer_text || ''}
                  onChange={(e) => setCenterSettings({ ...centerSettings, disclaimer_text: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Floating Action Bar / Save Button */}
          <div className="sticky bottom-6 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-30">
            <span className="text-xs font-bold text-slate-300">Unsaved changes will take effect live on the website as soon as you save.</span>
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition transform hover:-translate-y-0.5 shadow-lg flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Website Branding & Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 8: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900">System Activity Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map((lg) => (
                  <tr key={lg.id}>
                    <td className="p-3 font-bold text-slate-900">{lg.user_name || 'System'}</td>
                    <td className="p-3 font-mono text-emerald-700">{lg.action}</td>
                    <td className="p-3">{lg.details}</td>
                    <td className="p-3 text-slate-400">{new Date(lg.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 9: Appointments & Center Visits */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Booked Physical Center Visits ({appointments.length})</h3>
              <p className="text-xs text-slate-500">Manage customer visit appointments, confirm slots, and update visit status.</p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Name / Mobile / ID..."
                  value={apptSearchTerm}
                  onChange={(e) => setApptSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <select
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="ALL">All Visit Statuses</option>
                <option value="Requested">Requested</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Visit ID</th>
                  <th className="p-3">Customer Name & Contact</th>
                  <th className="p-3">Service / Purpose</th>
                  <th className="p-3">Preferred Date & Time Slot</th>
                  <th className="p-3">Message / Notes</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {appointments
                  .filter((a) => {
                    const matchSearch =
                      !apptSearchTerm ||
                      (a.customer_name && a.customer_name.toLowerCase().includes(apptSearchTerm.toLowerCase())) ||
                      (a.mobile && a.mobile.includes(apptSearchTerm)) ||
                      (a.service_title && a.service_title.toLowerCase().includes(apptSearchTerm.toLowerCase())) ||
                      String(a.id).includes(apptSearchTerm);
                    const matchStatus = apptStatusFilter === 'ALL' || a.status === apptStatusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        #APPT-{a.id}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{a.customer_name || 'Customer'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{a.mobile || 'No Mobile'}</p>
                        {a.customer_id && (
                          <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-[9px] font-mono rounded font-bold text-slate-600 mt-0.5">
                            User ID: #{a.customer_id}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-emerald-800">{a.service_title}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1 font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{a.appointment_date}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{a.time_slot}</span>
                        </div>
                      </td>
                      <td className="p-3 max-w-xs text-[11px] text-slate-600 truncate">
                        {a.notes || <span className="italic text-slate-400">No notes provided</span>}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            a.status === 'Approved'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : a.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : a.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {a.status || 'Requested'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {a.status !== 'Approved' && a.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(a.id, 'Approved')}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {a.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(a.id, 'Completed')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            Complete
                          </button>
                        )}
                        {a.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(a.id, 'Cancelled')}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs italic">
                      No center visit appointments booked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Service Form */}
      {serviceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setServiceModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Service Title *</label>
                <input
                  type="text"
                  value={svcTitle}
                  onChange={(e) => setSvcTitle(e.target.value)}
                  required
                  placeholder="e.g. Aadhaar Address Update"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={svcCategory}
                    onChange={(e: any) => setSvcCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CSC">CSC e-Governance</option>
                    <option value="CSP">CSP Banking / AEPS</option>
                    <option value="OTHER">Utility & Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={svcSubcat}
                    onChange={(e) => setSvcSubcat(e.target.value)}
                    placeholder="e.g. Identity"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Govt Fee (₹)</label>
                  <input
                    type="number"
                    value={svcGovtFee}
                    onChange={(e) => setSvcGovtFee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Service Charge (₹)</label>
                  <input
                    type="number"
                    value={svcCharge}
                    onChange={(e) => setSvcCharge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Processing Time</label>
                  <input
                    type="text"
                    value={svcProcTime}
                    onChange={(e) => setSvcProcTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Required Documents (Comma Separated)</label>
                <input
                  type="text"
                  value={svcDocs}
                  onChange={(e) => setSvcDocs(e.target.value)}
                  placeholder="Aadhaar, PAN Card, Photo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Save Service Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: User Create Form */}
      {userModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setUserModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Add Staff or Admin Account</h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={usrName}
                  onChange={(e) => setUsrName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  value={usrEmail}
                  onChange={(e) => setUsrEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mobile *</label>
                <input
                  type="tel"
                  value={usrMobile}
                  onChange={(e) => setUsrMobile(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  value={usrPassword}
                  onChange={(e) => setUsrPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assign Role *</label>
                <select
                  value={usrRole}
                  onChange={(e: any) => setUsrRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="staff">Staff / Operator</option>
                  <option value="admin">Administrator</option>
                  <option value="customer">Customer Account</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User & Reset Password */}
      {editUserModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditUserModalOpen(false);
                setEditingUser(null);
              }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit User & Reset Password</h3>
                <p className="text-[11px] text-slate-500">ID #{editingUser.id} • {editingUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editUsrName}
                  onChange={(e) => setEditUsrName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={editUsrEmail}
                  onChange={(e) => setEditUsrEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    value={editUsrMobile}
                    onChange={(e) => setEditUsrMobile(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={editUsrRole}
                    onChange={(e: any) => setEditUsrRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="staff">Staff / Operator</option>
                    <option value="admin">Administrator</option>
                    <option value="customer">Customer Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editUsrAddress}
                  onChange={(e) => setEditUsrAddress(e.target.value)}
                  placeholder="Village / City address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editUsrActive ? 'active' : 'inactive'}
                  onChange={(e) => setEditUsrActive(e.target.value === 'active')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="inactive">Deactivated (Access Blocked)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-900 mb-1 flex items-center space-x-1">
                  <Key className="w-3.5 h-3.5 text-orange-600" />
                  <span>New Password (Optional)</span>
                </label>
                <input
                  type="text"
                  value={editUsrPassword}
                  onChange={(e) => setEditUsrPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Type a new password here if the staff/user forgot their password.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditUserModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save Account Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptAppNo && <ReceiptModal appNo={receiptAppNo} onClose={() => setReceiptAppNo(null)} />}

      {/* Admin Profile Modal */}
      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

      {/* Daily Cash Register Modal */}
      <DailyCashRegisterModal
        isOpen={cashRegisterModalOpen}
        onClose={() => setCashRegisterModalOpen(false)}
        registerData={cashRegisterData}
        onOpenRegister={handleOpenCashRegister}
        onReconcileRegister={handleReconcileCashRegister}
      />

      {/* Extended Customer Profile Modal */}
      <ExtendedCustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        customer={editingCustomer}
        onSave={handleSaveCustomerProfile}
        onAddAdvance={handleAddCustomerAdvance}
        onCheckDuplicate={handleCheckCustomerDuplicate}
      />

      {/* Staff Permissions Modal */}
      <StaffPermissionsModal
        isOpen={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false);
          setPermissionStaffUser(null);
        }}
        staffUser={permissionStaffUser}
        onSavePermissions={handleSaveStaffPermissions}
      />

      {/* Duplicate Check Modal */}
      <DuplicateCheckModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        matches={duplicateMatches}
        onSelectExisting={(match) => {
          setDuplicateModalOpen(false);
          const found = users.find((u) => u.id === match.customer_id || u.mobile === match.customer_mobile);
          if (found) {
            setEditingCustomer(found);
          } else {
            setEditingCustomer({
              id: match.customer_id || 0,
              name: match.customer_name,
              email: '',
              mobile: match.customer_mobile,
              role: 'customer',
              created_at: new Date().toISOString()
            });
          }
          setCustomerModalOpen(true);
        }}
      />
    </div>
  );
};
