import React, { useState, useEffect } from 'react';
import { UserProfileModal } from '../components/UserProfileModal';
import { ExtendedCustomerModal } from '../components/ExtendedCustomerModal';
import { DailyCashRegisterModal } from '../components/DailyCashRegisterModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  PlusCircle,
  Search,
  DollarSign,
  UploadCloud,
  X,
  Users,
  Printer,
  Shield,
  UserCheck,
  Calendar,
  Landmark,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Application, Expense, User, DailyCashRegister } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

export const StaffDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingApps, setPendingApps] = useState<Application[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [apptSearchTerm, setApptSearchTerm] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [statusModalApp, setStatusModalApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState('Processing');
  const [statusNotes, setStatusNotes] = useState('');

  const [paymentModalApp, setPaymentModalApp] = useState<Application | null>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState('Stationery');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [receiptAppNo, setReceiptAppNo] = useState<string | null>(null);

  // Cash Register State
  const [cashRegisterModalOpen, setCashRegisterModalOpen] = useState(false);
  const [cashRegisterData, setCashRegisterData] = useState<DailyCashRegister | null>(null);

  // Customer Profile State
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);

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
    fetchData();
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
    fetchData();
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

  const fetchData = () => {
    if (!token) return;
    setLoading(true);

    fetch('/api/applications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('/api/payments/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setPendingApps(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('/api/expenses', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('/api/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        let localAppts: any[] = [];
        try {
          const raw = localStorage.getItem('csc_local_appointments');
          if (raw) localAppts = JSON.parse(raw);
        } catch (e) {
          console.error('Local appointments parse error:', e);
        }
        const apiAppts = Array.isArray(data) ? data : [];
        const apptMap = new Map<string | number, any>();
        apiAppts.forEach((a) => apptMap.set(a.id, a));
        localAppts.forEach((a) => {
          if (!apptMap.has(a.id)) apptMap.set(a.id, a);
        });
        setAppointments(Array.from(apptMap.values()));
      })
      .catch((err) => console.error(err))
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
      console.error(e);
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
    fetchData();
  }, [token]);

  // Update Status
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalApp) return;

    try {
      const res = await fetch(`/api/applications/${statusModalApp.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, status_notes: statusNotes })
      });
      if (res.ok) {
        setStatusModalApp(null);
        setStatusNotes('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Collect Payment
  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalApp || !amountPaid) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          application_id: paymentModalApp.id,
          amount_paid: Number(amountPaid),
          payment_method: paymentMethod
        })
      });
      if (res.ok) {
        setPaymentModalApp(null);
        setAmountPaid('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Log Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expDesc) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expCategory,
          amount: Number(expAmount),
          description: expDesc,
          payment_method: 'Cash'
        })
      });
      if (res.ok) {
        setExpenseModalOpen(false);
        setExpAmount('');
        setExpDesc('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchSearch =
      app.application_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customer_mobile.includes(searchTerm) ||
      app.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Staff Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl border border-emerald-900">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              🧑‍💻 CSC + CSP Staff Operations Portal
            </span>
            {user && (
              <span className="px-2.5 py-0.5 bg-amber-500/30 text-amber-200 text-[11px] font-mono font-bold rounded-md border border-amber-400/30">
                User ID: #{user.id}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Operator: {user?.name || 'Staff Operator'}
          </h1>
          <p className="text-xs text-slate-300 flex items-center space-x-3">
            <span>Role: <strong className="text-emerald-300 font-semibold">{user?.role.toUpperCase()} OPERATOR</strong></span>
            <span>•</span>
            <span>Mobile: <strong className="text-slate-200 font-mono">{user?.mobile || '9876543211'}</strong></span>
            <span>•</span>
            <span>Email: <strong className="text-slate-200">{user?.email}</strong></span>
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
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Expense</span>
          </button>
        </div>
      </div>

      {/* Applications Processing Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">Active Service Queue ({filteredApps.length})</h2>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search App ID / Name / Mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">App ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Service Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total / Pending</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold text-slate-900">{app.application_no}</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{app.customer_name}</p>
                    <p className="text-[10px] text-slate-500">{app.customer_mobile}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{app.service_name}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">{app.category}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        app.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">₹{app.total_amount}</p>
                    <p className={app.pending_amount > 0 ? 'text-amber-600 text-[10px] font-bold' : 'text-emerald-600 text-[10px]'}>
                      Pending: ₹{app.pending_amount}
                    </p>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setStatusModalApp(app);
                        setNewStatus(app.status);
                        setStatusNotes(app.status_notes || '');
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold"
                    >
                      Status
                    </button>

                    {app.pending_amount > 0 && (
                      <button
                        onClick={() => {
                          setPaymentModalApp(app);
                          setAmountPaid(String(app.pending_amount));
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold"
                      >
                        Collect ₹
                      </button>
                    )}

                    <button
                      onClick={() => setReceiptAppNo(app.application_no)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Amounts Collection Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Pending Customer Collections ({pendingApps.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingApps.map((app) => (
            <div key={app.id} className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{app.customer_name}</p>
                  <p className="text-xs text-slate-500">{app.customer_mobile}</p>
                </div>
                <span className="font-mono text-xs font-bold text-slate-700">{app.application_no}</span>
              </div>
              <p className="text-xs text-slate-700 truncate">{app.service_name}</p>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200/60 text-xs">
                <span className="font-bold text-amber-800">Pending: ₹{app.pending_amount}</span>
                <button
                  onClick={() => {
                    setPaymentModalApp(app);
                    setAmountPaid(String(app.pending_amount));
                  }}
                  className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg text-xs"
                >
                  Collect Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booked Center Visit Appointments Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Booked Center Visits & Appointments ({appointments.length})</h2>
            <p className="text-xs text-slate-500">Customer visit bookings for offline service assistance.</p>
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
                <th className="p-3">Customer & Contact</th>
                <th className="p-3">Service</th>
                <th className="p-3">Preferred Date & Time Slot</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
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
                      {a.notes || <span className="italic text-slate-400">No notes</span>}
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

      {/* Modal 1: Update Status */}
      {statusModalApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setStatusModalApp(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Update Status: {statusModalApp.application_no}</h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Documents Required">Documents Required</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Notes / Message to Customer</label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Documents verified. Certificate generated."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Save & Send Customer Update
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Collect Payment */}
      {paymentModalApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setPaymentModalApp(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Record Payment: {paymentModalApp.application_no}</h3>

            <div className="bg-emerald-50 p-3 rounded-2xl text-xs space-y-1">
              <p>Customer: <strong>{paymentModalApp.customer_name}</strong></p>
              <p>Total Fee: ₹{paymentModalApp.total_amount} | Current Pending: <strong>₹{paymentModalApp.pending_amount}</strong></p>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Collected (₹)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                  min="1"
                  max={paymentModalApp.pending_amount}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Cash">Cash Counter</option>
                  <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                  <option value="ADVANCE_BALANCE">Deduct from Customer Advance Balance</option>
                  <option value="Debit Card">Debit / Credit Card</option>
                  <option value="NetBanking">NetBanking</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Record Payment & Update Balance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Log Expense */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setExpenseModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Log Center Expense</h3>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Stationery">Stationery (Paper, Ink, Envelopes)</option>
                  <option value="Internet">Internet Broadband</option>
                  <option value="Electricity">Electricity Bill</option>
                  <option value="Rent">Shop Rent</option>
                  <option value="Maintenance">Printer / System Maintenance</option>
                  <option value="Office Expenses">Office Refreshment / Misc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="e.g. 500"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Purchased 2 Reams A4 Paper"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Log Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptAppNo && <ReceiptModal appNo={receiptAppNo} onClose={() => setReceiptAppNo(null)} />}

      {/* Staff Profile Modal */}
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
    </div>
  );
};
