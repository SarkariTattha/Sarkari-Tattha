import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Download,
  Building2,
  Printer,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';

export const TrackApplicationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryAppNo = searchParams.get('app_no') || '';
  const queryMobile = searchParams.get('mobile') || '';

  const [appNo, setAppNo] = useState(queryAppNo);
  const [mobile, setMobile] = useState(queryMobile);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchStatus = (no: string, mob: string) => {
    if (!no || !mob) return;
    setLoading(true);
    setError('');

    fetch(`/api/applications/track?app_no=${encodeURIComponent(no)}&mobile=${encodeURIComponent(mob)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Application not found with the provided Application ID and Mobile.');
        return res.json();
      })
      .then((resData) => setData(resData))
      .catch((err) => {
        setData(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (queryAppNo && queryMobile) {
      fetchStatus(queryAppNo, queryMobile);
    }
  }, [queryAppNo, queryMobile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(appNo, mobile);
  };

  // Status timeline steps helper
  const statuses = ['Submitted', 'Under Review', 'Processing', 'Completed'];
  const getStepIndex = (currentStatus: string) => {
    if (currentStatus === 'Completed') return 3;
    if (currentStatus === 'Processing' || currentStatus === 'Pending') return 2;
    if (currentStatus === 'Under Review' || currentStatus === 'Documents Required') return 1;
    return 0;
  };

  const activeIndex = data ? getStepIndex(data.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          24x7 Application Tracking
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Track Service Application</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your unique Application Reference ID and registered Mobile Number to check real-time application progress.
        </p>
      </div>

      {/* Search Bar Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Application ID *</label>
            <input
              type="text"
              value={appNo}
              onChange={(e) => setAppNo(e.target.value)}
              placeholder="e.g. CSC-2026-000101"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono font-medium"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile *</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Track Application'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Track Result Card */}
      {data && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black font-mono text-slate-900">{data.application_no}</span>
                <span className="px-3 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
                  {data.category}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 mt-1">{data.service_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Submitted on: {new Date(data.created_at).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setShowReceipt(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shrink-0"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>View / Print Receipt</span>
            </button>
          </div>

          {/* Visual Progress Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Progress</h3>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {statuses.map((st, idx) => {
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={st} className="flex sm:flex-col items-center space-x-3 sm:space-x-0 sm:space-y-2 z-10 flex-1 text-left sm:text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-700' : 'text-slate-800'}`}>{st}</p>
                      <p className="text-[10px] text-slate-400">
                        {idx === 0 ? 'Received' : idx === 1 ? 'Verification' : idx === 2 ? 'Processing' : 'Issued'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Notes Box */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Current Status & Notes:</p>
            <p className="text-xs font-medium text-slate-800">{data.status_notes || 'Application undergoing standard verification.'}</p>
          </div>

          {/* Application Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Customer Profile</h4>
              <p><strong className="text-slate-600">Name:</strong> {data.customer_name}</p>
              <p><strong className="text-slate-600">Mobile:</strong> {data.customer_mobile}</p>
              {data.customer_email && <p><strong className="text-slate-600">Email:</strong> {data.customer_email}</p>}
              {data.address && <p><strong className="text-slate-600">Address:</strong> {data.address}</p>}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Payment Breakdown</h4>
              <p className="flex justify-between">
                <span className="text-slate-600">Total Amount:</span>
                <strong className="text-slate-900">₹{data.total_amount}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-600">Paid Amount:</span>
                <strong className="text-emerald-700">₹{data.paid_amount}</strong>
              </p>
              <p className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Pending Balance:</span>
                <strong className={data.pending_amount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                  ₹{data.pending_amount}
                </strong>
              </p>
            </div>
          </div>

          {/* Attached Documents */}
          {data.documents && data.documents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Uploaded Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.documents.map((doc: any) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium text-slate-800">{doc.document_name}</span>
                    </div>
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:underline shrink-0 pl-2"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal Trigger */}
      {showReceipt && data && (
        <ReceiptModal appNo={data.application_no} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
};
