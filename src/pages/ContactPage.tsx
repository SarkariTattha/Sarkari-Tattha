import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Contact Service Center</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          We are available to assist you with e-governance form applications, banking services, and document inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Center Contact Details</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Center Address</strong>
                  <span className="text-slate-300">Shop No. 12, Main Market Road, Near Bus Stand, District Center</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Helpline / Phone</strong>
                  <span className="text-slate-300">+91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Email Address</strong>
                  <span className="text-slate-300">support@sarkaritattha.com</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Opening Hours</strong>
                  <span className="text-slate-300">Monday - Saturday: 8:00 AM - 8:00 PM<br />Sunday: Closed</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-3">
              <a
                href="tel:+919876543210"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center rounded-xl text-xs transition"
              >
                Call Desk
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-center rounded-xl text-xs transition"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Send Us a Direct Message</h3>

          {sent ? (
            <div className="p-8 bg-emerald-50 text-emerald-900 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base">Message Sent Successfully!</h4>
              <p className="text-xs text-slate-600">Our center operator will call or reply to your inquiry shortly.</p>
              <button
                onClick={() => setSent(false)}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit Mobile Number"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry / Message *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your service requirement or question..."
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
