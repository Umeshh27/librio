import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  History,
  BookOpen,
} from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function BorrowingHistory() {
  const { globalSearch } = useOutletContext() || {};
  const { addToast } = useToast();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Sorting and pagination
  const [sortField, setSortField] = useState('issueDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== '') {
      setSearchTerm(globalSearch);
    }
  }, [globalSearch]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getBorrowingHistory();
      if (res && res.data) {
        setLoans(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load borrowing history log', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredLoans = useMemo(() => {
    return loans
      .filter((loan) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          loan.memberName?.toLowerCase().includes(q) ||
          loan.bookTitle?.toLowerCase().includes(q) ||
          String(loan.id).includes(q);

        let matchesStatus = true;
        if (statusFilter !== 'ALL') {
          matchesStatus = loan.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
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
  }, [loans, searchTerm, statusFilter, sortField, sortDirection]);

  const paginatedLoans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLoans.slice(start, start + pageSize);
  }, [filteredLoans, currentPage, pageSize]);

  const columns = [
    {
      key: 'id',
      label: 'Loan ID',
      sortable: true,
      render: (loan) => (
        <span className="font-mono text-xs font-semibold text-secondary whitespace-nowrap">
          #{String(loan.id).padStart(5, '0')}
        </span>
      ),
    },
    {
      key: 'memberName',
      label: 'Patron Details',
      sortable: true,
      render: (loan) => (
        <div className="flex flex-col min-w-0 max-w-[200px]">
          <span className="font-semibold text-foreground truncate">{loan.memberName}</span>
          <span className="text-[10px] text-secondary font-mono truncate">
            {loan.memberEmail || `ID #${loan.memberId}`}
          </span>
        </div>
      ),
    },
    {
      key: 'bookTitle',
      label: 'Book Title',
      sortable: true,
      render: (loan) => (
        <div className="flex items-center gap-1.5 max-w-[240px] min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="font-medium text-foreground truncate" title={loan.bookTitle}>
            {loan.bookTitle}
          </span>
        </div>
      ),
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      render: (loan) => (
        <span className="font-mono text-xs text-secondary whitespace-nowrap">{loan.issueDate}</span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (loan) => (
        <span
          className={`font-mono text-xs whitespace-nowrap ${
            loan.status === 'OVERDUE'
              ? 'text-danger font-semibold'
              : 'text-secondary'
          }`}
        >
          {loan.dueDate}
        </span>
      ),
    },
    {
      key: 'returnDate',
      label: 'Return Date',
      sortable: true,
      render: (loan) => (
        <span className="font-mono text-xs text-secondary whitespace-nowrap">
          {loan.returnDate || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (loan) => (
        <div className="whitespace-nowrap">
          <StatusBadge status={loan.status} />
        </div>
      ),
    },
    {
      key: 'fineAmount',
      label: 'Fine Assessed',
      sortable: true,
      align: 'right',
      render: (loan) => {
        const fine = parseFloat(loan.fineAmount || 0);
        return (
          <span
            className={`font-semibold tabular-nums text-xs whitespace-nowrap ${
              fine > 0 ? 'text-danger' : 'text-gray-400'
            }`}
          >
            {fine > 0 ? `₹${fine.toFixed(2)}` : '₹0.00'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Borrowing History
        </h2>
        <p className="text-xs text-secondary mt-0.5">
          Complete circulation audit log of book checkout issuances, returns, and penalties.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-border shadow-subtle flex flex-col md:flex-row items-center justify-between gap-2.5">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search by patron, book, or loan ID..."
          className="w-full md:max-w-md"
        />

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-gray-50 border border-border rounded-lg">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'ISSUED', label: 'Active Loans' },
            { id: 'RETURNED', label: 'Returned' },
            { id: 'OVERDUE', label: 'Overdue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
        emptyMessage="No historical borrowing records found"
        emptySubtext="Try selecting another status tab or refining your search parameters."
      />
    </div>
  );
}
