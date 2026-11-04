import React, { useState, useEffect } from 'react';
import {
  Repeat,
  BookOpen,
  UserCheck,
  CheckCircle2,
  Search,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function IssueReturn() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('issue');
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [issueError, setIssueError] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  // Return Desk State
  const [returnSearchTerm, setReturnSearchTerm] = useState('');
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const today = new Date();
    const isoToday = today.toISOString().split('T')[0];
    setIssueDate(isoToday);

    const defaultDue = new Date(today);
    defaultDue.setDate(today.getDate() + 14);
    const isoDue = defaultDue.toISOString().split('T')[0];
    setDueDate(isoDue);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, membersRes, loansRes] = await Promise.all([
        api.getBooks(),
        api.getMembers(),
        api.getActiveLoans(),
      ]);

      if (booksRes?.data) setBooks(booksRes.data);
      if (membersRes?.data) setMembers(membersRes.data);
      if (loansRes?.data) setActiveLoans(loansRes.data);
    } catch (err) {
      console.error(err);
      addToast('Error synchronizing circulation telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setIssueError('');

    if (!selectedMemberId) {
      setIssueError('Please choose an authorized member.');
      return;
    }
    if (!selectedBookId) {
      setIssueError('Please choose a book from the catalog.');
      return;
    }

    const book = books.find((b) => b.id === Number(selectedBookId));
    if (!book) {
      setIssueError('Selected book not found.');
      return;
    }
    if (book.availableCopies <= 0) {
      setIssueError(`"${book.title}" is out of stock (0 available copies).`);
      return;
    }

    if (new Date(dueDate) < new Date(issueDate)) {
      setIssueError('Due date cannot be earlier than issue date.');
      return;
    }

    setSubmittingIssue(true);
    try {
      const payload = {
        bookId: selectedBookId,
        memberId: selectedMemberId,
        issueDate,
        dueDate,
      };

      const res = await api.issueBook(payload);
      if (res.success) {
        addToast(
          res.message || 'Book issued successfully! Stock updated.',
          'success'
        );
        setSelectedBookId('');
        loadData();
      } else {
        setIssueError(res.message || 'Failed to issue book');
      }
    } catch (err) {
      setIssueError('Server communication error during transaction');
    } finally {
      setSubmittingIssue(false);
    }
  };

  const filteredActiveLoans = activeLoans.filter((loan) => {
    const q = returnSearchTerm.toLowerCase();
    return (
      loan.bookTitle?.toLowerCase().includes(q) ||
      loan.memberName?.toLowerCase().includes(q) ||
      String(loan.id).includes(q)
    );
  });

  const calculateFine = (loan) => {
    if (!loan?.dueDate) return 0;
    const due = new Date(loan.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - due;
    if (diffTime <= 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 5;
  };

  const openReturnModal = (loan) => {
    setSelectedLoanForReturn(loan);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedLoanForReturn) return;
    setSubmittingReturn(true);
    try {
      const res = await api.returnBook(selectedLoanForReturn.id);
      if (res.success) {
        addToast(
          res.message || `Book returned successfully! Copy restored to shelf.`,
          'success'
        );
        setIsReturnModalOpen(false);
        setSelectedLoanForReturn(null);
        loadData();
      } else {
        addToast(res.message || 'Could not complete return', 'error');
      }
    } catch (err) {
      addToast('Error executing return transaction', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const selectedBook = books.find((b) => b.id === Number(selectedBookId));
  const selectedMember = members.find((m) => m.id === Number(selectedMemberId));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Circulation Desk
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Issue catalog books to members and process returns with automated penalty verification.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-0.5 bg-gray-100 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'issue'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-primary" />
            <span>Issue Book</span>
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'return'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>Return Book ({activeLoans.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ISSUE BOOK ================= */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5 shadow-subtle">
            <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary flex-shrink-0">
                <Repeat className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">
                  New Borrowing Transaction
                </h3>
                <p className="text-[11px] text-secondary">
                  Complete checkout particulars to dispatch a book copy to a patron
                </p>
              </div>
            </div>

            {issueError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{issueError}</span>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  1. Select Member <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-foreground text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer font-medium"
                >
                  <option value="">-- Choose registered member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  2. Select Book Title <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-foreground text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer font-medium"
                >
                  <option value="">-- Choose book from collection --</option>
                  {books.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.availableCopies <= 0}
                    >
                      {b.title} — {b.availableCopies} available{' '}
                      {b.availableCopies <= 0 ? '(OUT OF STOCK)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Due Date (14 Days Standard)
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submittingIssue}
                  className="w-full py-2 px-4 bg-foreground text-white rounded-lg text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {submittingIssue ? 'Issuing in Progress...' : 'Confirm Book Issuance'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Real-time Verification Preview Sidebar */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-border p-4 shadow-subtle">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2.5">
                Transaction Preview
              </h4>

              <div className="space-y-2.5 text-xs">
                {/* Member Preview */}
                <div className="p-2.5 bg-gray-50 rounded-lg border border-border">
                  <div className="flex items-center gap-1 font-semibold text-foreground mb-0.5 text-xs">
                    <UserCheck className="w-3 h-3 text-primary" /> Member Card
                  </div>
                  {selectedMember ? (
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-xs truncate">
                        {selectedMember.name}
                      </p>
                      <p className="text-[10px] text-secondary truncate">
                        {selectedMember.email}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-[11px]">No member selected</p>
                  )}
                </div>

                {/* Book Preview */}
                <div className="p-2.5 bg-gray-50 rounded-lg border border-border">
                  <div className="flex items-center gap-1 font-semibold text-foreground mb-0.5 text-xs">
                    <BookOpen className="w-3 h-3 text-primary" /> Book Details
                  </div>
                  {selectedBook ? (
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-xs truncate">
                        {selectedBook.title}
                      </p>
                      <p className="text-[10px] text-secondary font-mono truncate">
                        ISBN: {selectedBook.isbn}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-secondary">Shelf Quantity:</span>
                        <span
                          className={`font-bold ${
                            selectedBook.availableCopies > 0
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
                          {selectedBook.availableCopies} available
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-[11px]">No book selected</p>
                  )}
                </div>

                <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 leading-normal">
                  <p className="font-semibold mb-0.5">ACID Inventory Invariant</p>
                  Available shelf quantity decrements by 1 inside an atomic JDBC transaction.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: RETURN DESK ================= */}
      {activeTab === 'return' && (
        <div className="space-y-3">
          {/* Search Active Loans */}
          <div className="bg-white p-3 rounded-xl border border-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={returnSearchTerm}
                onChange={(e) => setReturnSearchTerm(e.target.value)}
                placeholder="Search active loans by patron name or book title..."
                className="w-full pl-8 pr-3 py-1 text-xs bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="text-xs text-secondary font-medium whitespace-nowrap">
              Active Loans: <span className="font-semibold text-foreground">{activeLoans.length}</span>
            </div>
          </div>

          {/* Active Loans Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredActiveLoans.length === 0 ? (
              <div className="col-span-full py-12 bg-white rounded-xl border border-border text-center">
                <p className="text-xs font-semibold text-foreground">
                  No active loans found
                </p>
                <p className="text-[11px] text-secondary mt-0.5">
                  All checked-out books have been returned or no active records match your search.
                </p>
              </div>
            ) : (
              filteredActiveLoans.map((loan) => {
                const fine = calculateFine(loan);
                const isOverdue = fine > 0;

                return (
                  <div
                    key={loan.id}
                    className="bg-white rounded-xl border border-border p-4 shadow-subtle hover:border-gray-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] text-secondary font-semibold">
                          LOAN #{loan.id}
                        </span>
                        <StatusBadge
                          status={isOverdue ? 'OVERDUE' : 'ISSUED'}
                          text={isOverdue ? 'OVERDUE' : 'ACTIVE'}
                        />
                      </div>

                      <h4 className="font-bold text-xs text-foreground leading-snug line-clamp-2" title={loan.bookTitle}>
                        {loan.bookTitle}
                      </h4>

                      <div className="mt-2.5 space-y-1 text-xs text-secondary">
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Patron:</span>
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {loan.memberName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Issued:</span>
                          <span className="font-mono">{loan.issueDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Due Date:</span>
                          <span
                            className={`font-mono font-medium ${
                              isOverdue ? 'text-danger font-bold' : ''
                            }`}
                          >
                            {loan.dueDate}
                          </span>
                        </div>
                      </div>

                      {isOverdue && (
                        <div className="mt-2.5 p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-danger text-[10px] flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3 h-3" /> Accrued Fine
                          </span>
                          <span className="font-bold tabular-nums">
                            ₹{fine.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100">
                      <button
                        onClick={() => openReturnModal(loan)}
                        className="w-full py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Process Return</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Confirm Book Return"
        subtitle="Finalize loan checkout and update catalog shelf quantity"
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
              {submittingReturn ? 'Processing...' : 'Confirm Return & Restock'}
            </button>
          </>
        }
      >
        {selectedLoanForReturn && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-border space-y-1">
              <span className="text-[10px] text-secondary font-mono uppercase">
                Loan ID: #{selectedLoanForReturn.id}
              </span>
              <p className="font-bold text-foreground text-sm">
                {selectedLoanForReturn.bookTitle}
              </p>
              <p className="text-secondary text-xs">
                Borrowed by: <strong>{selectedLoanForReturn.memberName}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-white rounded-lg border border-border">
                <span className="text-[10px] text-secondary">Due Date</span>
                <p className="font-mono font-medium text-foreground mt-0.5 text-xs">
                  {selectedLoanForReturn.dueDate}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-border">
                <span className="text-[10px] text-secondary">Return Date</span>
                <p className="font-mono font-medium text-foreground mt-0.5 text-xs">
                  {new Date().toISOString().split('T')[0]} (Today)
                </p>
              </div>
            </div>

            {(() => {
              const fine = calculateFine(selectedLoanForReturn);
              return (
                <div
                  className={`p-3 rounded-lg border ${
                    fine > 0
                      ? 'bg-rose-50 border-rose-200 text-danger'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>Overdue Penalty Assessed:</span>
                    <span className="text-xs font-bold tabular-nums">
                      ₹{fine.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5 opacity-80 leading-normal">
                    {fine > 0
                      ? `Computed at ₹5.00/day for overdue days past ${selectedLoanForReturn.dueDate}.`
                      : 'Returned on or before due date. Zero fine accrued.'}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}
