import React from 'react';
import { Building2, ShieldCheck, Award, HeartHandshake } from 'lucide-react';
import { CenterGallerySection } from '../components/CenterGallerySection';
import { useSettings } from '../context/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          About Our Digital Point
        </span>
        <h1 className="text-3xl font-extrabold theme-card-text">{settings.center_name || 'Sarkari Tattha Service Center'}</h1>
        <p className="text-xs sm:text-sm theme-card-muted">
          {settings.tagline || 'Bridging the gap between citizens, e-governance services, and digital banking facilities.'}
        </p>
      </div>

      {/* Optional Custom About Banner Photo */}
      {settings.about_photo_url && (
        <div className="rounded-3xl overflow-hidden shadow-lg border theme-card-border h-64 sm:h-80 w-full relative">
          <img
            src={settings.about_photo_url}
            alt={settings.center_name || 'About Center'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
            <p className="text-white text-sm font-bold">{settings.center_name} - Physical Infrastructure & Counters</p>
          </div>
        </div>
      )}

      {/* Mission Grid */}
      <div className="theme-card-bg rounded-3xl p-8 border theme-card-border shadow-xs space-y-6">
        <h2 className="text-xl font-bold theme-card-text border-b theme-card-border pb-4">Our Mission & Values</h2>
        <p className="text-xs sm:text-sm theme-card-muted leading-relaxed">
          Our center was established to provide smooth, transparent, and accurate application assistance for government documents, certificates, e-governance portals, and financial inclusion services. We ensure every customer receives personalized guidance, document verification, and live tracking.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="theme-bg-light p-5 rounded-2xl space-y-2 border theme-card-border">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm theme-card-text">Trusted Guidance</h4>
            <p className="text-xs theme-card-muted">Accurate portal form submissions and verified document checklists.</p>
          </div>

          <div className="theme-bg-light p-5 rounded-2xl space-y-2 border theme-card-border">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm theme-card-text">Transparent Charges</h4>
            <p className="text-xs theme-card-muted">Clear breakdown of government fees and fixed service charges with receipts.</p>
          </div>

          <div className="theme-bg-light p-5 rounded-2xl space-y-2 border theme-card-border">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm theme-card-text">Customer Support</h4>
            <p className="text-xs theme-card-muted">Dedicated staff helping senior citizens and non-technical applicants.</p>
          </div>
        </div>
      </div>

      {/* Center Photos Section */}
      <CenterGallerySection
        title="Physical Center & Facilities Gallery"
        subtitle="Explore our spacious physical center infrastructure, biometric counters, and computer lab."
      />

      {/* Compliance Disclaimer */}
      <div className="bg-slate-900 text-slate-300 rounded-3xl p-8 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <span>Legal Regulatory Notice</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {settings.disclaimer_text || 'All services are provided subject to applicable government rules, banking regulations, portal availability, and service-provider terms. Government, portal, and third-party fees apply separately.'}
        </p>
      </div>
    </div>
  );
};
