import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesService } from '../../services/courses';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import './Lessons.css';

const Lessons = () => {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedLesson, setSelectedLesson] = useState(null);
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
      
      // Load lessons for the module
      const lessonsResponse = await coursesService.lessons.getByModule(moduleId);
      
      if (lessonsResponse.success) {
        setLessons(lessonsResponse.data || []);
      } else {
        setError('Darslarni yuklashda xatolik yuz berdi');
      }
      
      // Note: In a real app, you'd need to get module info via a separate endpoint
      // For now, we'll set basic module info
      setModuleInfo({ id: moduleId, title: `Modul ${moduleId}` });
      
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) {
      loadInitialData();
    }
  }, [moduleId, loadInitialData]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ 
      title: '', 
      description: '', 
      order_index: lessons.length + 1 
    });
    setFormErrors({});
    setSelectedLesson(null);
    setShowModal(true);
  };

  const openEditModal = (lesson) => {
    setModalMode('edit');
    setFormData({
      title: lesson.title || '',
      description: lesson.description || '',
      order_index: lesson.order_index || 1
    });
    setFormErrors({});
    setSelectedLesson(lesson);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ title: '', description: '', order_index: 1 });
    setFormErrors({});
    setSelectedLesson(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Dars nomi kiritish majburiy';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Dars tavsifi kiritish majburiy';
    }
    
    if (!formData.order_index || formData.order_index < 1) {
      errors.order_index = 'Tartib raqami musbat son boʻlishi kerak';
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
        response = await coursesService.lessons.create(moduleId, submitData);
      } else {
        response = await coursesService.lessons.update(selectedLesson.id, submitData);
      }
      
      if (response.success) {
        closeModal();
        loadInitialData(); // Reload the list
      } else {
        setError(response.detail || `Darsni ${modalMode === 'create' ? 'qoʻshishda' : 'yangilashda'} xatolik yuz berdi`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (lesson) => {
    if (!window.confirm(`"${lesson.title}" darsini oʻchirishni xohlaysizmi? Bu barcha bogʻlangan soʻzlarni ham oʻchiradi.`)) {
      return;
    }

    try {
      const response = await coursesService.lessons.delete(lesson.id);
      if (response.success) {
        loadInitialData(); // Reload the list
      } else {
        setError(response.detail || 'Darsni oʻchirishda xatolik yuz berdi');
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
      title: 'Tartib',
      width: '80px',
      render: (value) => (
        <span className="order-badge">{value || 'Maʻlumot yoʻq'}</span>
      )
    },
    {
      key: 'title',
      title: 'Dars nomi',
      render: (value) => value || 'Maʻlumot yoʻq'
    },
    {
      key: 'description',
      title: 'Tavsif',
      render: (value) => (
        <div className="lesson-description">
          {value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'Maʻlumot yoʻq'}
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Yaratilgan sana',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      title: 'Amallar',
      width: '200px',
      render: (_, lesson) => (
        <div className="table-actions">
          <Link
            to={`/lessons/${lesson.id}/words`}
            className="btn btn-sm btn-primary"
          >
            Soʻzlar
          </Link>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(lesson)}
          >
            Tahrirlash
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(lesson)}
          >
            Oʻchirish
          </button>
        </div>
      )
    }
  ];


  return (
    <div className="lessons-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadInitialData()}>
            Qayta urinish
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <Link to="/courses" className="breadcrumb-link">Kurslar</Link>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-link">Modullar</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-current">{moduleInfo?.title || 'Darslar'}</span>
          </div>
          <h2>Darslar</h2>
          <p>Ushbu modul uchun darslarni boshqaring</p>
        </div>
        <div className="page-header-actions">
          <Link to="/courses" className="btn btn-secondary mr-10">
            Kurslarga qaytish
          </Link>
          <button className="btn btn-primary" onClick={openCreateModal}>
            Dars qoʻshish
          </button>
        </div>
      </div>

      <div className="lessons-content">
        <Table 
          columns={columns}
          data={lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))}
          loading={loading}
          emptyMessage="Darslar topilmadi. Birinchi darsingizni qoʻshing."
        />
      </div>

      {/* Lesson Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Yangi dars qoʻshish' : 'Darsni tahrirlash'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Dars nomi *</label>
            <input
              type="text"
              name="title"
              className={`form-control ${formErrors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Dars nomini kiriting"
              disabled={modalLoading}
            />
            {formErrors.title && (
              <div className="form-error">{formErrors.title}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif *</label>
            <textarea
              name="description"
              className={`form-control ${formErrors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Dars tavsifini kiriting"
              rows="4"
              disabled={modalLoading}
            />
            {formErrors.description && (
              <div className="form-error">{formErrors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tartib raqami *</label>
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
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading}
            >
              {modalLoading ? 'Saqlanmoqda...' : modalMode === 'create' ? 'Dars qoʻshish' : 'Darsni yangilash'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Lessons;