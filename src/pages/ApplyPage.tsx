import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PhotoUploadTool } from '../components/PhotoUploadTool';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  X,
  Search,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { Service } from '../types';
import { useAuth } from '../context/AuthContext';

export const ApplyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service_id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerMobile, setCustomerMobile] = useState(user?.mobile || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [dob, setDob] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [preferredAppointmentDate, setPreferredAppointmentDate] = useState('');
  const [paymentOption, setPaymentOption] = useState<'Pay at Center' | 'UPI Payment'>('Pay at Center');

  // File & Photo State
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
          if (initialServiceId) {
            const found = data.find((s: Service) => String(s.id) === String(initialServiceId));
            if (found) setSelectedService(found);
          } else if (data.length > 0) {
            setSelectedServiceId(String(data[0].id));
            setSelectedService(data[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [initialServiceId]);

  const handleServiceChange = (idStr: string) => {
    setSelectedServiceId(idStr);
    const found = services.find((s) => String(s.id) === idStr);
    setSelectedService(found || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      setError('Please select a service.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('customer_name', customerName);
      formData.append('customer_mobile', customerMobile);
      formData.append('customer_email', customerEmail);
      formData.append('address', address);
      formData.append('dob', dob);
      formData.append('service_id', String(selectedService.id));
      formData.append('additional_info', additionalInfo);
      formData.append('preferred_appointment_date', preferredAppointmentDate);
      formData.append('payment_option', paymentOption);

      // Attach passport photo if uploaded/captured
      if (passportPhoto) {
        try {
          const fetchRes = await fetch(passportPhoto);
          const blob = await fetchRes.blob();
          const photoFile = new File([blob], 'passport_photo.png', { type: 'image/png' });
          formData.append('documents', photoFile);
        } catch (photoErr) {
          console.error('Error attaching passport photo:', photoErr);
        }
      }

      files.forEach((f) => {
        formData.append('documents', f);
      });

      const token = localStorage.getItem('csc_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers,
        body: formData
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit application.');

      setSuccessResult(result);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check form details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            Application Submitted
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Request Received Successfully!</h2>
          <p className="text-xs text-slate-500">Your application has been registered in our central queue.</p>
        </div>

        {/* Application ID Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 text-left space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs text-slate-400">Application Reference ID</span>
            <span className="text-xs font-semibold text-emerald-400">STATUS: SUBMITTED</span>
          </div>

          <p className="text-2xl font-black font-mono text-emerald-400">{successResult.application_no}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2">
            <div>
              <span className="text-slate-500 block">Total Amount:</span>
              <span className="font-bold text-white">₹{successResult.total_amount}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Paid Amount:</span>
              <span className="font-bold text-emerald-400">₹{successResult.paid_amount}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Save your Application ID <strong>{successResult.application_no}</strong> to monitor live updates on the tracking page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to={`/track?app_no=${successResult.application_no}&mobile=${customerMobile}`}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Track Application Live</span>
          </Link>
          <button
            onClick={() => {
              setSuccessResult(null);
              setFiles([]);
            }}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  const totalFee = selectedService ? selectedService.service_charge + selectedService.govt_fee : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          Online Service Desk
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">CSC & CSP Application Form</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Fill out customer details, select your service, upload required documents, and receive your Application ID instantly.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        {/* Step 1: Select Service */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
            <span>Select Service</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Category & Name *</label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.category}] {s.title} — Fee: ₹{s.service_charge + s.govt_fee}
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>{selectedService.title}</span>
                  <span className="text-emerald-700">Total Fee: ₹{totalFee}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{selectedService.description}</p>
                <div className="pt-2 border-t border-emerald-200/60 text-[11px]">
                  <strong className="text-slate-700">Required Documents: </strong>
                  <span className="text-slate-600">{selectedService.required_documents.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Customer Personal Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">2</span>
            <span>Customer Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name as in Aadhaar"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="10-Digit Mobile Number"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full residential address details"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Step 3: Applicant Passport Photo Studio */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-3">
            <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
            <span>Applicant Passport Photo Studio</span>
          </h3>

          <p className="text-xs text-slate-600 font-medium">
            Upload or capture applicant passport size photo (3.5 cm x 4.5 cm). You can rotate, crop, adjust brightness/contrast before finalizing.
          </p>

          <PhotoUploadTool onPhotoFinalized={(dataUrl) => setPassportPhoto(dataUrl)} />
        </div>

        {/* Step 4: Document Uploads */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-3">
            <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
            <span>Upload Supporting Documents</span>
          </h3>

          <div className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50/80 rounded-2xl p-6 text-center space-y-3 transition">
            <UploadCloud className="w-8 h-8 text-orange-600 mx-auto" />
            <div className="text-xs text-slate-700">
              <label className="cursor-pointer font-bold text-orange-700 hover:underline">
                Click here to browse files
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">Allowed formats: PDF, JPG, PNG, DOC (Max 10MB per file)</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Selected Files ({files.length}):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-100 rounded-xl text-xs border border-slate-200">
                    <span className="truncate max-w-[200px] text-slate-800 font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-slate-200 rounded-md text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Appointment & Payment Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-3">
            <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs">5</span>
            <span>Appointment & Payment Options</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Center Visit Date</label>
              <input
                type="date"
                value={preferredAppointmentDate}
                onChange={(e) => setPreferredAppointmentDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method Preference</label>
              <select
                value={paymentOption}
                onChange={(e: any) => setPaymentOption(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-500"
              >
                <option value="Pay at Center">Pay in Cash at Center Desk</option>
                <option value="UPI Payment">Online UPI Transfer</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Instructions / Notes</label>
              <textarea
                rows={2}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any specific note regarding your application..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-slate-500">Total Application Fee:</p>
            <p className="text-2xl font-black text-orange-600">₹{totalFee}</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 transition text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application & Get ID'}
          </button>
        </div>
      </form>
    </div>
  );
};
