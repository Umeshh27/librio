import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  BookOpen,
  Mail,
  Phone,
  Clock,
  Coins,
  Send,
  CheckCircle2,
  Users,
  AlertTriangle,
} from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function OverdueBooks() {
  const { addToast } = useToast();
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Return modal state
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [sortField, setSortField] = useState('daysOverdue');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const res = await api.getOverdueLoans();
      if (res && res.data) {
        setOverdueLoans(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch overdue loan telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const metrics = useMemo(() => {
    const totalOverdueBooks = overdueLoans.length;
    const uniqueMembers = new Set(overdueLoans.map((l) => l.memberId)).size;
    const totalEstimatedFines = overdueLoans.reduce(
      (sum, l) => sum + (parseFloat(l.fineAmount) || (l.daysOverdue || 0) * 5),
      0
    );

    return { totalOverdueBooks, uniqueMembers, totalEstimatedFines };
  }, [overdueLoans]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredLoans = useMemo(() => {
    return overdueLoans
      .filter((l) => {
        const q = searchTerm.toLowerCase();
        return (
          l.memberName?.toLowerCase().includes(q) ||
          l.bookTitle?.toLowerCase().includes(q) ||
          l.memberEmail?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB?.toLowerCase() || '';
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [overdueLoans, searchTerm, sortField, sortDirection]);

  const paginatedLoans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLoans.slice(start, start + pageSize);
  }, [filteredLoans, currentPage, pageSize]);

  const handleSendReminder = (loan) => {
    addToast(
      `Overdue penalty notice dispatched to ${loan.memberEmail}`,
      'success'
    );
  };

  const openReturnModal = (loan) => {
    setSelectedLoan(loan);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedLoan) return;
    setSubmittingReturn(true);
    try {
      const res = await api.returnBook(selectedLoan.id);
      if (res.success) {
        addToast(
          res.message || `Book returned and fine of ₹${((selectedLoan.daysOverdue || 1) * 5).toFixed(2)} recorded!`,
          'success'
        );
        setIsReturnModalOpen(false);
        setSelectedLoan(null);
        fetchOverdue();
      } else {
        addToast(res.message || 'Return failed', 'error');
      }
    } catch (err) {
      addToast('Error communicating with Java backend', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const columns = [
    {
      key: 'memberName',
      label: 'Patron Information',
      sortable: true,
      render: (l) => (
        <div className="flex flex-col min-w-0 max-w-[220px]">
          <span className="font-semibold text-foreground truncate">{l.memberName}</span>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-secondary">
            <span className="truncate font-mono" title={l.memberEmail}>
              {l.memberEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'bookTitle',
      label: 'Overdue Book',
      sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2 max-w-[260px] min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-danger flex-shrink-0" />
          <span className="font-medium text-foreground truncate" title={l.bookTitle}>
            {l.bookTitle}
          </span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs text-danger font-semibold whitespace-nowrap">
          {l.dueDate}
        </span>
      ),
    },
    {
      key: 'daysOverdue',
      label: 'Days Overdue',
      sortable: true,
      align: 'center',
      render: (l) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-danger border border-rose-200 tabular-nums whitespace-nowrap">
          <Clock className="w-3 h-3" /> {l.daysOverdue || 1} d
        </span>
      ),
    },
    {
      key: 'fineAmount',
      label: 'Accrued Fine',
      sortable: true,
      align: 'right',
      render: (l) => {
        const fine = parseFloat(l.fineAmount) || (l.daysOverdue || 1) * 5;
        return (
          <span className="font-bold text-xs text-danger tabular-nums whitespace-nowrap">
            ₹{fine.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <button
            onClick={() => handleSendReminder(l)}
            className="p-1 rounded text-secondary hover:text-primary hover:bg-indigo-50 transition-colors"
            title="Dispatch notice"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openReturnModal(l)}
            className="px-2 py-1 bg-gray-900 hover:bg-black text-white text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 shadow-sm"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Return</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Overdue Books Monitoring
        </h2>
        <p className="text-xs text-secondary mt-0.5">
          Tracking unreturned book loans past their borrowing window with automated ₹5.00/day penalties.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total Overdue Books"
          value={metrics.totalOverdueBooks}
          icon={AlertOctagon}
          description="Loans pending past due date"
          trend="Needs audit"
          trendType="negative"
        />
        <StatCard
          title="Affected Patrons"
          value={metrics.uniqueMembers}
          icon={Users}
          description="Members with overdue books"
          trendType="neutral"
        />
        <StatCard
          title="Outstanding Fines"
          value={`₹${metrics.totalEstimatedFines.toFixed(2)}`}
          icon={Coins}
          description="Accrued at ₹5.00/day"
          trendType="neutral"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Filter overdue records by patron, email, book..."
          className="w-full sm:max-w-md"
        />
        <div className="text-[11px] font-semibold text-danger flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 whitespace-nowrap">
          <AlertTriangle className="w-3 h-3" />
          <span>{filteredLoans.length} Overdue Loan(s)</span>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={paginatedLoans}
        loading={loading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalItems: filteredLoans.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
        emptyMessage="No overdue loans recorded"
        emptySubtext="All active loans are currently within their allowable return period."
      />

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Process Overdue Return"
        subtitle="Confirm book restitution and finalize penalty collection"
        maxWidth="max-w-md"
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-3.5 py-1.5 border border-border text-secondary hover:text-foreground rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReturn}
              disabled={submittingReturn}
              className="px-3.5 py-1.5 bg-foreground text-white rounded-lg text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submittingReturn ? 'Restocking...' : 'Confirm Return & Fine'}
            </button>
          </>
        }
      >
        {selectedLoan && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
              <span className="text-[10px] text-secondary font-mono">
                LOAN #{selectedLoan.id}
              </span>
              <p className="font-bold text-foreground text-sm">
                {selectedLoan.bookTitle}
              </p>
              <p className="text-secondary">
                Patron: <strong>{selectedLoan.memberName}</strong>
              </p>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-danger">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Final Overdue Fine:</span>
                <span className="tabular-nums">
                  ₹{((selectedLoan.daysOverdue || 1) * 5).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] mt-1 opacity-80 leading-normal">
                {selectedLoan.daysOverdue || 1} day(s) overdue × ₹5.00 penalty rate per day.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
