import React from 'react';
import { AlertTriangle, UserCheck, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { DuplicateMatch } from '../types';

interface DuplicateCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: DuplicateMatch[];
  onSelectExisting?: (match: DuplicateMatch) => void;
}

export const DuplicateCheckModal: React.FC<DuplicateCheckModalProps> = ({
  isOpen,
  onClose,
  matches,
  onSelectExisting
}) => {
  if (!isOpen || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-300">Potential Duplicate Record Found</h3>
            <p className="text-xs text-slate-400">Match detected on Mobile Number, Aadhaar, or PAN</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl">
          The system detected {matches.length} matching existing customer record(s). Linking to an existing customer prevents fragmenting profile ledgers and pending balance records.
        </p>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-5">
          {matches.map((match, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center justify-between hover:border-amber-500/50 transition"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{match.customer_name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase font-mono font-bold">
                    Matched {match.matched_field.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mobile: <span className="text-slate-200 font-mono">{match.customer_mobile}</span>
                </p>
                {match.existing_applications_count !== undefined && (
                  <p className="text-[11px] text-emerald-400 mt-0.5">
                    History: {match.existing_applications_count} prior application(s)
                  </p>
                )}
              </div>

              {onSelectExisting && (
                <button
                  onClick={() => {
                    onSelectExisting(match);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Use Record</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Acknowledge & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
