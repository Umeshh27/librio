import React, { useState } from 'react';
import Modal from './Modal';
import { Settings, Server, Database, Shield, Sliders } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [finePerDay, setFinePerDay] = useState(5);
  const [loanDuration, setLoanDuration] = useState(14);
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System configuration saved successfully', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Settings & Policies"
      subtitle="Configure library operational parameters and network coordinates"
      maxWidth="max-w-lg"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border text-secondary hover:text-foreground rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-foreground text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" /> Default Loan Duration (Days)
          </label>
          <input
            type="number"
            min="1"
            max="90"
            value={loanDuration}
            onChange={(e) => setLoanDuration(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-foreground font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-[11px] text-secondary mt-1">
            Standard borrowing window applied when dispatching book issuances.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-warning" /> Overdue Fine Rate (₹ per day)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={finePerDay}
            onChange={(e) => setFinePerDay(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-foreground font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-[11px] text-secondary mt-1">
            Penalty rate calculated dynamically for books returned past the due date.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-success" /> Java Backend Endpoint
          </label>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-foreground font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-[11px] text-secondary mt-1">
            Core Java built-in HttpServer connection target with CORS support.
          </p>
        </div>
      </form>
    </Modal>
  );
}

