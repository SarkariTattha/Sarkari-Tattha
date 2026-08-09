import React, { useState, useEffect } from 'react';
import { Download, Printer, Search, FileText, TrendingUp, DollarSign, UserCheck, ShieldAlert, Calendar, History, ArrowRight } from 'lucide-react';
import { AuditDiffLog, User, Application } from '../types';

interface ReportsAndDiffLogsSectionProps {
  token: string | null;
  onSelectApplicationForPayment?: (app: Application) => void;
}

export const ReportsAndDiffLogsSection: React.FC<ReportsAndDiffLogsSectionProps> = ({
  token,
  onSelectApplicationForPayment
}) => {
  const [subTab, setSubTab] = useState<'profitability' | 'pending_dues' | 'ledger' | 'diff_logs'>('profitability');

  // Profitability
  const [profitData, setProfitData] = useState<any[]>([]);
  const [profitLoading, setProfitLoading] = useState(false);

  // Pending Dues
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Customer Ledger
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Diff Logs
  const [diffLogs, setDiffLogs] = useState<AuditDiffLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState('');

  // Fetch profitability
  const fetchProfitability = async () => {
    setProfitLoading(true);
    try {
      const res = await fetch('/api/admin/reports/service-profitability', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfitData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfitLoading(false);
    }
  };

  // Fetch pending dues
  const fetchPendingDues = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch('/api/admin/reports/pending-dues', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingApps(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPendingLoading(false);
    }
  };

  // Fetch customers list for ledger search
  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch single customer ledger
  const fetchCustomerLedger = async (id: string) => {
    if (!id) return;
    setLedgerLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/customer-ledger/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLedgerData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Fetch diff logs
  const fetchDiffLogs = async () => {
    setLogsLoading(true);
    try {
      let url = '/api/admin/audit-diff-logs?limit=100';
      if (entityFilter) url += `&entity_type=${entityFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDiffLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'profitability') fetchProfitability();
    if (subTab === 'pending_dues') fetchPendingDues();
    if (subTab === 'ledger') {
      fetchCustomers();
    }
    if (subTab === 'diff_logs') fetchDiffLogs();
  }, [subTab, entityFilter]);

  // CSV Export helper
  const exportToCSV = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('profitability')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              subTab === 'profitability' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Service Profitability</span>
          </button>

          <button
            onClick={() => setSubTab('pending_dues')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              subTab === 'pending_dues' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Pending Dues Tracker</span>
          </button>

          <button
            onClick={() => setSubTab('ledger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              subTab === 'ledger' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Customer Profile Ledger</span>
          </button>

          <button
            onClick={() => setSubTab('diff_logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              subTab === 'diff_logs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Field Audit Diff Logs</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Service Profitability */}
      {subTab === 'profitability' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Service Profitability & Margin Analysis</h3>
              <p className="text-xs text-slate-400">Breakdown of applications count, gross revenue, government fees, and center margin</p>
            </div>
            <button
              onClick={() => exportToCSV('Service_Profitability_Report', profitData)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {profitLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading profitability metrics...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Service Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Govt Fee</th>
                    <th className="px-4 py-3 text-right">Center Charge</th>
                    <th className="px-4 py-3 text-right">Total Price</th>
                    <th className="px-4 py-3 text-center">Applications</th>
                    <th className="px-4 py-3 text-right">Gross Revenue</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Est. Center Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profitData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-bold text-white">{item.title}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-mono text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">₹{item.govt_fee}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">₹{item.service_charge}</td>
                      <td className="px-4 py-3 text-right font-mono text-white font-bold">₹{item.total_price}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-400">{item.application_count}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">₹{item.gross_revenue}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">₹{item.estimated_center_margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Pending Dues Tracker */}
      {subTab === 'pending_dues' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-amber-400">Pending Dues & Outstanding Balances</h3>
              <p className="text-xs text-slate-400">Track unpaid or partially paid applications and customer advance balances</p>
            </div>
            <button
              onClick={() => exportToCSV('Pending_Dues_Report', pendingApps)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {pendingLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading pending dues...</div>
          ) : pendingApps.length === 0 ? (
            <div className="p-8 text-center text-emerald-400 text-xs font-semibold">
              ✓ All applications are fully settled! Zero pending dues.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">App No</th>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3 text-right">Total Fee</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Pending Amount</th>
                    <th className="px-4 py-3 text-right">Advance Bal</th>
                    <th className="px-4 py-3 text-center rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pendingApps.map((app, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-blue-400">{app.application_no}</td>
                      <td className="px-4 py-3 font-bold text-white">{app.customer_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{app.customer_mobile}</td>
                      <td className="px-4 py-3">{app.service_name}</td>
                      <td className="px-4 py-3 text-right font-mono">₹{app.total_amount}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400">₹{app.paid_amount}</td>
                      <td className="px-4 py-3 text-right font-mono text-amber-400 font-bold">₹{app.pending_amount}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-300">₹{app.advance_balance || 0}</td>
                      <td className="px-4 py-3 text-center">
                        {onSelectApplicationForPayment && (
                          <button
                            onClick={() => onSelectApplicationForPayment(app)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                          >
                            Collect
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: Customer Profile Ledger */}
      {subTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Customer Profile Ledger & History</h3>
            <p className="text-xs text-slate-400">Select a customer to view complete transaction, application, and audit log history</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                fetchCustomerLedger(e.target.value);
              }}
              className="w-full sm:w-80 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile}) - Adv: ₹{c.advance_balance || 0}
                </option>
              ))}
            </select>
          </div>

          {ledgerLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading customer ledger...</div>
          ) : ledgerData ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Customer Name</p>
                  <p className="text-base font-bold text-white">{ledgerData.customer.name}</p>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{ledgerData.customer.mobile}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Aadhaar / PAN</p>
                  <p className="text-xs font-mono text-slate-200 mt-1">Aadhaar: {ledgerData.customer.aadhaar_no || 'N/A'}</p>
                  <p className="text-xs font-mono text-slate-200">PAN: {ledgerData.customer.pan_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Balances</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">Advance: ₹{ledgerData.customer.advance_balance || 0}</p>
                  <p className="text-xs font-bold text-amber-400">Pending Dues: ₹{ledgerData.customer.pending_dues || 0}</p>
                </div>
              </div>

              {/* Applications History */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Submitted Applications</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">App No</th>
                        <th className="px-3 py-2">Service</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-3 py-2 text-right">Paid</th>
                        <th className="px-3 py-2 text-right">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {ledgerData.applications.map((app: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono font-bold text-blue-400">{app.application_no}</td>
                          <td className="px-3 py-2">{app.service_name}</td>
                          <td className="px-3 py-2 font-semibold text-emerald-400">{app.status}</td>
                          <td className="px-3 py-2 text-right font-mono">₹{app.total_amount}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-400">₹{app.paid_amount}</td>
                          <td className="px-3 py-2 text-right font-mono text-amber-400">₹{app.pending_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">Select a customer above to generate detailed profile ledger.</div>
          )}
        </div>
      )}

      {/* Sub-tab 4: Field Audit Diff Logs */}
      {subTab === 'diff_logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-purple-400">Field Audit Diff Logs</h3>
              <p className="text-xs text-slate-400">Detailed record of field updates showing old vs. new value, user, role, and action type</p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="">All Entities</option>
                <option value="APPLICATION">Applications</option>
                <option value="CUSTOMER">Customers</option>
                <option value="PAYMENT">Payments</option>
                <option value="STAFF_PERMISSIONS">Permissions</option>
              </select>

              <button
                onClick={() => exportToCSV('Field_Audit_Diff_Logs', diffLogs)}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {logsLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading audit diff logs...</div>
          ) : diffLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No audit diff logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5 rounded-l-xl">Timestamp</th>
                    <th className="px-3 py-2.5">Entity</th>
                    <th className="px-3 py-2.5">Reference</th>
                    <th className="px-3 py-2.5">Field Changed</th>
                    <th className="px-3 py-2.5 text-rose-300">Old Value</th>
                    <th className="px-3 py-2.5 text-emerald-300">New Value</th>
                    <th className="px-3 py-2.5">Staff User</th>
                    <th className="px-3 py-2.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {diffLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-bold text-purple-300">{log.entity_type}</td>
                      <td className="px-3 py-2 font-mono text-white">{log.entity_ref || log.entity_id}</td>
                      <td className="px-3 py-2 font-semibold text-blue-300">{log.field_name}</td>
                      <td className="px-3 py-2 font-mono text-rose-400 max-w-xs truncate">{log.old_value || '(empty)'}</td>
                      <td className="px-3 py-2 font-mono text-emerald-400 max-w-xs truncate">{log.new_value || '(empty)'}</td>
                      <td className="px-3 py-2">
                        <span className="font-bold text-slate-200">{log.changed_by_name}</span>{' '}
                        <span className="text-[10px] text-slate-400">({log.changed_by_role})</span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                        {log.action_type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
