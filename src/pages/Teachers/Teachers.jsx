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
        console.log('👥 Teachers API response:', response.data);
        const teachersData = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        setTeachers(teachersData);
      } else {
        setError('Oʻqituvchilarni yuklashda xatolik yuz berdi');
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
      errors.full_name = 'Toʻliq ism kiritish majburiy';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email kiritish majburiy';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Toʻgʻri email manzilini kiriting';
    }
    
    if (modalMode === 'create' && !formData.password.trim()) {
      errors.password = 'Parol kiritish majburiy';
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Parol kamida 6 ta belgidan iborat boʻlishi kerak';
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
        setError(response.detail || `Oʻqituvchini ${modalMode === 'create' ? 'qoʻshishda' : 'yangilashda'} xatolik yuz berdi`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`${teacher.full_name}ni oʻchirishni xohlaysizmi?`)) {
      return;
    }

    try {
      const response = await usersService.teachers.delete(teacher.id);
      if (response.success) {
        loadTeachers(); // Reload the list
      } else {
        setError(response.detail || 'Oʻqituvchini oʻchirishda xatolik yuz berdi');
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
      title: 'Ism',
      render: (value) => value || 'Maʻlumot yoʻq'
    },
    {
      key: 'email',
      title: 'Email',
      render: (value) => value || 'Maʻlumot yoʻq'
    },
    {
      key: 'created_at',
      title: 'Yaratilgan sana',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      title: 'Amallar',
      width: '120px',
      render: (_, teacher) => (
        <div className="table-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(teacher)}
          >
            Tahrirlash
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(teacher)}
          >
            Oʻchirish
          </button>
        </div>
      )
    }
  ];


  return (
    <div className="teachers-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadTeachers()}>
            Qayta urinish
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h2>Oʻqituvchilar</h2>
          <p>Oʻquv markazingizdagi barcha oʻqituvchilarni boshqaring</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          Oʻqituvchi qoʻshish
        </button>
      </div>

      <div className="teachers-content">
        <Table 
          columns={columns}
          data={Array.isArray(teachers) ? teachers : []}
          loading={loading}
          emptyMessage="Oʻqituvchilar topilmadi. Birinchi oʻqituvchingizni qoʻshing."
        />
      </div>

      {/* Teacher Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Yangi oʻqituvchi qoʻshish' : 'Oʻqituvchini tahrirlash'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Toʻliq ism *</label>
            <input
              type="text"
              name="full_name"
              className={`form-control ${formErrors.full_name ? 'error' : ''}`}
              value={formData.full_name}
              onChange={handleFormChange}
              placeholder="Oʻqituvchining toʻliq ismini kiriting"
              disabled={modalLoading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {formErrors.full_name && (
              <div className="form-error">{formErrors.full_name}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email manzil *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${formErrors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleFormChange}
              placeholder="oqituvchi@example.com"
              disabled={modalLoading || modalMode === 'edit'}
              readOnly={modalMode === 'edit'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {formErrors.email && (
              <div className="form-error">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Parol {modalMode === 'create' ? '*' : '(hozirgi parolni saqlash uchun boʻsh qoldiring)'}
            </label>
            <input
              type="password"
              name="password"
              className={`form-control ${formErrors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleFormChange}
              placeholder={modalMode === 'create' ? 'Parolni kiriting' : 'Yangi parolni kiriting'}
              disabled={modalLoading}
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
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
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading}
            >
              {modalLoading ? 'Saqlanmoqda...' : modalMode === 'create' ? 'Oʻqituvchi qoʻshish' : 'Oʻqituvchini yangilash'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;