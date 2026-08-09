import React, { useState, useEffect } from 'react';
import { User, StaffPermissions } from '../types';
import { X, ShieldCheck, Lock, CheckSquare, Square, Check, Key } from 'lucide-react';

interface StaffPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser: User | null;
  onSavePermissions: (staffId: number, permissions: StaffPermissions) => Promise<void>;
}

export const StaffPermissionsModal: React.FC<StaffPermissionsModalProps> = ({
  isOpen,
  onClose,
  staffUser,
  onSavePermissions
}) => {
  const [permissions, setPermissions] = useState<StaffPermissions>({
    can_approve_apps: true,
    can_edit_apps: true,
    can_delete_apps: false,
    can_issue_receipts: true,
    can_manage_expenses: true,
    can_view_reports: true,
    can_manage_cash: true,
    can_manage_customers: true,
    can_manage_services: false
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staffUser) {
      const defaultPerms: StaffPermissions = {
        can_approve_apps: true,
        can_edit_apps: true,
        can_delete_apps: staffUser.role === 'admin' || staffUser.role === 'super_admin',
        can_issue_receipts: true,
        can_manage_expenses: true,
        can_view_reports: true,
        can_manage_cash: true,
        can_manage_customers: true,
        can_manage_services: staffUser.role === 'admin' || staffUser.role === 'super_admin'
      };

      if (staffUser.permissions) {
        setPermissions({ ...defaultPerms, ...staffUser.permissions });
      } else {
        setPermissions(defaultPerms);
      }
    }
  }, [staffUser, isOpen]);

  if (!isOpen || !staffUser) return null;

  const togglePermission = (key: keyof StaffPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSavePermissions(staffUser.id, permissions);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update permissions.');
    } finally {
      setSaving(false);
    }
  };

  const permItems: { key: keyof StaffPermissions; label: string; desc: string }[] = [
    { key: 'can_approve_apps', label: 'Approve / Update Applications', desc: 'Can process and change status of customer applications' },
    { key: 'can_edit_apps', label: 'Edit Application Details', desc: 'Can update customer application fields and documents' },
    { key: 'can_issue_receipts', label: 'Collect Payments & Issue Receipts', desc: 'Can collect cash/UPI payments and generate official receipts' },
    { key: 'can_manage_cash', label: 'Daily Cash Register & Closure', desc: 'Can open, count physical cash, and reconcile daily register' },
    { key: 'can_manage_customers', label: 'Manage Extended Customer Profiles', desc: 'Can create and update customer records and advance deposits' },
    { key: 'can_manage_expenses', label: 'Record Center Expenses', desc: 'Can enter daily center expenses and upload receipts' },
    { key: 'can_view_reports', label: 'View Financial & Audit Reports', desc: 'Can view profit margins, revenue charts, and ledger reports' },
    { key: 'can_manage_services', label: 'Manage Services Catalog & Fees', desc: 'Can add/edit CSC & CSP services and center fees' },
    { key: 'can_delete_apps', label: 'Delete Records & Applications', desc: 'Can permanently delete application records from system' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-800">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Granular Role Permissions</h3>
            <p className="text-xs text-slate-400">
              User: <span className="text-indigo-300 font-bold">{staffUser.name}</span> ({staffUser.role.toUpperCase()})
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
          Toggle individual operational permissions below. Configured authorizations immediately control UI actions and server API access for this user.
        </p>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 mb-5">
          {permItems.map(item => {
            const isChecked = Boolean(permissions[item.key]);
            return (
              <div
                key={item.key}
                onClick={() => togglePermission(item.key)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                  isChecked
                    ? 'bg-indigo-950/40 border-indigo-500/50 hover:border-indigo-400'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 opacity-70'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {isChecked ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold ${isChecked ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Permissions Matrix'}
          </button>
        </div>
      </div>
    </div>
  );
};
