import React from 'react';
import Modal from './Modal';
import { BookOpen, LifeBuoy, Terminal, Database, KeyRound, ExternalLink, HelpCircle } from 'lucide-react';

export default function HelpSupportModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help & System Documentation"
      subtitle="Comprehensive guide to the LIBRIO Core Java & MySQL architecture"
      maxWidth="max-w-xl"
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-foreground text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          Close Documentation
        </button>
      }
    >
      <div className="space-y-4 text-xs text-foreground/80 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-gray-50 border border-border">
          <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Circulation & Fine Rules</span>
          </div>
          <p className="text-secondary text-[11px] leading-normal">
            Standard borrowing duration is <strong>14 days</strong>. An overdue fine of <strong>₹5.00 per day</strong> is automatically accrued on unreturned loans past their due date, computed dynamically via Java LocalDate ChronoUnit API.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50 border border-border">
          <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
            <Database className="w-4 h-4 text-primary" />
            <span>ACID Transaction Integrity</span>
          </div>
          <p className="text-secondary text-[11px] leading-normal">
            Book issue and return flows execute inside JDBC transactions (<code className="bg-white px-1.5 py-0.5 rounded border border-gray-200">connection.setAutoCommit(false)</code>). Available copies and loan records are committed atomically with rollback protection on errors.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50 border border-border">
          <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
            <Terminal className="w-4 h-4 text-primary" />
            <span>REST API Endpoint Reference</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[10px]">
            <div className="bg-white p-2 rounded-lg border border-border">
              <span className="text-emerald-600 font-bold">GET</span> /api/dashboard
            </div>
            <div className="bg-white p-2 rounded-lg border border-border">
              <span className="text-emerald-600 font-bold">GET</span> /api/books
            </div>
            <div className="bg-white p-2 rounded-lg border border-border">
              <span className="text-blue-600 font-bold">POST</span> /api/loans
            </div>
            <div className="bg-white p-2 rounded-lg border border-border">
              <span className="text-amber-600 font-bold">PUT</span> /api/loans/{'{id}'}/return
            </div>
          </div>
        </div>

        <div className="text-[11px] text-secondary flex items-center justify-between pt-1">
          <span>Engineered with Core Java 21, JDBC & React 18</span>
          <span className="font-semibold text-primary">Version 1.0.0-PRO</span>
        </div>
      </div>
    </Modal>
  );
}

