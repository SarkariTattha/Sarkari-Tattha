import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Phone, Building2, ShieldAlert, Users, User, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(loginId, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  const handleDemo = async (role: 'admin' | 'staff' | 'customer') => {
    await demoLogin(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else navigate('/customer');
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign In to Portal</h1>
        <p className="text-xs text-slate-500">Log in using your Mobile Number or registered account details</p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-semibold text-center shadow-xs">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Mobile Number / Login ID</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. 9876543210 (Mobile Number)"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Enter your registered 10-digit mobile number or email ID.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Authenticating...' : 'Sign In Now'}
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Register Here
          </Link>
        </p>
      </form>

      {/* Demo Credentials Box */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3 shadow-lg border border-slate-800">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Quick Portal Demo Logins</h3>
        </div>

        <div className="grid grid-cols-1 gap-2 text-[11px]">
          <button
            onClick={() => handleDemo('admin')}
            className="p-2.5 bg-slate-800/80 hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-bold text-white group-hover:text-emerald-300">👑 Admin Manager</p>
              <p className="text-slate-400 text-[10px]">Mobile: <span className="text-emerald-400 font-mono">9876543210</span> | Pass: <span className="font-mono text-slate-300">admin123</span></p>
            </div>
            <span className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md">Login</span>
          </button>

          <button
            onClick={() => handleDemo('staff')}
            className="p-2.5 bg-slate-800/80 hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-bold text-white group-hover:text-emerald-300">🧑‍💻 Staff Operator</p>
              <p className="text-slate-400 text-[10px]">Mobile: <span className="text-emerald-400 font-mono">9876543211</span> | Pass: <span className="font-mono text-slate-300">staff123</span></p>
            </div>
            <span className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md">Login</span>
          </button>

          <button
            onClick={() => handleDemo('customer')}
            className="p-2.5 bg-slate-800/80 hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-bold text-white group-hover:text-emerald-300">👤 Customer Account</p>
              <p className="text-slate-400 text-[10px]">Mobile: <span className="text-emerald-400 font-mono">9876543212</span> | Pass: <span className="font-mono text-slate-300">customer123</span></p>
            </div>
            <span className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md">Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
