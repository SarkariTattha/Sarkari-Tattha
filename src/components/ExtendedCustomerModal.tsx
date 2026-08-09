import React, { useState, useEffect } from 'react';
import { User, DuplicateMatch } from '../types';
import { X, UserCheck, Shield, CreditCard, DollarSign, Plus, FileText, Phone, Mail, MapPin, Calendar, AlertCircle } from 'lucide-react';

interface ExtendedCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: User | null;
  onSave: (data: any) => Promise<void>;
  onAddAdvance?: (customerId: number, amount: number, method: string, notes: string) => Promise<void>;
  onCheckDuplicate?: (data: { mobile?: string; aadhaar_no?: string; pan_no?: string }) => Promise<DuplicateMatch[]>;
}

export const ExtendedCustomerModal: React.FC<ExtendedCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
  onAddAdvance,
  onCheckDuplicate
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [voterId, setVoterId] = useState('');
  const [rationCard, setRationCard] = useState('');
  const [dob, setDob] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [advanceBalance, setAdvanceBalance] = useState('0');

  // Deposit Advance state
  const [showAdvanceDeposit, setShowAdvanceDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('Cash');
  const [depositNotes, setDepositNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setMobile(customer.mobile || '');
      setAddress(customer.address || '');
      setAadhaarNo(customer.aadhaar_no || '');
      setPanNo(customer.pan_no || '');
      setVoterId(customer.voter_id || '');
      setRationCard(customer.ration_card || '');
      setDob(customer.dob || '');
      setEmergencyContact(customer.emergency_contact || '');
      setAdvanceBalance(String(customer.advance_balance || '0'));
    } else {
      setName('');
      setEmail('');
      setMobile('');
      setAddress('');
      setAadhaarNo('');
      setPanNo('');
      setVoterId('');
      setRationCard('');
      setDob('');
      setEmergencyContact('');
      setAdvanceBalance('0');
    }
    setDuplicateWarning(null);
    setShowAdvanceDeposit(false);
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleMobileBlur = async () => {
    if (!onCheckDuplicate || customer) return;
    if (mobile.trim().length >= 10) {
      const duplicates = await onCheckDuplicate({ mobile, aadhaar_no: aadhaarNo, pan_no: panNo });
      if (duplicates.length > 0) {
        setDuplicateWarning(`Warning: ${duplicates.length} existing record(s) found matching ${duplicates[0].matched_field.toUpperCase()} (${duplicates[0].matched_value}).`);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: customer?.id,
        name,
        email,
        mobile,
        address,
        aadhaar_no: aadhaarNo,
        pan_no: panNo,
        voter_id: voterId,
        ration_card: rationCard,
        dob,
        emergency_contact: emergencyContact,
        advance_balance: Number(advanceBalance)
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save customer profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id || !onAddAdvance) return;
    if (!depositAmount || Number(depositAmount) <= 0) {
      alert('Please enter a valid positive deposit amount.');
      return;
    }
    try {
      await onAddAdvance(customer.id, Number(depositAmount), depositMethod, depositNotes);
      setDepositAmount('');
      setDepositNotes('');
      setShowAdvanceDeposit(false);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to deposit advance balance.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {customer ? `Edit Extended Customer Profile: ${customer.name}` : 'Create New Extended Customer Profile'}
            </h3>
            <p className="text-xs text-slate-400">Manage Indian National Documents, Identity IDs, and Advance Balances</p>
          </div>
        </div>

        {duplicateWarning && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-2 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (Primary Key) *</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onBlur={handleMobileBlur}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@email.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Shield className="w-4 h-4" />
              <span>Government Identity Cards & Documents</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aadhaar Number (12 Digits)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadhaarNo}
                  onChange={(e) => setAadhaarNo(e.target.value)}
                  placeholder="1234 5678 9012"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PAN Card Number (10 Alphanumeric)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Voter ID Card Number</label>
                <input
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                  placeholder="ABC1234567"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ration Card Number</label>
                <input
                  type="text"
                  value={rationCard}
                  onChange={(e) => setRationCard(e.target.value)}
                  placeholder="Ration Card ID"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Village / Town / Street Address"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Number</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Relative / Guardian Mobile"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[11px] text-slate-400">Current Advance Balance</p>
                <p className="text-base font-bold text-emerald-400">₹{Number(advanceBalance || 0).toFixed(2)}</p>
              </div>
              {customer && onAddAdvance && (
                <button
                  type="button"
                  onClick={() => setShowAdvanceDeposit(!showAdvanceDeposit)}
                  className="ml-3 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  + Add Advance Deposit
                </button>
              )}
            </div>

            {customer && (
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
                <p className="text-[11px] text-slate-400">Total Pending Dues</p>
                <p className="text-base font-bold text-amber-400">₹{Number(customer.pending_dues || 0).toFixed(2)}</p>
              </div>
            )}
          </div>

          {showAdvanceDeposit && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-emerald-300">Deposit Cash / UPI into Customer Advance Balance</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Deposit Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Bank Transfer">Bank Transfer / IMPS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Notes / Txn Ref</label>
                  <input
                    type="text"
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                    placeholder="e.g. Advance for PAN card"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceDeposit(false)}
                  className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDepositSubmit}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {saving ? 'Saving...' : customer ? 'Save Profile Changes' : 'Create Customer Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
