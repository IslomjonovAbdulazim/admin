import React, { useState, useEffect, useCallback } from 'react';
import { groupsService } from '../../services/groups';
import { usersService } from '../../services/users';
import { coursesService } from '../../services/courses';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import './Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    teacher_id: '',
    course_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGroups(),
        loadTeachers(),
        loadCourses()
      ]);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadGroups = async () => {
    try {
      const response = await groupsService.getAll();
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await usersService.teachers.getAll();
      if (response.success) {
        setTeachers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await coursesService.courses.getAll();
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', teacher_id: '', course_id: '' });
    setFormErrors({});
    setSelectedGroup(null);
    setShowModal(true);
  };

  const openEditModal = (group) => {
    setModalMode('edit');
    setFormData({
      name: group.name || '',
      teacher_id: group.teacher_id || '',
      course_id: group.course_id || ''
    });
    setFormErrors({});
    setSelectedGroup(group);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', teacher_id: '', course_id: '' });
    setFormErrors({});
    setSelectedGroup(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Group name is required';
    }
    
    if (!formData.teacher_id) {
      errors.teacher_id = 'Please select a teacher';
    }
    
    if (!formData.course_id) {
      errors.course_id = 'Please select a course';
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
        teacher_id: parseInt(formData.teacher_id),
        course_id: parseInt(formData.course_id)
      };
      
      if (modalMode === 'create') {
        response = await groupsService.create(submitData);
      } else {
        response = await groupsService.update(selectedGroup.id, submitData);
      }
      
      if (response.success) {
        closeModal();
        loadGroups(); // Reload the list
      } else {
        setError(response.detail || `Failed to ${modalMode} group`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (group) => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      return;
    }

    try {
      const response = await groupsService.delete(group.id);
      if (response.success) {
        loadGroups(); // Reload the list
      } else {
        setError(response.detail || 'Failed to delete group');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing/selecting
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.full_name : 'Unknown';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown';
  };

  const columns = [
    {
      key: 'name',
      title: 'Group Name',
      render: (value) => value || 'N/A'
    },
    {
      key: 'teacher_id',
      title: 'Teacher',
      render: (teacherId) => getTeacherName(teacherId)
    },
    {
      key: 'course_id',
      title: 'Course',
      render: (courseId) => getCourseName(courseId)
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
      render: (_, group) => (
        <div className="table-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(group)}
          >
            Edit
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(group)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading groups..." />;
  }

  return (
    <div className="groups-page">
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
          <h2>Groups</h2>
          <p>Manage learning groups and assign teachers and courses</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          Create Group
        </button>
      </div>

      <div className="groups-content">
        <Table 
          columns={columns}
          data={groups}
          loading={loading}
          emptyMessage="No groups found. Create your first group to get started."
        />
      </div>

      {/* Group Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Create New Group' : 'Edit Group'}
        size="medium"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Group Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${formErrors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter group name"
              disabled={modalLoading}
            />
            {formErrors.name && (
              <div className="form-error">{formErrors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Teacher *</label>
            <select
              name="teacher_id"
              className={`form-control ${formErrors.teacher_id ? 'error' : ''}`}
              value={formData.teacher_id}
              onChange={handleFormChange}
              disabled={modalLoading}
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </option>
              ))}
            </select>
            {formErrors.teacher_id && (
              <div className="form-error">{formErrors.teacher_id}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Course *</label>
            <select
              name="course_id"
              className={`form-control ${formErrors.course_id ? 'error' : ''}`}
              value={formData.course_id}
              onChange={handleFormChange}
              disabled={modalLoading}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {formErrors.course_id && (
              <div className="form-error">{formErrors.course_id}</div>
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
              {modalLoading ? 'Saving...' : modalMode === 'create' ? 'Create Group' : 'Update Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Groups;