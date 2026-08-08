import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, Building2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ReceiptModalProps {
  appNo: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ appNo, onClose }) => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch(`/api/payments/receipt/${appNo}`)
      .then((res) => {
        if (!res.ok) throw new Error('Receipt data not found.');
        return res.json();
      })
      .then((resData) => setData(resData))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [appNo]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const center = data.center_info || {};
    const app = data.application || {};
    const payments = data.payments || [];

    doc.setFontSize(18);
    doc.text(center.center_name || 'Sarkari Tattha Digital Service Center', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(center.address || '', 105, 27, { align: 'center' });
    doc.text(`Phone: ${center.phone || ''} | Email: ${center.email || ''}`, 105, 33, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(15, 38, 195, 38);

    doc.setFontSize(14);
    doc.text('OFFICIAL SERVICE & PAYMENT RECEIPT', 105, 47, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 15, 58);
    doc.text(`Application ID: ${app.application_no}`, 120, 58);

    doc.text(`Customer Name: ${app.customer_name}`, 15, 66);
    doc.text(`Mobile: ${app.customer_mobile}`, 120, 66);
    doc.text(`Service Requested: ${app.service_name}`, 15, 74);
    doc.text(`Category: ${app.category}`, 120, 74);

    doc.line(15, 80, 195, 80);

    // Table
    doc.text('Description / Details', 15, 88);
    doc.text('Amount (INR)', 160, 88);
    doc.line(15, 92, 195, 92);

    doc.text(`Total Service & Fee Charge`, 15, 100);
    doc.text(`Rs. ${app.total_amount}`, 160, 100);

    doc.text(`Total Amount Paid`, 15, 108);
    doc.text(`Rs. ${app.paid_amount}`, 160, 108);

    doc.text(`Remaining Pending Balance`, 15, 116);
    doc.text(`Rs. ${app.pending_amount}`, 160, 116);

    doc.line(15, 122, 195, 122);

    if (payments.length > 0) {
      doc.text('Payment Transactions Log:', 15, 132);
      let y = 140;
      payments.forEach((p: any) => {
        doc.setFontSize(9);
        doc.text(`${new Date(p.payment_date).toLocaleDateString()} - Method: ${p.payment_method} - Txn ID: ${p.transaction_id} - Paid: Rs. ${p.paid_amount}`, 15, y);
        y += 7;
      });
    }

    doc.setFontSize(9);
    doc.text('Authorized Signature & Stamp', 140, 210);
    doc.text('CSC / CSP Service Point Desk', 140, 220);

    doc.setFontSize(8);
    doc.text('Notice: This is a computer-generated digital receipt. Subject to portal availability and government rules.', 105, 250, { align: 'center' });

    doc.save(`Receipt-${app.application_no}.pdf`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Generating Official Receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Receipt Error</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <p className="text-red-600 mb-6">{error || 'Failed to load receipt.'}</p>
          <button onClick={onClose} className="w-full py-2 bg-slate-800 text-white rounded-xl font-medium">
            Close
          </button>
        </div>
      </div>
    );
  }

  const { application: app, payments, center_info: center } = data;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl my-8 overflow-hidden print:shadow-none print:m-0 print:w-full">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Official Digital Receipt</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-8 bg-white text-slate-800 space-y-6">
          {/* Header Branding */}
          <div className="border-b border-slate-200 pb-6 text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{center.center_name || 'CSC & CSP Digital Service Center'}</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{center.address}</p>
            <p className="text-xs text-slate-500">Phone: {center.phone} | Email: {center.email}</p>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
            <div>
              <p className="text-slate-500">Application ID</p>
              <p className="font-bold text-slate-900 text-sm">{app.application_no}</p>
            </div>
            <div>
              <p className="text-slate-500">Date & Time</p>
              <p className="font-semibold text-slate-800">{new Date(app.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Customer Name</p>
              <p className="font-semibold text-slate-800">{app.customer_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Mobile Number</p>
              <p className="font-semibold text-slate-800">{app.customer_mobile}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Service Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="p-3 font-medium">{app.service_name}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-full text-[10px]">{app.category}</span></td>
                  <td className="p-3 text-right font-bold">₹{app.total_amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 space-y-2 text-xs border border-emerald-100">
            <div className="flex justify-between text-slate-600">
              <span>Total Service Amount:</span>
              <span className="font-semibold text-slate-800">₹{app.total_amount}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Paid Amount:</span>
              <span className="font-bold text-emerald-700">₹{app.paid_amount}</span>
            </div>
            <div className="flex justify-between text-slate-600 border-t border-emerald-200 pt-2 font-semibold">
              <span>Pending Balance:</span>
              <span className={app.pending_amount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                ₹{app.pending_amount}
              </span>
            </div>
          </div>

          {/* Payment Transactions Log */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Transactions</h4>
              <div className="space-y-1.5">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <p className="font-medium text-slate-800">{p.payment_method} - Txn ID: <span className="font-mono text-slate-600">{p.transaction_id}</span></p>
                      <p className="text-[10px] text-slate-500">{new Date(p.payment_date).toLocaleString()} • Managed by {p.staff_name}</p>
                    </div>
                    <div className="text-right font-bold text-emerald-700">
                      +₹{p.paid_amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stamp & Authorized Signature */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Digital Seal</span>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs">{center.disclaimer_text}</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-32 h-10 border-b border-dashed border-slate-400 mx-auto flex items-center justify-center text-[10px] text-slate-400 italic">
                [ Center Seal Stamp ]
              </div>
              <p className="font-bold text-slate-800">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
