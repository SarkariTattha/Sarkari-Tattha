import React, { useState } from 'react';
import { User, Shield, Phone, Mail, MapPin, Key, X, Check, Calendar, Edit3, UserCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User as UserType } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !user) return null;

  const roleLabel =
    user.role === 'admin'
      ? '👑 Master Administrator'
      : user.role === 'staff'
      ? '🧑‍💻 Staff Operator'
      : '👤 Customer Account';

  const roleBadgeBg =
    user.role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : user.role === 'staff'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (token && !token.startsWith('local-token-')) {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            mobile,
            email,
            address,
            password: password.trim().length > 0 ? password : undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          const updatedUser: UserType = {
            ...user,
            name,
            mobile,
            email,
            address,
            ...(data.user || {})
          };
          updateUser(updatedUser);
          setMessage({ type: 'success', text: '🎉 Profile details updated successfully!' });
          setPassword('');
          setTimeout(() => setActiveTab('view'), 1200);
        } else {
          const err = await res.json();
          setMessage({ type: 'error', text: err.error || 'Failed to update profile.' });
        }
      } else {
        // Local mode update
        const updatedUser: UserType = {
          ...user,
          name,
          mobile,
          email,
          address
        };
        updateUser(updatedUser);

        // Update local override in userStorage
        try {
          const overridesRaw = localStorage.getItem('csc_user_overrides') || '{}';
          const overrides = JSON.parse(overridesRaw);
          overrides[user.email.toLowerCase()] = {
            user: updatedUser,
            pass: password.trim().length > 0 ? password : overrides[user.email.toLowerCase()]?.pass || 'admin123'
          };
          localStorage.setItem('csc_user_overrides', JSON.stringify(overrides));
        } catch (e) {}

        setMessage({ type: 'success', text: '🎉 Profile updated in session!' });
        setPassword('');
        setTimeout(() => setActiveTab('view'), 1000);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Profile Card Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-emerald-800 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 uppercase shrink-0">
              {user.name.charAt(0)}
            </div>

            <div className="space-y-1 min-w-0">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${roleBadgeBg}`}>
                {roleLabel}
              </span>
              <h2 className="text-xl font-bold truncate leading-tight">{user.name}</h2>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md text-[11px]">
                  User ID: #{user.id}
                </span>
                <span className="flex items-center">
                  <Smartphone className="w-3 h-3 mr-1 text-emerald-400" />
                  {user.mobile || 'No Mobile'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab switches */}
          <div className="flex space-x-2 mt-5 border-t border-white/10 pt-3">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'view' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Profile Info</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'view' ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">System User ID & Role</p>
                    <p className="text-xs font-bold text-slate-800">
                      ID #{user.id} ({user.role.toUpperCase()})
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Mobile Number (Login ID)</p>
                    <p className="text-xs font-bold text-slate-800">{user.mobile || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                    <p className="text-xs font-bold text-slate-800">{user.email || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {user.address && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Registered Address</p>
                      <p className="text-xs font-bold text-slate-800">{user.address}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('edit')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Update Profile Information</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (Login ID)</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Village/Town, District"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty to keep existing password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
