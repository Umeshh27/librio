import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Members() {
  const { globalSearch } = useOutletContext() || {};
  const { addToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');

  // Sorting and pagination
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== '') {
      setSearchTerm(globalSearch);
    }
  }, [globalSearch]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.getMembers();
      if (res && res.data) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load members directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const q = searchTerm.toLowerCase();
        return (
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q)
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
  }, [members, searchTerm, sortField, sortDirection]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Form handlers
  const openAddModal = () => {
    setFormData({ name: '', email: '', phone: '' });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (member) => {
    setCurrentMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (member) => {
    setCurrentMember(member);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (member) => {
    setCurrentMember(member);
    setIsDetailModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addMember(formData);
      if (res.success) {
        addToast(res.message || 'Member registered successfully', 'success');
        setIsAddModalOpen(false);
        fetchMembers();
      } else {
        setFormError(res.message || 'Could not register member');
      }
    } catch (err) {
      setFormError('Server error while registering member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.updateMember(currentMember.id, formData);
      if (res.success) {
        addToast(res.message || 'Member updated successfully', 'success');
        setIsEditModalOpen(false);
        fetchMembers();
      } else {
        setFormError(res.message || 'Could not update member');
      }
    } catch (err) {
      setFormError('Server error while updating member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!currentMember) return;
    setSubmitting(true);
    try {
      const res = await api.deleteMember(currentMember.id);
      if (res.success) {
        addToast(res.message || 'Member deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        fetchMembers();
      } else {
        addToast(res.message || 'Cannot delete member with active loans', 'error');
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      addToast('An error occurred while deleting member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Member Details',
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-2.5 max-w-[240px]">
          <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-foreground flex-shrink-0">
            {m.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div
              onClick={() => openDetailModal(m)}
              className="font-semibold text-foreground truncate hover:text-primary transition-colors cursor-pointer text-xs"
            >
              {m.name}
            </div>
            <div className="text-[10px] text-secondary font-mono">
              ID #{String(m.id).padStart(4, '0')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-mono max-w-[220px]">
          <Mail className="w-3 h-3 text-secondary flex-shrink-0" />
          <span className="truncate">{m.email}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (m) => (
        <div className="flex items-center gap-1.5 text-[11px] text-secondary font-mono whitespace-nowrap">
          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span>{m.phone || '—'}</span>
        </div>
      ),
    },
    {
      key: 'registrationDate',
      label: 'Enrolled Date',
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-1.5 text-[11px] text-secondary whitespace-nowrap">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span>{m.registrationDate}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
          <button
            onClick={() => openDetailModal(m)}
            className="p-1 rounded text-secondary hover:text-foreground hover:bg-gray-100 transition-colors"
            title="View member profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditModal(m)}
            className="p-1 rounded text-secondary hover:text-foreground hover:bg-gray-100 transition-colors"
            title="Edit member"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openDeleteModal(m)}
            className="p-1 rounded text-secondary hover:text-danger hover:bg-rose-50 transition-colors"
            title="Delete member"
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
            Member Directory
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Registered patrons, contact information, and borrowing privileges.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all shadow-sm whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Register Member</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search members by name, email, or phone..."
          className="w-full sm:max-w-md"
        />
        <div className="text-xs text-secondary font-medium whitespace-nowrap">
          Total Enrolled: <span className="font-semibold text-foreground">{members.length}</span>
        </div>
      </div>

      {/* Members Table */}
      <DataTable
        columns={columns}
        data={paginatedMembers}
        loading={loading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalItems: filteredMembers.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
        emptyMessage="No members found"
        emptySubtext="Try adjusting your search criteria or register a new patron."
      />

      {/* Register Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Library Member"
        subtitle="Create an official borrowing profile in the LIBRIO system"
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
              {submitting ? 'Registering...' : 'Register Member'}
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
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. aarav.sharma@iitd.ac.in"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[10px] text-secondary mt-1">
              Must be unique. Circulation reminders and fine notices will be sent here.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98201 44521"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Member Information"
        subtitle={`Update contact credentials for ${currentMember?.name}`}
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
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Member Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Member Deletion"
        subtitle="This will permanently delete the patron profile."
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
              {submitting ? 'Deleting...' : 'Delete Member'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-secondary leading-relaxed">
            Are you sure you want to remove the member record for:
          </p>
          <div className="p-3 bg-gray-50 rounded-lg border border-border">
            <p className="font-bold text-foreground">{currentMember?.name}</p>
            <p className="text-secondary text-[11px] mt-0.5 font-mono">
              {currentMember?.email}
            </p>
          </div>
          <p className="text-[11px] text-secondary">
            Note: Deletion will be rejected if this member has active or unreturned book loans.
          </p>
        </div>
      </Modal>

      {/* Member Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Member Card & Profile"
        subtitle="Patron credentials and authorization status"
        maxWidth="max-w-md"
        actions={
          <button
            onClick={() => setIsDetailModalOpen(false)}
            className="px-3.5 py-1.5 bg-foreground text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        }
      >
        {currentMember && (
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {currentMember.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-foreground truncate">
                  {currentMember.name}
                </h4>
                <p className="text-secondary font-mono text-[10px]">
                  Patron ID: #{String(currentMember.id).padStart(4, '0')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-white rounded-lg border border-border">
                <span className="text-[10px] text-secondary">Email</span>
                <p className="font-medium text-foreground truncate mt-0.5 text-xs">
                  {currentMember.email}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-border">
                <span className="text-[10px] text-secondary">Phone</span>
                <p className="font-medium text-foreground mt-0.5 text-xs truncate">
                  {currentMember.phone || 'N/A'}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-border flex items-center justify-between text-xs">
              <span className="text-secondary">Enrolled Since</span>
              <span className="font-medium text-foreground">
                {currentMember.registrationDate}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
