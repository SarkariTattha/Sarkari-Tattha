import React, { useState, useEffect } from 'react';
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
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Application, Expense } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

export const StaffDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingApps, setPendingApps] = useState<Application[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
            Staff Operations Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Operator: {user?.name}</h1>
          <p className="text-xs text-slate-300">Process customer applications, record payments & log center expenses</p>
        </div>

        <button
          onClick={() => setExpenseModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 shrink-0 shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Center Expense</span>
        </button>
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
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
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
    </div>
  );
};
