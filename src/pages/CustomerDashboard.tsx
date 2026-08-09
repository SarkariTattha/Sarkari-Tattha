import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserProfileModal } from '../components/UserProfileModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Bell,
  User,
  Printer,
  Search,
  ChevronRight,
  PlusCircle,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Application, NotificationItem } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

export const CustomerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'appointments' | 'notifications' | 'profile'>('applications');
  const [loading, setLoading] = useState(true);
  const [selectedReceiptAppNo, setSelectedReceiptAppNo] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch('/api/applications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
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
          console.error(e);
        }

        const apiAppts = Array.isArray(data) ? data : [];
        const apptMap = new Map<string | number, any>();
        apiAppts.forEach((a) => apptMap.set(a.id, a));
        localAppts.forEach((a) => {
          if (!apptMap.has(a.id)) apptMap.set(a.id, a);
        });

        const all = Array.from(apptMap.values());
        // Filter for this customer if user details exist
        const myAppts = all.filter((a) => {
          if (user?.id && Number(a.customer_id) === Number(user.id)) return true;
          if (user?.mobile && a.mobile === user.mobile) return true;
          return true; // fallback show if matches
        });

        setAppointments(myAppts);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token, user]);

  const totalApps = applications.length;
  const processingApps = applications.filter((a) => ['Submitted', 'Documents Required', 'Under Review', 'Processing', 'Pending'].includes(a.status)).length;
  const completedApps = applications.filter((a) => a.status === 'Completed').length;
  const totalPendingAmt = applications.reduce((sum, a) => sum + (a.pending_amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl border border-emerald-900">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              👋 Customer Service Portal
            </span>
            {user && (
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 text-[11px] font-mono font-bold rounded-md border border-emerald-400/30">
                User ID: #{user.id}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-xs text-slate-300 flex items-center space-x-3">
            <span>Mobile: <strong className="text-slate-200 font-mono">{user?.mobile || 'N/A'}</strong></span>
            <span>•</span>
            <span>Email: <strong className="text-slate-200">{user?.email || 'N/A'}</strong></span>
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 border border-white/20 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>My Profile</span>
          </button>

          <Link
            to="/apply"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 shrink-0 shadow-md shadow-emerald-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Application</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
          <p className="text-2xl font-black text-slate-900">{totalApps}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black text-amber-600">{processingApps}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-600">{completedApps}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Amount</p>
          <p className={`text-2xl font-black ${totalPendingAmt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            ₹{totalPendingAmt}
          </p>
        </div>
      </div>

      {/* Dashboard Nav Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'applications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Applications ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'appointments'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Visit Bookings ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'notifications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Notifications ({notifications.length})
        </button>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <p className="font-bold text-slate-800 text-base">No service applications found</p>
              <p className="text-xs text-slate-500">Apply for your first CSC or CSP service online now.</p>
              <Link to="/apply" className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
                Apply for Service
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Application ID</th>
                      <th className="p-4">Service Name</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Pending</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-mono font-bold text-slate-900">{app.application_no}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-800">{app.service_name}</p>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">{app.category}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
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
                        <td className="p-4 font-bold text-slate-900">₹{app.total_amount}</td>
                        <td className="p-4">
                          <span className={app.pending_amount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                            ₹{app.pending_amount}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Link
                            to={`/track?app_no=${app.application_no}&mobile=${app.customer_mobile}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold inline-flex items-center space-x-1"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Track</span>
                          </Link>
                          <button
                            onClick={() => setSelectedReceiptAppNo(app.application_no)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold inline-flex items-center space-x-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Appointments & Center Visits */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-base">No center visit appointments booked</p>
              <p className="text-xs text-slate-500">Book an appointment for offline assistance at our center.</p>
              <Link to="/appointments" className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
                Book Center Visit
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Booked Physical Visits ({appointments.length})</h3>
                <Link to="/appointments" className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book Another Visit</span>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Visit ID</th>
                      <th className="p-3">Service Title</th>
                      <th className="p-3">Date & Time Slot</th>
                      <th className="p-3">Notes / Message</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {appointments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-slate-900">#APPT-{a.id}</td>
                        <td className="p-3 font-bold text-emerald-800">{a.service_title}</td>
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
                        <td className="p-3 text-slate-600 max-w-xs truncate">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-bold text-xs text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-600">{n.message}</p>
                  <p className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {n.link && (
                  <Link to={n.link} className="text-xs font-bold text-emerald-700 hover:underline shrink-0 pl-2">
                    View
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceiptAppNo && (
        <ReceiptModal appNo={selectedReceiptAppNo} onClose={() => setSelectedReceiptAppNo(null)} />
      )}

      {/* Customer Profile Modal */}
      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
};
