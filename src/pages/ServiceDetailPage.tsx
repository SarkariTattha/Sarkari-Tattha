import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowLeft,
  PlusCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Service } from '../types';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Service details not found.');
        return res.json();
      })
      .then((data) => setService(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 max-w-7xl mx-auto px-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading service information...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Service Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested service does not exist or has been removed.'}</p>
        <Link to="/services" className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Services Directory
        </Link>
      </div>
    );
  }

  const totalFee = service.service_charge + service.govt_fee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back Button */}
      <Link to="/services" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Services</span>
      </Link>

      {/* Main Service Card Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
                {service.category} Service
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{service.title}</h1>
              {service.subcategory && (
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{service.subcategory}</p>
              )}
            </div>
          </div>

          <Link
            to={`/apply?service_id=${service.id}`}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition text-sm shadow-md shadow-emerald-600/20 text-center shrink-0 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply Now</span>
          </Link>
        </div>

        {/* Overview */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Service Overview</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{service.description}</p>
        </div>

        {/* Quick Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Approx Processing Time</span>
            <span className="font-bold text-slate-800 text-sm">{service.processing_time}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Government / Portal Fee</span>
            <span className="font-bold text-slate-800 text-sm">₹{service.govt_fee}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Center Service Charge</span>
            <span className="font-bold text-emerald-700 text-sm">₹{service.service_charge}</span>
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Required Documents Checklist</h3>
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-2.5">
            {service.required_documents.map((doc, i) => (
              <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Instructions */}
        {service.instructions && (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Important Instructions</h3>
            <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-xs leading-relaxed">
              {service.instructions}
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-500 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-700">Service Disclaimer:</p>
          <p>
            Final fees and processing time may vary according to applicable government/portal charges, verification requirements, and official authority schedules.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Total Payable Amount:</p>
            <p className="text-2xl font-black text-emerald-700">₹{totalFee}</p>
          </div>
          <Link
            to={`/apply?service_id=${service.id}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 text-center text-sm"
          >
            Start Online Application
          </Link>
        </div>
      </div>
    </div>
  );
};
