import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesService } from '../../services/courses';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await coursesService.courses.getAll();
      
      if (response.success) {
        setCourses(response.data || []);
      } else {
        setError('Kurslarni yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ title: '', description: '' });
    setFormErrors({});
    setSelectedCourse(null);
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setModalMode('edit');
    setFormData({
      title: course.title || '',
      description: course.description || ''
    });
    setFormErrors({});
    setSelectedCourse(course);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ title: '', description: '' });
    setFormErrors({});
    setSelectedCourse(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Kurs nomi kiritish majburiy';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Kurs tavsifi kiritish majburiy';
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
        response = await coursesService.courses.create(formData);
      } else {
        response = await coursesService.courses.update(selectedCourse.id, formData);
      }
      
      if (response.success) {
        closeModal();
        loadCourses(); // Reload the list
      } else {
        setError(response.detail || `Kursni ${modalMode === 'create' ? 'qoʻshishda' : 'yangilashda'} xatolik yuz berdi`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`"${course.title}" kursini oʻchirishni xohlaysizmi? Bu barcha bogʻlangan modullar va darslarni ham oʻchiradi.`)) {
      return;
    }

    try {
      const response = await coursesService.courses.delete(course.id);
      if (response.success) {
        loadCourses(); // Reload the list
      } else {
        setError(response.detail || 'Kursni oʻchirishda xatolik yuz berdi');
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
      key: 'title',
      title: 'Kurs nomi',
      render: (value) => value || 'Maʻlumot yoʻq'
    },
    {
      key: 'description',
      title: 'Tavsif',
      render: (value) => (
        <div className="course-description">
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
      render: (_, course) => (
        <div className="table-actions">
          <Link
            to={`/courses/${course.id}/modules`}
            className="btn btn-sm btn-primary"
          >
            Modullar
          </Link>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(course)}
          >
            Tahrirlash
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(course)}
          >
            Oʻchirish
          </button>
        </div>
      )
    }
  ];


  return (
    <div className="courses-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadCourses()}>
            Qayta urinish
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h2>Kurslar</h2>
          <p>Oʻquv kurslaringiz va ularning tarkibiy tuzilishini boshqaring</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          Kurs qoʻshish
        </button>
      </div>

      <div className="courses-content">
        <Table 
          columns={columns}
          data={courses}
          loading={loading}
          emptyMessage="Kurslar topilmadi. Birinchi kursingizni yarating."
        />
      </div>

      {/* Course Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Yangi kurs qoʻshish' : 'Kursni tahrirlash'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kurs nomi *</label>
            <input
              type="text"
              name="title"
              className={`form-control ${formErrors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Kurs nomini kiriting"
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
              placeholder="Kurs tavsifini kiriting"
              rows="4"
              disabled={modalLoading}
            />
            {formErrors.description && (
              <div className="form-error">{formErrors.description}</div>
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
              {modalLoading ? 'Saqlanmoqda...' : modalMode === 'create' ? 'Kurs qoʻshish' : 'Kursni yangilash'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;