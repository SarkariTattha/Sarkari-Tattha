import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeSelector } from './ThemeSelector';
import { SarkariTatthaLogo } from './SarkariTatthaLogo';
import { UserProfileModal } from './UserProfileModal';
import { useSettings } from '../context/SettingsContext';
import {
  Building2,
  Search,
  FileText,
  Calendar,
  PhoneCall,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ShieldAlert,
  Users,
  LayoutDashboard,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoSelect = async (role: 'admin' | 'staff' | 'customer') => {
    await demoLogin(role);
    setDemoModalOpen(false);
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else navigate('/customer');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Banner Notice - Banking & CSC Partner Header */}
      <div className="bg-[#003e6d] text-white text-xs py-2 px-4 border-b border-[#00508f]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              {settings.notice_banner || 'Authorized West Bengal Gramin Bank & CSC Digital Banking Service Point'}
            </span>
            {settings.opening_hours && (
              <>
                <span className="hidden md:inline text-blue-300/40">•</span>
                <span className="hidden md:inline font-medium text-slate-200 text-[11px]">{settings.opening_hours}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={`tel:${settings.phone || '+919876543210'}`}
              className="font-semibold text-white hover:text-emerald-300 transition text-[11px] flex items-center space-x-1"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400 mr-1" />
              <span>Helpline: {settings.phone || '+91 98765 43210'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo with Image / Vector Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <SarkariTatthaLogo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  isActive('/') ? 'bg-[#0066B3] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-[#0066B3]'
                }`}
              >
                Home
              </Link>

              <Link
                to="/services"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  isActive('/services') && !location.search.includes('CSP') ? 'bg-[#0066B3] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-[#0066B3]'
                }`}
              >
                CSC Services
              </Link>

              <Link
                to="/services?category=CSP"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  location.search.includes('CSP') ? 'bg-[#2E9B45] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-[#2E9B45]'
                }`}
              >
                Banking / CSP
              </Link>

              <Link
                to="/track"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center space-x-1.5 ${
                  isActive('/track') ? 'bg-[#0066B3] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-[#0066B3]'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#0066B3]" />
                <span>Track Status</span>
              </Link>

              <Link
                to="/appointments"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  isActive('/appointments') ? 'bg-[#0066B3] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-[#0066B3]'
                }`}
              >
                Book Visit
              </Link>

              <Link
                to="/contact"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  isActive('/contact') ? 'bg-[#0066B3] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-[#0066B3]'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeSelector />

              <Link
                to="/apply"
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#2E9B45] hover:bg-[#237a36] text-white font-bold tracking-wider uppercase rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95 text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Apply Now</span>
              </Link>

              {user ? (
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                  {/* User Profile Pill / Button */}
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition border border-slate-200 cursor-pointer text-left group"
                    title="Click to view/edit your profile details"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0066B3] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden xl:block text-left leading-tight">
                      <div className="text-[11px] font-extrabold text-slate-900 group-hover:text-[#0066B3] transition flex items-center space-x-1">
                        <span>{user.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center space-x-1">
                        <span className="font-bold text-[#2E9B45]">{user.role}</span>
                        <span>•</span>
                        <span>ID: #{user.id}</span>
                      </div>
                    </div>
                  </button>

                  <Link
                    to={user.role === 'super_admin' ? '/super-admin' : user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/customer'}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0066B3] hover:bg-[#00508f] text-white rounded-xl font-bold text-xs transition uppercase tracking-wide shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-200" />
                    <span className="hidden sm:inline">
                      {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin Portal' : user.role === 'staff' ? 'Staff Portal' : 'My Portal'}
                    </span>
                  </Link>

                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-slate-800 font-bold text-xs uppercase tracking-wider hover:text-[#0066B3] transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-2 bg-[#0066B3] hover:bg-[#00508f] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <Link
                to="/apply"
                className="px-3 py-1.5 bg-[#2E9B45] text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Apply
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              CSC Services
            </Link>
            <Link
              to="/services?category=CSP"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Banking / CSP Services
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Track Application Status
            </Link>
            <Link
              to="/appointments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Book Appointment
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Contact Us
            </Link>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        Role: <span className="text-emerald-700">{user.role}</span> | ID: #{user.id}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      My Profile
                    </button>
                  </div>

                  <Link
                    to={user.role === 'super_admin' ? '/super-admin' : user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/customer'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    Go to {user.role === 'super_admin' ? 'Super Admin Portal' : user.role === 'admin' ? 'Admin Portal' : user.role === 'staff' ? 'Staff Portal' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-slate-100 text-slate-800 font-bold rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Profile Modal */}
      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  );
};
