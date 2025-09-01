import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesService } from '../../services/courses';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import './Modules.css';

const Modules = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedModule, setSelectedModule] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_index: 1
  });
  const [formErrors, setFormErrors] = useState({});

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load course info and modules
      const [coursesResponse, modulesResponse] = await Promise.all([
        coursesService.courses.getAll(),
        coursesService.modules.getByCourse(courseId)
      ]);
      
      // Find the specific course
      if (coursesResponse.success) {
        const course = coursesResponse.data?.find(c => c.id === parseInt(courseId));
        setCourseInfo(course);
      }
      
      if (modulesResponse.success) {
        setModules(modulesResponse.data || []);
      } else {
        setError('Failed to load modules');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadInitialData();
    }
  }, [courseId, loadInitialData]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ 
      title: '', 
      description: '', 
      order_index: modules.length + 1 
    });
    setFormErrors({});
    setSelectedModule(null);
    setShowModal(true);
  };

  const openEditModal = (module) => {
    setModalMode('edit');
    setFormData({
      title: module.title || '',
      description: module.description || '',
      order_index: module.order_index || 1
    });
    setFormErrors({});
    setSelectedModule(module);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ title: '', description: '', order_index: 1 });
    setFormErrors({});
    setSelectedModule(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Module title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Module description is required';
    }
    
    if (!formData.order_index || formData.order_index < 1) {
      errors.order_index = 'Order index must be a positive number';
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
      const submitData = {
        ...formData,
        order_index: parseInt(formData.order_index)
      };
      
      if (modalMode === 'create') {
        response = await coursesService.modules.create(courseId, submitData);
      } else {
        response = await coursesService.modules.update(selectedModule.id, submitData);
      }
      
      if (response.success) {
        closeModal();
        loadInitialData(); // Reload the list
      } else {
        setError(response.detail || `Failed to ${modalMode} module`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (module) => {
    if (!window.confirm(`Are you sure you want to delete "${module.title}"? This will also delete all associated lessons.`)) {
      return;
    }

    try {
      const response = await coursesService.modules.delete(module.id);
      if (response.success) {
        loadInitialData(); // Reload the list
      } else {
        setError(response.detail || 'Failed to delete module');
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
      key: 'order_index',
      title: 'Order',
      width: '80px',
      render: (value) => (
        <span className="order-badge">{value || 'N/A'}</span>
      )
    },
    {
      key: 'title',
      title: 'Module Title',
      render: (value) => value || 'N/A'
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="module-description">
          {value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'N/A'}
        </div>
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
      width: '200px',
      render: (_, module) => (
        <div className="table-actions">
          <Link
            to={`/modules/${module.id}/lessons`}
            className="btn btn-sm btn-primary"
          >
            Lessons
          </Link>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(module)}
          >
            Edit
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(module)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading modules..." />;
  }

  return (
    <div className="modules-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadInitialData()}>
            Retry
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <Link to="/courses" className="breadcrumb-link">Courses</Link>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-current">{courseInfo?.title || 'Modules'}</span>
          </div>
          <h2>Modules</h2>
          <p>Manage modules for this course</p>
        </div>
        <div className="page-header-actions">
          <Link to="/courses" className="btn btn-secondary mr-10">
            Back to Courses
          </Link>
          <button className="btn btn-primary" onClick={openCreateModal}>
            Add Module
          </button>
        </div>
      </div>

      <div className="modules-content">
        <Table 
          columns={columns}
          data={modules.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))}
          loading={loading}
          emptyMessage="No modules found. Add your first module to get started."
        />
      </div>

      {/* Module Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Add New Module' : 'Edit Module'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Module Title *</label>
            <input
              type="text"
              name="title"
              className={`form-control ${formErrors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter module title"
              disabled={modalLoading}
            />
            {formErrors.title && (
              <div className="form-error">{formErrors.title}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className={`form-control ${formErrors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter module description"
              rows="4"
              disabled={modalLoading}
            />
            {formErrors.description && (
              <div className="form-error">{formErrors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Order Index *</label>
            <input
              type="number"
              name="order_index"
              className={`form-control ${formErrors.order_index ? 'error' : ''}`}
              value={formData.order_index}
              onChange={handleFormChange}
              placeholder="1"
              min="1"
              disabled={modalLoading}
            />
            {formErrors.order_index && (
              <div className="form-error">{formErrors.order_index}</div>
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
              {modalLoading ? 'Saving...' : modalMode === 'create' ? 'Add Module' : 'Update Module'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Modules;