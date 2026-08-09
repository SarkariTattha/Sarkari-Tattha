import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SarkariTatthaLogo } from '../components/SarkariTatthaLogo';
import { CenterGallerySection } from '../components/CenterGallerySection';
import { useSettings } from '../context/SettingsContext';
import {
  CreditCard,
  Fingerprint,
  FileCheck,
  Banknote,
  Send,
  Building2,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
  Search,
  ChevronRight,
  ArrowRight,
  Phone,
  MessageSquare,
  MapPin,
  HelpCircle,
  PlusCircle,
  FileText,
  Camera,
  UploadCloud,
  Shield,
  FileSpreadsheet,
  Headphones,
  Award,
  Globe,
  Landmark,
  UserCheck
} from 'lucide-react';
import { Service, FAQ } from '../types';
import { getStoredServices } from '../data/defaultServices';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/services?limit=6')
      .then((res) => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('API unavailable');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedServices(data.slice(0, 6));
        } else {
          throw new Error('Empty API response');
        }
      })
      .catch(() => {
        setFeaturedServices(getStoredServices().slice(0, 6));
      });

    fetch('/api/admin/faqs')
      .then((res) => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return [];
      })
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => setFaqs([]));
  }, []);

  return (
    <div className="space-y-16 pb-16 theme-app-bg transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#003e6d] via-[#0066B3] to-[#0f4c81] text-white pt-12 pb-20 overflow-hidden border-b border-[#00508f]">
        {/* Background Decorative Blur Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-widest shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authorized CSC & Digital Banking Service Center</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl inline-block border border-white/15">
                <SarkariTatthaLogo size="lg" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[1.15] text-white">
                Your Trusted <span className="text-emerald-300 underline underline-offset-8 decoration-emerald-400">Digital Service</span> & Banking Partner
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
                Empowering rural & urban communities with official Common Service Centre (CSC) solutions, West Bengal Gramin Bank CSP services, AEPS cash withdrawals, instant PAN filing, government certificates, and online application support.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/apply"
                  className="w-full sm:w-auto px-7 py-4 bg-[#2E9B45] hover:bg-[#237a36] text-white font-black uppercase tracking-wider rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2 text-xs"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Apply for a Service</span>
                </Link>

                <Link
                  to="/track"
                  className="w-full sm:w-auto px-7 py-4 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-extrabold uppercase tracking-wider rounded-2xl transition text-center flex items-center justify-center space-x-2 text-xs backdrop-blur-md shadow-xs"
                >
                  <Search className="w-4 h-4 text-emerald-300" />
                  <span>Track Application</span>
                </Link>

                <Link
                  to="/appointments"
                  className="w-full sm:w-auto px-7 py-4 bg-white text-[#0066B3] hover:bg-slate-100 font-extrabold uppercase tracking-wider rounded-2xl transition text-center flex items-center justify-center space-x-2 text-xs shadow-md"
                >
                  <Clock className="w-4 h-4 text-[#0066B3]" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Professional Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0066B3]">Digital Service Hub</span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">CSC & Banking Portal</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-[#2E9B45] rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                    Active Center
                  </span>
                </div>

                {/* 4 Feature Pillars Card Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-[#0066B3] text-white flex items-center justify-center font-bold">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-900 mt-2">West Bengal Gramin Bank</p>
                    <p className="text-[10px] text-slate-500 font-medium">Official CSP Partner</p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-[#2E9B45] text-white flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-900 mt-2">CSC Center</p>
                    <p className="text-[10px] text-slate-500 font-medium">Common Service Centre</p>
                  </div>

                  <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-900 mt-2">AEPS Banking</p>
                    <p className="text-[10px] text-slate-500 font-medium">Aadhaar Cash & Transfer</p>
                  </div>

                  <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      <Globe className="w-4 h-4" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-900 mt-2">Digital India</p>
                    <p className="text-[10px] text-slate-500 font-medium">Online E-Governance</p>
                  </div>
                </div>

                {/* Quick Tracker Search Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const appNo = (form.elements.namedItem('appNo') as HTMLInputElement).value;
                    const mobile = (form.elements.namedItem('mobile') as HTMLInputElement).value;
                    window.location.href = `/track?app_no=${encodeURIComponent(appNo)}&mobile=${encodeURIComponent(mobile)}`;
                  }}
                  className="space-y-3 pt-2 border-t border-slate-200"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">Quick Application Tracker</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      name="appNo"
                      type="text"
                      placeholder="App ID (e.g. CSC-001)"
                      required
                      className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0066B3]"
                    />
                    <input
                      name="mobile"
                      type="tel"
                      placeholder="Mobile Number"
                      required
                      className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0066B3]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0066B3] hover:bg-[#00508f] text-white font-bold uppercase tracking-wider rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Status</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0066B3] flex items-center justify-center shrink-0 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 uppercase">Secure Services</p>
              <p className="text-[10px] text-slate-500 font-medium">Bank-grade data security</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 pt-3 md:pt-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2E9B45] flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 uppercase">Verified Apps</p>
              <p className="text-[10px] text-slate-500 font-medium">100% genuine processing</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 pt-3 md:pt-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 uppercase">Transparent Fees</p>
              <p className="text-[10px] text-slate-500 font-medium">No hidden surcharges</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 pt-3 md:pt-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 uppercase">Experienced Staff</p>
              <p className="text-[10px] text-slate-500 font-medium">Dedicated operators</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 pt-3 md:pt-2 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 uppercase">Digital Support</p>
              <p className="text-[10px] text-slate-500 font-medium">Helpline & WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICE CATEGORIES (6 PREMIUM CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-3 py-1 bg-blue-50 text-[#0066B3] text-xs font-extrabold uppercase tracking-widest rounded-full border border-blue-200">
            Digital Portfolios
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-slate-900">Service Categories</h2>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Comprehensive e-Governance & Rural Banking solutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. CSC SERVICES */}
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-7 space-y-5 flex flex-col justify-between shadow-sm hover:border-[#0066B3] hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 text-[#0066B3] rounded-2xl flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  12 Services
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">CSC Services</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Official Common Service Centre assistance for PAN card, voter ID, driving licenses, passport filing, and certificate verifications.
              </p>
            </div>
            <Link
              to="/services?category=CSC"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-blue-50 text-[#0066B3] font-bold text-xs uppercase tracking-wider rounded-xl transition border border-slate-200"
            >
              <span>View Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. CSP BANKING */}
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-7 space-y-5 flex flex-col justify-between shadow-sm hover:border-[#2E9B45] hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-emerald-50 text-[#2E9B45] rounded-2xl flex items-center justify-center font-bold">
                  <Landmark className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-[#2E9B45] text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  8 Services
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">CSP Banking</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                West Bengal Gramin Bank Customer Service Point for savings account opening, money deposit, fixed deposits, and passbook updates.
              </p>
            </div>
            <Link
              to="/services?category=CSP"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 text-[#2E9B45] font-bold text-xs uppercase tracking-wider rounded-xl transition border border-slate-200"
            >
              <span>View Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3. AEPS & BANKING */}
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-7 space-y-5 flex flex-col justify-between shadow-sm hover:border-sky-600 hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-sky-100 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  6 Services
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">AEPS & Banking</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Aadhaar Enabled Payment System for biometric cash withdrawal, balance inquiry, mini statement, and Direct Money Transfer (DMT).
              </p>
            </div>
            <Link
              to="/services?category=CSP"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-sky-50 text-sky-700 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-slate-200"
            >
              <span>View Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4. GOVERNMENT SERVICES */}
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-7 space-y-5 flex flex-col justify-between shadow-sm hover:border-amber-600 hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
                  <FileCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  10 Services
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Government Services</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Applications for Income Certificate, Caste Certificate, Residential Certificate, Trade License, and Ration Card corrections.
              </p>
            </div>
            <Link
              to="/services?category=GOVT"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-slate-200"
            >
              <span>View Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 5. DOCUMENT SERVICES */}
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-7 space-y-5 flex flex-col justify-between shadow-sm hover:border-purple-600 hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  5 Services
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Document Services</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Passport size photo cropping (3.5x4.5cm), document scanning, color printing, lamination, and digital PDF creation.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-purple-800 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-slate-200"
            >
              <span>View Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6. ONLINE APPLICATIONS */}
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-7 space-y-5 flex flex-col justify-between shadow-sm hover:border-indigo-600 hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                  9 Services
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Online Applications</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Scholarship applications, job portal registrations, college admission forms, utility bill payments, and FASTag recharges.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-800 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-slate-200"
            >
              <span>View Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SERVICES (UPGRADED PRICING HIERARCHY CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 space-y-2 sm:space-y-0">
          <div>
            <span className="px-3 py-1 bg-emerald-50 text-[#2E9B45] text-xs font-extrabold uppercase tracking-widest rounded-full border border-emerald-200">
              Popular Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-slate-900 mt-1">Featured Offerings</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Transparent fees, official processing times, and document guidelines</p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center space-x-1.5 text-[#0066B3] font-black text-xs uppercase tracking-wider hover:underline"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => {
            const totalFee = (service.govt_fee || 0) + (service.service_charge || 0);

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#0066B3] hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 bg-blue-50 text-[#0066B3] rounded-2xl flex items-center justify-center font-bold group-hover:bg-[#0066B3] group-hover:text-white transition-all duration-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-slate-200">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-[#0066B3] transition">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Pricing Breakdown Box */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 text-xs font-semibold">
                    <div className="flex justify-between text-slate-600">
                      <span>Govt. Fee:</span>
                      <span className="text-slate-900 font-bold">₹{service.govt_fee}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Service Charge:</span>
                      <span className="text-slate-900 font-bold">₹{service.service_charge}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-extrabold uppercase text-[11px] text-slate-800">Total Est. Amount:</span>
                      <span className="text-[#2E9B45] font-black text-base">₹{totalFee}</span>
                    </div>
                  </div>

                  {/* Processing & Docs */}
                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0066B3]" />
                      <span>Processing Time: <strong>{service.processing_time}</strong></span>
                    </div>
                    {service.required_documents && service.required_documents.length > 0 && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <FileCheck className="w-3.5 h-3.5 text-[#2E9B45] shrink-0" />
                        <span className="truncate">Req: {service.required_documents.slice(0, 2).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-2">
                  <Link
                    to={`/services/${service.id}`}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0066B3] transition"
                  >
                    View Details
                  </Link>

                  <Link
                    to={`/apply?service_id=${service.id}`}
                    className="px-4 py-2.5 bg-[#2E9B45] hover:bg-[#237a36] text-white font-bold uppercase tracking-wider rounded-xl text-xs transition shadow-xs"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-slate-100 text-slate-900 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-slate-900">How It Works</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">4 simple steps to complete your e-governance or banking request</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-[#0066B3] text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                01
              </div>
              <h4 className="font-extrabold uppercase tracking-tight text-slate-900 text-base">Select Service</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Browse our directory of e-Gov or CSP services and select what you need.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-[#0066B3] text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                02
              </div>
              <h4 className="font-extrabold uppercase tracking-tight text-slate-900 text-base">Upload Documents</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Upload applicant passport photo with live crop and supporting documents securely.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-[#0066B3] text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                03
              </div>
              <h4 className="font-extrabold uppercase tracking-tight text-slate-900 text-base">Track Status</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Get a unique Application ID to monitor live application progress anytime.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-[#2E9B45] text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                04
              </div>
              <h4 className="font-extrabold uppercase tracking-tight text-slate-900 text-base">Receive Document</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Collect your completed certificate/document and download digital receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick answers to common questions regarding our digital service center</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id || idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex justify-between items-center font-extrabold uppercase tracking-tight text-slate-900 text-sm hover:text-[#0066B3] cursor-pointer"
              >
                <span>{faq.question}</span>
                <span className="text-[#0066B3] text-lg font-black">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 font-medium border-t border-slate-100 pt-3 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6.5. CENTER INFRASTRUCTURE & GALLERY SECTION */}
      <CenterGallerySection />

      {/* 7. CONTACT & MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-md">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900">Visit or Call Our Service Center</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Have questions or prefer in-person assistance? Drop by our physical center or reach out via Phone or WhatsApp.
            </p>

            <div className="space-y-3 text-xs font-bold uppercase tracking-wide text-slate-800">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-[#0066B3] shrink-0" />
                <span>{settings.address || 'Shop No. 12, Main Market Road, Near Bus Stand, District Center'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#2E9B45] shrink-0" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#0066B3] shrink-0" />
                <span>{settings.opening_hours || 'Mon - Sat: 8:00 AM - 8:00 PM'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`tel:${settings.phone || '+919876543210'}`}
                className="px-5 py-3 bg-[#0066B3] hover:bg-[#00508f] text-white font-bold uppercase tracking-wider rounded-xl text-xs transition inline-flex items-center space-x-2 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
              <a
                href={`https://wa.me/${(settings.phone || '919876543210').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-[#2E9B45] hover:bg-[#237a36] text-white font-bold uppercase tracking-wider rounded-xl text-xs transition inline-flex items-center space-x-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
              <Link
                to="/contact"
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold uppercase tracking-wider rounded-xl text-xs transition inline-flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-slate-700" />
                <span>Get Directions</span>
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-64 flex flex-col items-center justify-center text-center space-y-2">
            <MapPin className="w-10 h-10 text-[#0066B3]" />
            <p className="font-extrabold text-sm uppercase tracking-wider text-slate-900">Interactive Location Map</p>
            <p className="text-xs text-slate-600 max-w-xs font-medium">{settings.address || 'Shop No. 12, Main Market Road, Near Bus Stand'}</p>
            <span className="px-3 py-1 bg-emerald-100 text-[#2E9B45] rounded-full text-[10px] font-extrabold uppercase tracking-widest mt-2 border border-emerald-200">
              Open Today Until 8:00 PM
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};


