import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeSelector } from './ThemeSelector';
import { SarkariTatthaLogo } from './SarkariTatthaLogo';
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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
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
      {/* Top Banner Notice - Dynamic from Settings */}
      <div className="bg-slate-100 text-slate-800 text-xs py-2 px-4 border-b border-orange-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-orange-700 font-extrabold text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-orange-600" /> {settings.notice_banner || 'Authorized CSC & Banking Service Point'}
            </span>
            {settings.opening_hours && (
              <>
                <span className="hidden md:inline text-slate-300">•</span>
                <span className="hidden md:inline font-bold text-slate-600 text-[11px]">{settings.opening_hours}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <a href={`tel:${settings.phone || '+919876543210'}`} className="font-extrabold text-slate-900 hover:text-orange-600 transition text-[11px]">
              Helpline: {settings.phone || '+91 98765 43210'}
            </a>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition shadow-xs"
            >
              Demo Roles Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 theme-nav-bg backdrop-blur-md border-b theme-card-border shadow-xs transition-colors duration-200">
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
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  isActive('/') ? 'theme-bg-primary text-white' : 'theme-card-text hover:theme-bg-light hover:theme-text-primary'
                }`}
              >
                Home
              </Link>

              <Link
                to="/services"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  isActive('/services') && !location.search.includes('CSP') ? 'theme-bg-primary text-white' : 'theme-card-text hover:theme-bg-light hover:theme-text-primary'
                }`}
              >
                CSC Services
              </Link>

              <Link
                to="/services?category=CSP"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  location.search.includes('CSP') ? 'theme-bg-primary text-white' : 'theme-card-text hover:theme-bg-light hover:theme-text-primary'
                }`}
              >
                Banking / CSP
              </Link>

              <Link
                to="/track"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition flex items-center space-x-1.5 ${
                  isActive('/track') ? 'theme-bg-primary text-white' : 'theme-card-text hover:theme-bg-light hover:theme-text-primary'
                }`}
              >
                <Search className="w-3.5 h-3.5 theme-text-primary" />
                <span>Track Status</span>
              </Link>

              <Link
                to="/appointments"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  isActive('/appointments') ? 'theme-bg-primary text-white' : 'theme-card-text hover:theme-bg-light hover:theme-text-primary'
                }`}
              >
                Book Visit
              </Link>

              <Link
                to="/contact"
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  isActive('/contact') ? 'theme-bg-primary text-white' : 'theme-card-text hover:theme-bg-light hover:theme-text-primary'
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
                className="flex items-center space-x-1.5 px-4 py-2.5 theme-bg-primary theme-bg-primary-hover text-white font-extrabold tracking-wider uppercase rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95 text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Apply Now</span>
              </Link>

              {user ? (
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                  <Link
                    to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/customer'}
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs transition uppercase tracking-wide"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span>
                      {user.role === 'admin' ? 'Admin Portal' : user.role === 'staff' ? 'Staff Portal' : 'My Portal'}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider hover:text-emerald-700 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
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
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
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
                  <Link
                    to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/customer'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                  >
                    Go to {user.role === 'admin' ? 'Admin Portal' : user.role === 'staff' ? 'Staff Portal' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Logout ({user.name})
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoModalOpen(true);
                }}
                className="w-full text-center py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
              >
                Switch Demo Role (Admin / Staff / Customer)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Quick Demo Login Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Instant Demo Role Selection</h3>
              <p className="text-xs text-slate-500 mt-1">Select a role to test the complete application features instantly:</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleDemoSelect('admin')}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition flex items-start space-x-3 group"
              >
                <div className="p-2.5 bg-slate-900 text-white rounded-xl group-hover:bg-emerald-600 transition">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Administrator Role</p>
                  <p className="text-xs text-slate-500">Full control over customers, staff, payments, expenses, reports & settings.</p>
                </div>
              </button>

              <button
                onClick={() => handleDemoSelect('staff')}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition flex items-start space-x-3 group"
              >
                <div className="p-2.5 bg-emerald-700 text-white rounded-xl group-hover:bg-emerald-600 transition">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Staff Operator Role</p>
                  <p className="text-xs text-slate-500">Manage assigned service requests, upload documents, collect payments & expenses.</p>
                </div>
              </button>

              <button
                onClick={() => handleDemoSelect('customer')}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition flex items-start space-x-3 group"
              >
                <div className="p-2.5 bg-teal-600 text-white rounded-xl group-hover:bg-emerald-600 transition">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Customer User Role</p>
                  <p className="text-xs text-slate-500">Apply for services, track live applications, view payment receipts & notifications.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
