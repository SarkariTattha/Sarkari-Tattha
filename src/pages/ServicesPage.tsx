import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, FileText, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Service } from '../types';
import { getStoredServices } from '../data/defaultServices';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCat = searchParams.get('category') || 'ALL';

  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `/api/services?category=${selectedCat}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    fetch(url)
      .then((res) => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('API unavailable');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          throw new Error('Empty API response');
        }
      })
      .catch(() => {
        // Fallback to client-side default services
        let local = getStoredServices();
        if (selectedCat !== 'ALL') {
          local = local.filter((s) => s.category === selectedCat);
        }
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          local = local.filter(
            (s) =>
              s.title.toLowerCase().includes(term) ||
              s.description.toLowerCase().includes(term) ||
              (s.subcategory && s.subcategory.toLowerCase().includes(term))
          );
        }
        setServices(local);
      })
      .finally(() => setLoading(false));
  }, [selectedCat, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Complete Service Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">CSC & CSP Services</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Browse our authorized Common Service Center and Banking Service Point offerings. Select a service to view requirements or apply online immediately.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'CSC', 'CSP', 'OTHER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchParams(cat === 'ALL' ? {} : { category: cat })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCat === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL'
                ? 'All Services'
                : cat === 'CSC'
                ? 'CSC e-Governance'
                : cat === 'CSP'
                ? 'CSP Banking / AEPS'
                : 'Utility & Other'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search service name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading service catalog...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <p className="font-bold text-slate-800 text-base">No services found</p>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or switching category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
                    {service.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-emerald-700 transition">
                    <Link to={`/services/${service.id}`}>{service.title}</Link>
                  </h3>
                  {service.subcategory && (
                    <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{service.subcategory}</p>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Requirements snippet */}
                <div className="bg-slate-50 p-3 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Required Documents:</p>
                  <ul className="space-y-1 text-slate-600">
                    {service.required_documents.slice(0, 3).map((doc, i) => (
                      <li key={i} className="flex items-center space-x-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{doc}</span>
                      </li>
                    ))}
                    {service.required_documents.length > 3 && (
                      <li className="text-[10px] text-slate-400 pl-5">
                        +{service.required_documents.length - 3} more documents
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 text-slate-600">
                  <span>Processing: <strong className="text-slate-800">{service.processing_time}</strong></span>
                  <span>Fee: <strong className="text-emerald-700">₹{service.service_charge + service.govt_fee}</strong></span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  to={`/services/${service.id}`}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  View Full Details
                </Link>

                <Link
                  to={`/apply?service_id=${service.id}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
