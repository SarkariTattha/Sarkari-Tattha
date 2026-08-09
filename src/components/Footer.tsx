import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SarkariTatthaLogo } from './SarkariTatthaLogo';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 text-sm border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-2xl inline-block border border-slate-700 shadow-md">
              <SarkariTatthaLogo size="md" />
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed pt-1">
              Your authorized West Bengal Gramin Bank CSP & Digital Service Center. Delivering fast, secure government e-services, AEPS, money transfers, and online applications to rural and urban communities.
            </p>
            <div className="pt-1 flex items-center space-x-2 text-xs text-emerald-400 font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified CSC & CSP Partner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 border-l-3 border-[#0066B3] pl-2">
              Services & Portals
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#2E9B45]" />
                  <span>CSC Government Services</span>
                </Link>
              </li>
              <li>
                <Link to="/services?category=CSP" className="hover:text-emerald-400 transition flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#2E9B45]" />
                  <span>West Bengal Gramin Bank CSP</span>
                </Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-emerald-400 transition flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#2E9B45]" />
                  <span>Online Digital Applications</span>
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-emerald-400 transition flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#2E9B45]" />
                  <span>Track Application Status</span>
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-emerald-400 transition flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#2E9B45]" />
                  <span>Book Center Visit</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#2E9B45]" />
                  <span>About Center</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Contact */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 border-l-3 border-[#2E9B45] pl-2">
              Center Details
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-300">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address || 'Shop No. 12, Main Market Road, Near Bus Stand, District Center'}</span>
              </li>
              <li className="flex items-center space-x-2.5 font-bold text-white">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.email || 'support@sarkaritattha.com'}</span>
              </li>
              <li className="flex items-start space-x-2.5 pt-1">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.opening_hours || 'Monday - Saturday: 8:00 AM - 8:00 PM'}</span>
              </li>
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 border-l-3 border-[#0066B3] pl-2">
              Official Disclaimer
            </h4>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-[11px] leading-relaxed text-slate-300 space-y-2 shadow-xs">
              <p className="font-bold text-white">
                {settings.center_name || 'Sarkari Tattha'} is an authorized Common Service Centre (CSC) & Banking CSP Point.
              </p>
              <p>
                {settings.disclaimer_text || 'All services are processed as per standard government portal availability and guidelines. Government and portal fees are levied as per official notification.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-400 space-y-4 md:space-y-0">
          <p>© 2026 {settings.center_name || 'Sarkari Tattha Digital Service Center'}. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-emerald-400 transition">Privacy Policy</Link>
            <Link to="/about" className="hover:text-emerald-400 transition">Terms & Conditions</Link>
            <Link to="/about" className="hover:text-emerald-400 transition">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


