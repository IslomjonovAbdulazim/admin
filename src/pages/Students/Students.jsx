import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usersService } from '../../services/users';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage, isValidUzbekPhone } from '../../utils/helpers';
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
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const loadStudents = useCallback(async (page = pagination.page, size = pagination.size, search = searchQuery) => {
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
        setError('Talabalarni yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, searchQuery]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Debounced search
  const debounceRef = useRef();
  
  const debouncedSearchFunction = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadStudents(1, pagination.size, query);
    }, 500);
  }, [loadStudents, pagination.size]);

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearchFunction(searchQuery);
    } else {
      loadStudents(pagination.page, pagination.size, '');
    }
  }, [searchQuery, debouncedSearchFunction, loadStudents, pagination.page, pagination.size]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ full_name: '', phone: '' });
    setFormErrors({});
    setSelectedStudent(null);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setModalMode('edit');
    setFormData({
      full_name: student.full_name || '',
      phone: student.phone || ''
    });
    setFormErrors({});
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ full_name: '', phone: '' });
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
      title: 'Ism',
      render: (value) => value || 'Maʻlumot yoʻq'
    },
    {
      key: 'phone',
      title: 'Telefon',
      render: (value) => value || 'Maʻlumot yoʻq'
    },
    {
      key: 'is_active',
      title: 'Holat',
      render: (value) => (
        <span className={`status ${value ? 'status-active' : 'status-inactive'}`}>
          {value ? 'Faol' : 'Faol emas'}
        </span>
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
      width: '120px',
      render: (_, student) => (
        <div className="table-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(student)}
          >
            Tahrirlash
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(student)}
          >
            Oʻchirish
          </button>
        </div>
      )
    }
  ];


  return (
    <div className="students-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={() => loadStudents()}>
            Qayta urinish
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h2>Talabalar</h2>
          <p>Oʻquv markazingizdagi barcha talabalarni boshqaring</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          Talaba qoʻshish
        </button>
      </div>

      <div className="students-content">
        <div className="search-bar">
          <input
            type="text"
            className="form-control"
            placeholder="Talabalarni ism boʻyicha qidiring..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Table 
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage="Talabalar topilmadi"
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
        title={modalMode === 'create' ? 'Yangi talaba qoʻshish' : 'Talabani tahrirlash'}
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
              placeholder="Talabaning toʻliq ismini kiriting"
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
            <label className="form-label">Telefon raqami *</label>
            <input
              type="tel"
              name="phone"
              className={`form-control ${formErrors.phone ? 'error' : ''}`}
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="+998901234567"
              disabled={modalLoading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {formErrors.phone && (
              <div className="form-error">{formErrors.phone}</div>
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
              {modalLoading ? 'Saqlanmoqda...' : modalMode === 'create' ? 'Talaba qoʻshish' : 'Talabani yangilash'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;