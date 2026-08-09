import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, FileText, ArrowRight, CheckCircle2, ShieldCheck, Clock, Building2, Landmark, FileCheck } from 'lucide-react';
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

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'CSC', label: 'CSC e-Governance' },
    { id: 'CSP', label: 'West Bengal Gramin Bank CSP' },
    { id: 'GOVT', label: 'Government Certificates' },
    { id: 'OTHER', label: 'Utility & Applications' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-[#0066B3] text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0066B3]" />
          <span>Authorized Services Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
          Digital Services & Banking Directory
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
          Browse our authorized Common Service Centre (CSC) and West Bengal Gramin Bank CSP offerings. Select any service to review transparent government fees, required documents, or apply online immediately.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams(cat.id === 'ALL' ? {} : { category: cat.id })}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-[#0066B3] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search service by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0066B3]"
          />
        </div>
      </div>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0066B3] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading service directory...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 shadow-xs">
          <p className="font-bold text-slate-800 text-base">No services found</p>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or switching category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const totalFee = (service.govt_fee || 0) + (service.service_charge || 0);

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#0066B3] hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-blue-50 text-[#0066B3] rounded-2xl flex items-center justify-center font-bold group-hover:bg-[#0066B3] group-hover:text-white transition-all duration-200">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-slate-200">
                      {service.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-[#0066B3] transition">
                      <Link to={`/services/${service.id}`}>{service.title}</Link>
                    </h3>
                    {service.subcategory && (
                      <p className="text-[11px] font-bold text-[#2E9B45] mt-0.5 uppercase tracking-wide">{service.subcategory}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Requirements Box */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 text-xs">
                    <p className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">Required Documents:</p>
                    <ul className="space-y-1 text-slate-600 font-medium">
                      {service.required_documents.slice(0, 3).map((doc, i) => (
                        <li key={i} className="flex items-center space-x-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E9B45] shrink-0" />
                          <span className="truncate">{doc}</span>
                        </li>
                      ))}
                      {service.required_documents.length > 3 && (
                        <li className="text-[10px] text-slate-400 pl-5 font-semibold">
                          +{service.required_documents.length - 3} more required documents
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Govt. Fee: ₹{service.govt_fee}</span>
                      <span>Charge: ₹{service.service_charge}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                      <span className="font-extrabold uppercase text-[10px] text-slate-800">Total Est. Fee:</span>
                      <span className="text-[#2E9B45] font-black text-sm">₹{totalFee}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
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
      )}
    </div>
  );
};

