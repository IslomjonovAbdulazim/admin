import React, { useState, useEffect } from 'react';
import { usersService } from '../../services/users';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage, isValidEmail } from '../../utils/helpers';
import './Teachers.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await usersService.teachers.getAll();
      
      if (response.success) {
        setTeachers(response.data || []);
      } else {
        setError('Failed to load teachers');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ full_name: '', email: '', password: '' });
    setFormErrors({});
    setSelectedTeacher(null);
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setModalMode('edit');
    setFormData({
      full_name: teacher.full_name || '',
      email: teacher.email || '',
      password: '' // Don't prefill password for security
    });
    setFormErrors({});
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ full_name: '', email: '', password: '' });
    setFormErrors({});
    setSelectedTeacher(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (modalMode === 'create' && !formData.password.trim()) {
      errors.password = 'Password is required';
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      const submitData = { ...formData };
      
      // Remove empty password for updates
      if (modalMode === 'edit' && !submitData.password.trim()) {
        delete submitData.password;
      }
      
      if (modalMode === 'create') {
        response = await usersService.teachers.create(submitData);
      } else {
        response = await usersService.teachers.update(selectedTeacher.id, submitData);
      }
      
      if (response.success) {
        closeModal();
        loadTeachers(); // Reload the list
      } else {
        setError(response.detail || `Failed to ${modalMode} teacher`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.full_name}?`)) {
      return;
    }

    try {
      const response = await usersService.teachers.delete(teacher.id);
      if (response.success) {
        loadTeachers(); // Reload the list
      } else {
        setError(response.detail || 'Failed to delete teacher');
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
      key: 'email',
      title: 'Email',
      render: (value) => value || 'N/A'
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
      render: (_, teacher) => (
        <div className="table-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(teacher)}
          >
            Edit
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(teacher)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading teachers..." />;
  }

  return (
    <div className="teachers-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadTeachers()}>
            Retry
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h2>Teachers</h2>
          <p>Manage all teachers in your learning center</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          Add Teacher
        </button>
      </div>

      <div className="teachers-content">
        <Table 
          columns={columns}
          data={teachers}
          loading={loading}
          emptyMessage="No teachers found. Add your first teacher to get started."
        />
      </div>

      {/* Teacher Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Add New Teacher' : 'Edit Teacher'}
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
              placeholder="Enter teacher's full name"
              disabled={modalLoading}
            />
            {formErrors.full_name && (
              <div className="form-error">{formErrors.full_name}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${formErrors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleFormChange}
              placeholder="teacher@example.com"
              disabled={modalLoading}
            />
            {formErrors.email && (
              <div className="form-error">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Password {modalMode === 'create' ? '*' : '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              name="password"
              className={`form-control ${formErrors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleFormChange}
              placeholder={modalMode === 'create' ? 'Enter password' : 'Enter new password'}
              disabled={modalLoading}
            />
            {formErrors.password && (
              <div className="form-error">{formErrors.password}</div>
            )}
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
              {modalLoading ? 'Saving...' : modalMode === 'create' ? 'Add Teacher' : 'Update Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;