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
  Award,
  PlusCircle,
  FileText,
  Camera,
  UploadCloud
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
      <section className="relative theme-hero-bg theme-card-text pt-12 pb-24 overflow-hidden border-b theme-border-primary transition-colors duration-200">
        {/* Background Soft Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full theme-badge text-[11px] font-black uppercase tracking-widest shadow-xs">
                <ShieldCheck className="w-4 h-4 theme-text-primary" />
                <span>Authorized CSC & Banking Service Point</span>
              </div>

              <div className="py-2">
                <SarkariTatthaLogo size="xl" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-[1.1] theme-card-text">
                Your Trusted <span className="theme-text-primary underline underline-offset-8">Digital Service</span> & Banking Point
              </h1>

              <p className="text-base sm:text-lg theme-card-muted max-w-2xl font-medium leading-relaxed">
                All CSC & CSP services under one roof. Instant PAN Card filing, Aadhaar banking, money transfers, passport photo studio, government certificate applications, and bill payments made effortless.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/apply"
                  className="w-full sm:w-auto px-7 py-4 theme-bg-primary theme-bg-primary-hover text-white font-black uppercase tracking-wider rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2 text-xs"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Apply for Service</span>
                </Link>

                <Link
                  to="/services"
                  className="w-full sm:w-auto px-7 py-4 theme-card-bg hover:bg-slate-100 theme-card-text border-2 theme-card-border font-extrabold uppercase tracking-wider rounded-2xl transition text-center flex items-center justify-center space-x-2 text-xs shadow-xs"
                >
                  <span>View Services Directory</span>
                </Link>

                <Link
                  to="/track"
                  className="w-full sm:w-auto px-7 py-4 theme-card-bg hover:theme-bg-light theme-text-primary border-2 theme-border-primary font-extrabold uppercase tracking-wider rounded-2xl transition text-center flex items-center justify-center space-x-2 text-xs shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Status</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-300/80 grid grid-cols-3 gap-4 text-center lg:text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                <div className="flex items-center space-x-2 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Transparent Fees</span>
                </div>
                <div className="flex items-center space-x-2 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Passport Photo Upload</span>
                </div>
                <div className="flex items-center space-x-2 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Digital Receipts</span>
                </div>
              </div>
            </div>

            {/* Right Quick Tracker Box - Light Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Quick Tracker</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-[10px] font-black uppercase tracking-widest border border-orange-200">Live 24x7</span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Already applied? Track your application status instantly using your Application ID and registered mobile number.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const appNo = (form.elements.namedItem('appNo') as HTMLInputElement).value;
                    const mobile = (form.elements.namedItem('mobile') as HTMLInputElement).value;
                    window.location.href = `/track?app_no=${encodeURIComponent(appNo)}&mobile=${encodeURIComponent(mobile)}`;
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">Application ID</label>
                    <input
                      name="appNo"
                      type="text"
                      placeholder="e.g. CSC-2026-000101"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">Mobile Number</label>
                    <input
                      name="mobile"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider rounded-xl text-xs transition shadow-lg shadow-orange-600/20 flex items-center justify-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Application</span>
                  </button>
                </form>

                {/* Photo Studio Card Link */}
                <div className="pt-3 border-t border-slate-200">
                  <Link
                    to="/apply"
                    className="p-3 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 transition group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Camera className="w-5 h-5 text-orange-600" />
                      <div>
                        <span className="block font-black text-slate-900">Upload Passport Photo</span>
                        <span className="text-[10px] text-slate-500 font-medium">Auto-format & Crop 3.5cm x 4.5cm</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md text-center space-y-1 hover:border-orange-500 transition">
            <p className="text-4xl font-black tracking-tight text-slate-900">35+</p>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Services</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md text-center space-y-1 hover:border-orange-500 transition">
            <p className="text-4xl font-black tracking-tight text-orange-600">12,500+</p>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Happy Customers</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md text-center space-y-1 hover:border-orange-500 transition">
            <p className="text-4xl font-black tracking-tight text-slate-900">15,800+</p>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Completed Services</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md text-center space-y-1 hover:border-orange-500 transition">
            <p className="text-4xl font-black tracking-tight text-orange-600">8+ Years</p>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Years of Service</p>
          </div>
        </div>
      </section>

      {/* 3. QUICK SERVICE CATEGORIES - Light Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-slate-900">Explore Our Portfolios</h2>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorized e-Governance and Banking services available at our center</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CSC Card */}
          <div className="bg-white border-2 border-slate-200 text-slate-900 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-md hover:border-orange-500 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">CSC e-Gov Services</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                PAN Card, Aadhaar assistance, Income, Caste & Residence Certificates, Birth/Death Certificates, Passport applications, and photo document upload.
              </p>
            </div>
            <Link
              to="/services?category=CSC"
              className="inline-flex items-center space-x-2 text-orange-600 font-extrabold text-xs uppercase tracking-wider hover:text-orange-700"
            >
              <span>Explore CSC Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CSP Card */}
          <div className="bg-orange-50/80 border-2 border-orange-300 text-slate-900 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">CSP / Banking Services</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                AEPS Aadhaar Cash Withdrawal, Balance Enquiry, Money Transfer (DMT), Account Opening, Insurance, and Pension scheme assistance.
              </p>
            </div>
            <Link
              to="/services?category=CSP"
              className="inline-flex items-center space-x-2 text-orange-700 font-extrabold text-xs uppercase tracking-wider hover:underline"
            >
              <span>Explore Banking Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Utility Services */}
          <div className="bg-white text-slate-900 rounded-3xl p-8 space-y-6 flex flex-col justify-between border-2 border-slate-200 shadow-md hover:border-orange-500 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Utility Services</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Electricity, Water, Gas Bill Payments, Mobile/DTH Recharge, FASTag recharge, Passport Photo Cropping, Lamination, and Ticket Bookings.
              </p>
            </div>
            <Link
              to="/services?category=OTHER"
              className="inline-flex items-center space-x-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider hover:text-orange-600"
            >
              <span>Explore Utility Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED POPULAR SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-slate-900">Popular Services</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Most requested online application assistance and banking services</p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center space-x-1.5 text-orange-600 font-black text-xs uppercase tracking-wider hover:text-orange-700"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-orange-500 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold group-hover:bg-orange-600 group-hover:text-white transition-all duration-200">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-900 font-black text-[10px] rounded-md uppercase tracking-wider border border-slate-200">
                    {service.category}
                  </span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-orange-600 transition">
                  {service.title}
                </h3>

                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 text-xs font-bold uppercase tracking-wide">
                  <div className="flex justify-between text-slate-500">
                    <span>Est. Processing:</span>
                    <span className="text-slate-900 font-extrabold">{service.processing_time}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Service Fee:</span>
                    <span className="text-orange-600 font-black text-sm">₹{service.service_charge + service.govt_fee}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <Link
                  to={`/services/${service.id}`}
                  className="text-xs font-extrabold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                >
                  View Requirements
                </Link>

                <Link
                  to={`/apply?service_id=${service.id}`}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider rounded-xl text-xs transition"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS - Light Grey Background */}
      <section className="bg-slate-100 text-slate-900 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-slate-900">How It Works</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">4 simple steps to complete your e-governance or banking request</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                01
              </div>
              <h4 className="font-black uppercase tracking-tight text-slate-900 text-base">Select Service</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Browse our directory of e-Gov or CSP services and select what you need.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                02
              </div>
              <h4 className="font-black uppercase tracking-tight text-slate-900 text-base">Upload Photo & Doc</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Upload applicant passport photo with live crop and supporting documents securely.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                03
              </div>
              <h4 className="font-black uppercase tracking-tight text-slate-900 text-base">Track Status</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Get a unique Application ID to monitor live application progress anytime.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-10 h-10 bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-sm">
                04
              </div>
              <h4 className="font-black uppercase tracking-tight text-slate-900 text-base">Receive Receipt</h4>
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
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick answers to common questions regarding our digital service center</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id || idx}
              className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex justify-between items-center font-extrabold uppercase tracking-tight text-slate-900 text-sm hover:text-orange-600"
              >
                <span>{faq.question}</span>
                <span className="text-orange-600 text-lg font-black">{openFaq === idx ? '−' : '+'}</span>
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

      {/* 7. CONTACT & MAP SECTION - Light Grey Theme */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white text-slate-900 border-2 border-orange-200 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-lg">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-slate-900">Visit or Call Our Service Center</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Have questions or prefer in-person assistance? Drop by our physical center or reach out via Phone or WhatsApp.
            </p>

            <div className="space-y-3 text-xs font-bold uppercase tracking-wide text-slate-800">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                <span>Shop No. 12, Main Market Road, Near Bus Stand, District Center</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-600 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600 shrink-0" />
                <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="tel:+919876543210"
                className="px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider rounded-xl text-xs transition inline-flex items-center space-x-2 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-black uppercase tracking-wider rounded-xl text-xs transition inline-flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span>WhatsApp Us</span>
              </a>
              <Link
                to="/contact"
                className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-black uppercase tracking-wider rounded-xl text-xs transition inline-flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-slate-700" />
                <span>Get Directions</span>
              </Link>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-300 h-64 flex flex-col items-center justify-center text-center space-y-2">
            <MapPin className="w-10 h-10 text-orange-600" />
            <p className="font-black text-sm uppercase tracking-wider text-slate-900">Interactive Location Map</p>
            <p className="text-xs text-slate-600 max-w-xs font-medium">Shop No. 12, Main Market Road, Near Bus Stand</p>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-[10px] font-black uppercase tracking-widest mt-2 border border-orange-200">
              Open Today Until 8:00 PM
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

