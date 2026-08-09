import React, { useState, useEffect } from 'react';
import { DailyCashRegister } from '../types';
import { X, Landmark, Lock, CheckCircle2, AlertTriangle, RefreshCw, DollarSign, Calendar, FileText } from 'lucide-react';

interface DailyCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  registerData: DailyCashRegister | null;
  onOpenRegister: (openingCash: number) => Promise<void>;
  onReconcileRegister: (physicalCash: number, notes: string, lock: boolean) => Promise<void>;
}

export const DailyCashRegisterModal: React.FC<DailyCashRegisterModalProps> = ({
  isOpen,
  onClose,
  registerData,
  onOpenRegister,
  onReconcileRegister
}) => {
  const [openingCashInput, setOpeningCashInput] = useState('');
  const [physicalCashInput, setPhysicalCashInput] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (registerData) {
      setOpeningCashInput(String(registerData.opening_cash || 0));
      setPhysicalCashInput(String(registerData.physical_cash !== undefined ? registerData.physical_cash : registerData.expected_closing));
      setNotes(registerData.notes || '');
    }
  }, [registerData, isOpen]);

  if (!isOpen || !registerData) return null;

  const opening = Number(registerData.opening_cash || 0);
  const collections = Number(registerData.cash_collections || 0);
  const expenses = Number(registerData.cash_expenses || 0);
  const expectedClosing = opening + collections - expenses;
  const physical = Number(physicalCashInput || 0);
  const variance = physical - expectedClosing;

  const isLocked = registerData.status === 'LOCKED';

  const handleOpenRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onOpenRegister(Number(openingCashInput || 0));
      alert('Opening cash set successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to set opening cash.');
    } finally {
      setSaving(false);
    }
  };

  const handleReconcileSubmit = async (lock: boolean) => {
    setSaving(true);
    try {
      await onReconcileRegister(physical, notes, lock);
      alert(`Daily cash register successfully ${lock ? 'LOCKED' : 'RECONCILED'}!`);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to reconcile cash register.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-800">
          <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">Daily Cash Management & Register</h3>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isLocked ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {registerData.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">Date: <span className="text-slate-200 font-mono">{registerData.date}</span></p>
          </div>
        </div>

        {/* Formula breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase font-bold">1. Opening Cash</p>
            <p className="text-base font-bold text-slate-100 mt-1">₹{opening.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-emerald-500/30 rounded-xl">
            <p className="text-[10px] text-emerald-400 uppercase font-bold">+ Collections</p>
            <p className="text-base font-bold text-emerald-400 mt-1">₹{collections.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-rose-500/30 rounded-xl">
            <p className="text-[10px] text-rose-400 uppercase font-bold">- Expenses</p>
            <p className="text-base font-bold text-rose-400 mt-1">₹{expenses.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-blue-500/30 rounded-xl">
            <p className="text-[10px] text-blue-400 uppercase font-bold font-mono">= Expected</p>
            <p className="text-base font-bold text-blue-300 mt-1">₹{expectedClosing.toFixed(2)}</p>
          </div>
        </div>

        {/* Physical Cash Input & Discrepancy */}
        <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Physical Cash Count in Drawer (₹)
            </label>
            <input
              type="number"
              disabled={isLocked}
              value={physicalCashInput}
              onChange={(e) => setPhysicalCashInput(e.target.value)}
              placeholder="Enter counted physical cash"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            variance === 0
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : variance > 0
              ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center space-x-2">
              {variance === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {variance === 0 ? 'Balanced Register (No Discrepancy)' : variance > 0 ? 'Surplus Cash Recorded' : 'Shortage / Discrepancy Alert'}
                </p>
                <p className="text-[11px] opacity-80">Variance = Physical - Expected</p>
              </div>
            </div>

            <span className="text-lg font-bold font-mono">
              {variance >= 0 ? `+₹${variance.toFixed(2)}` : `-₹${Math.abs(variance).toFixed(2)}`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Notes / Reason for Discrepancy</label>
            <textarea
              rows={2}
              disabled={isLocked}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. ₹50 loose change added by manager"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Close Window
          </button>

          {!isLocked && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleReconcileSubmit(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Save Reconciliation
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleReconcileSubmit(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Reconcile & Lock Day</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
