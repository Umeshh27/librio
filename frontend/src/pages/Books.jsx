import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Filter,
  Layers,
  AlertCircle,
} from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const CATEGORIES = [
  'All Categories',
  'Computer Science',
  'Fiction & Literature',
  'Mathematics',
  'Science & Nature',
  'Business & Finance',
  'History & Philosophy',
];

export default function Books() {
  const { globalSearch } = useOutletContext() || {};
  const { addToast } = useToast();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Sorting and pagination state
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    totalCopies: 5,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== '') {
      setSearchTerm(globalSearch);
    }
  }, [globalSearch]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.getBooks();
      if (res && res.data) {
        setBooks(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load books catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesSearch =
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All Categories' ||
          book.category === selectedCategory;

        let matchesAvailability = true;
        if (availabilityFilter === 'AVAILABLE') {
          matchesAvailability = book.availableCopies > 0;
        } else if (availabilityFilter === 'OUT_OF_STOCK') {
          matchesAvailability = book.availableCopies === 0;
        } else if (availabilityFilter === 'LOW_STOCK') {
          matchesAvailability =
            book.availableCopies > 0 && book.availableCopies <= 2;
        }

        return matchesSearch && matchesCategory && matchesAvailability;
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
  }, [books, searchTerm, selectedCategory, availabilityFilter, sortField, sortDirection]);

  // Paginated books
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Form handlers
  const openAddModal = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: 'Computer Science',
      totalCopies: 5,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (book) => {
    setCurrentBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (book) => {
    setCurrentBook(book);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      setFormError('Title, author, and ISBN are required.');
      return;
    }
    if (Number(formData.totalCopies) <= 0) {
      setFormError('Total copies must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addBook(formData);
      if (res.success) {
        addToast(res.message || 'Book added successfully', 'success');
        setIsAddModalOpen(false);
        fetchBooks();
      } else {
        setFormError(res.message || 'Could not add book');
      }
    } catch (err) {
      setFormError('Server error while adding book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      setFormError('Title, author, and ISBN are required.');
      return;
    }

    // Business rule: total copies cannot be reduced below issued copies
    const issuedCopies = currentBook.totalCopies - currentBook.availableCopies;
    if (Number(formData.totalCopies) < issuedCopies) {
      setFormError(
        `Cannot reduce total copies below ${issuedCopies} (${issuedCopies} copies currently issued).`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.updateBook(currentBook.id, formData);
      if (res.success) {
        addToast(res.message || 'Book updated successfully', 'success');
        setIsEditModalOpen(false);
        fetchBooks();
      } else {
        setFormError(res.message || 'Could not update book');
      }
    } catch (err) {
      setFormError('Server error while updating book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!currentBook) return;

    if (currentBook.availableCopies < currentBook.totalCopies) {
      addToast(
        `Cannot delete "${currentBook.title}": ${
          currentBook.totalCopies - currentBook.availableCopies
        } active copy/copies borrowed.`,
        'error'
      );
      setIsDeleteModalOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.deleteBook(currentBook.id);
      if (res.success) {
        addToast(res.message || 'Book deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        fetchBooks();
      } else {
        addToast(res.message || 'Failed to delete book', 'error');
      }
    } catch (err) {
      addToast('An error occurred while deleting the book', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Book Details',
      sortable: true,
      render: (book) => (
        <div className="flex items-start gap-2.5 max-w-[280px]">
          <div className="w-7 h-9 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="font-semibold text-foreground truncate hover:text-primary transition-colors cursor-pointer text-xs"
              title={book.title}
            >
              {book.title}
            </div>
            <div className="text-[11px] text-secondary truncate" title={book.author}>
              {book.author}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'isbn',
      label: 'ISBN',
      sortable: true,
      render: (book) => (
        <span className="font-mono text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
          {book.isbn}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (book) => (
        <span className="inline-flex items-center gap-1.5 text-[11px] text-secondary font-medium whitespace-nowrap">
          <Layers className="w-3 h-3 text-gray-400" />
          {book.category}
        </span>
      ),
    },
    {
      key: 'totalCopies',
      label: 'Total Copies',
      sortable: true,
      align: 'center',
      render: (book) => (
        <span className="font-semibold text-foreground tabular-nums text-xs whitespace-nowrap">
          {book.totalCopies}
        </span>
      ),
    },
    {
      key: 'availableCopies',
      label: 'Available Copies',
      sortable: true,
      align: 'center',
      render: (book) => (
        <span
          className={`font-semibold tabular-nums text-xs whitespace-nowrap ${
            book.availableCopies === 0
              ? 'text-danger'
              : book.availableCopies <= 2
              ? 'text-warning'
              : 'text-success'
          }`}
        >
          {book.availableCopies}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Availability',
      align: 'center',
      render: (book) => {
        let badge = 'Available';
        if (book.availableCopies === 0) badge = 'Out of Stock';
        else if (book.availableCopies <= 2) badge = 'Low Stock';
        return (
          <div className="whitespace-nowrap">
            <StatusBadge status={badge} />
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (book) => (
        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
          <button
            onClick={() => openEditModal(book)}
            className="p-1 rounded text-secondary hover:text-foreground hover:bg-gray-100 transition-colors"
            title="Edit book details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openDeleteModal(book)}
            className="p-1 rounded text-secondary hover:text-danger hover:bg-rose-50 transition-colors"
            title="Delete book"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Book Inventory
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Manage catalog titles, barcode indexes, categories, and physical shelf quantities.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all shadow-sm whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-border shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search by title, author, or ISBN..."
          className="flex-1"
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-gray-50 border border-border px-2.5 py-1 rounded-lg text-xs">
            <Filter className="w-3 h-3 text-secondary" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-1 bg-gray-50 border border-border px-2.5 py-1 rounded-lg text-xs">
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="AVAILABLE">Available</option>
              <option value="LOW_STOCK">Low Stock (≤ 2)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <DataTable
        columns={columns}
        data={paginatedBooks}
        loading={loading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalItems: filteredBooks.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
        emptyMessage="No books match the filter criteria"
        emptySubtext="Try clearing your search terms or selecting another category filter."
      />

      {/* Add Book Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Book to Collection"
        subtitle="Register a new title into the LIBRIO catalog inventory"
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 border border-border text-secondary hover:text-foreground rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSubmit}
              disabled={submitting}
              className="px-3.5 py-1.5 bg-foreground text-white rounded-lg text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? 'Adding...' : 'Add Book'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-danger flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Book Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Clean Architecture: A Craftsman's Guide"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Author(s) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Robert C. Martin"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">
                ISBN <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="978-0134494166"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Total Copies in Stock <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCopies: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Book Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Book Details"
        subtitle={`Update metadata and copies for "${currentBook?.title}"`}
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3.5 py-1.5 border border-border text-secondary hover:text-foreground rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSubmit}
              disabled={submitting}
              className="px-3.5 py-1.5 bg-foreground text-white rounded-lg text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-danger flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Book Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Author(s) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">
                ISBN <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Total Copies in Stock <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCopies: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {currentBook && (
                <p className="text-[10px] text-secondary mt-1">
                  Active copies issued:{' '}
                  <span className="font-semibold text-foreground">
                    {currentBook.totalCopies - currentBook.availableCopies}
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Book Removal"
        subtitle="This action will delete the book from the database permanently."
        maxWidth="max-w-md"
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3.5 py-1.5 border border-border text-secondary hover:text-foreground rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="px-3.5 py-1.5 bg-danger text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-secondary leading-relaxed">
            Are you sure you want to delete the book titled:
          </p>
          <div className="p-3 bg-gray-50 rounded-lg border border-border">
            <p className="font-bold text-foreground">{currentBook?.title}</p>
            <p className="text-secondary text-[11px] mt-0.5 font-mono">
              ISBN: {currentBook?.isbn}
            </p>
          </div>
          {currentBook &&
            currentBook.totalCopies > currentBook.availableCopies && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-danger text-[11px] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Warning: Cannot delete while active loan records exist.
                </span>
              </div>
            )}
        </div>
      </Modal>
    </div>
  );
}
