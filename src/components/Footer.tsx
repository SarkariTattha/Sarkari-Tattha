import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { SarkariTatthaLogo } from './SarkariTatthaLogo';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-100 text-slate-700 text-sm border-t border-orange-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Info */}
          <div className="space-y-4">
            <SarkariTatthaLogo size="md" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
              Your local trusted Digital Service & Banking Point. Providing hassle-free government e-services, Aadhaar banking, money transfers, and document services under one roof.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-orange-700 font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Certified Service Provider</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <li>
                <Link to="/services" className="hover:text-orange-600 transition">CSC Government Services</Link>
              </li>
              <li>
                <Link to="/services?category=CSP" className="hover:text-orange-600 transition">CSP Banking & AEPS</Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-orange-600 transition">Online Application</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-orange-600 transition">Track Application Status</Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-orange-600 transition">Book Center Visit</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-600 transition">About Our Center</Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Contact */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Center Details</h4>
            <ul className="space-y-3 text-xs font-medium text-slate-800">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>{settings.address || 'Shop No. 12, Main Market Road, Near Bus Stand, District Center'}</span>
              </li>
              <li className="flex items-center space-x-2.5 font-bold">
                <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{settings.email || 'support@sarkaritattha.com'}</span>
              </li>
              <li className="flex items-start space-x-2.5 pt-1">
                <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>{settings.opening_hours || 'Monday - Saturday: 8:00 AM - 8:00 PM'}</span>
              </li>
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Important Notice</h4>
            <div className="bg-white p-4 rounded-2xl border border-orange-200 text-[11px] leading-relaxed text-slate-600 space-y-2 shadow-xs">
              <p className="font-bold text-slate-900">
                {settings.center_name || 'Sarkari Tattha'} operates as an authorized digital service point.
              </p>
              <p>
                {settings.disclaimer_text || 'All services are processed subject to portal availability and guidelines. Government and third-party fees apply separately.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-600 space-y-4 md:space-y-0">
          <p>© 2026 {settings.center_name || 'Sarkari Tattha Digital Service Center'}. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-orange-600 transition">Privacy Policy</Link>
            <Link to="/about" className="hover:text-orange-600 transition">Terms & Conditions</Link>
            <Link to="/about" className="hover:text-orange-600 transition">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

