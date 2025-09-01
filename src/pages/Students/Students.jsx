import React, { useState, useEffect, useCallback } from 'react';
import { usersService } from '../../services/users';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage, debounce, isValidUzbekPhone } from '../../utils/helpers';
import { PAGINATION } from '../../utils/constants';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: PAGINATION.DEFAULT_PAGE,
    size: PAGINATION.DEFAULT_SIZE,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    telegram_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadStudents();
  }, [pagination.page, pagination.size]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadStudents(1, pagination.size, query);
    }, 500),
    [pagination.size]
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      loadStudents(pagination.page, pagination.size, '');
    }
  }, [searchQuery, debouncedSearch]);

  const loadStudents = async (page = pagination.page, size = pagination.size, search = searchQuery) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await usersService.students.getAll(page, size, search);
      
      if (response.success) {
        setStudents(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.page || page,
          total: response.data.total || 0
        }));
      } else {
        setError('Failed to load students');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ full_name: '', phone: '', telegram_id: '' });
    setFormErrors({});
    setSelectedStudent(null);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setModalMode('edit');
    setFormData({
      full_name: student.full_name || '',
      phone: student.phone || '',
      telegram_id: student.telegram_id || ''
    });
    setFormErrors({});
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ full_name: '', phone: '', telegram_id: '' });
    setFormErrors({});
    setSelectedStudent(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!isValidUzbekPhone(formData.phone)) {
      errors.phone = 'Please enter a valid Uzbekistan phone number (+998XXXXXXXXX)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setModalLoading(true);
    
    try {
      let response;
      if (modalMode === 'create') {
        response = await usersService.students.create(formData);
      } else {
        response = await usersService.students.update(selectedStudent.id, formData);
      }
      
      if (response.success) {
        closeModal();
        loadStudents(); // Reload the list
      } else {
        setError(response.detail || `Failed to ${modalMode} student`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.full_name}?`)) {
      return;
    }

    try {
      const response = await usersService.students.delete(student.id);
      if (response.success) {
        loadStudents(); // Reload the list
      } else {
        setError(response.detail || 'Failed to delete student');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const columns = [
    {
      key: 'full_name',
      title: 'Name',
      render: (value) => value || 'N/A'
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => value || 'N/A'
    },
    {
      key: 'telegram_id',
      title: 'Telegram',
      render: (value) => value || 'N/A'
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value) => (
        <span className={`status ${value ? 'status-active' : 'status-inactive'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      render: (_, student) => (
        <div className="table-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(student)}
          >
            Edit
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(student)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading && students.length === 0) {
    return <LoadingSpinner message="Loading students..." />;
  }

  return (
    <div className="students-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadStudents()}>
            Retry
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h2>Students</h2>
          <p>Manage all students in your learning center</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          Add Student
        </button>
      </div>

      <div className="students-content">
        <div className="search-bar">
          <input
            type="text"
            className="form-control"
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Table 
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage="No students found"
        />

        {pagination.total > pagination.size && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            itemsPerPage={pagination.size}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Student Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Add New Student' : 'Edit Student'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="full_name"
              className={`form-control ${formErrors.full_name ? 'error' : ''}`}
              value={formData.full_name}
              onChange={handleFormChange}
              placeholder="Enter student's full name"
              disabled={modalLoading}
            />
            {formErrors.full_name && (
              <div className="form-error">{formErrors.full_name}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              className={`form-control ${formErrors.phone ? 'error' : ''}`}
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="+998901234567"
              disabled={modalLoading}
            />
            {formErrors.phone && (
              <div className="form-error">{formErrors.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Telegram ID</label>
            <input
              type="text"
              name="telegram_id"
              className="form-control"
              value={formData.telegram_id}
              onChange={handleFormChange}
              placeholder="@username"
              disabled={modalLoading}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading}
            >
              {modalLoading ? 'Saving...' : modalMode === 'create' ? 'Add Student' : 'Update Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;