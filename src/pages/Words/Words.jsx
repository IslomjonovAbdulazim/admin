import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesService } from '../../services/courses';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getErrorMessage, isValidImage, isValidAudio, formatFileSize } from '../../utils/helpers';
import './Words.css';

const Words = () => {
  const { lessonId } = useParams();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedWord, setSelectedWord] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    definition: '',
    example_sentence: '',
    order_index: 1
  });
  const [formErrors, setFormErrors] = useState({});
  
  // File upload states
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  
  // Media preview states
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');


  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load words for the lesson
      const wordsResponse = await coursesService.words.getByLesson(lessonId);
      
      if (wordsResponse.success) {
        setWords(wordsResponse.data || []);
      } else {
        setError('Failed to load words');
      }
      
      
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) {
      loadInitialData();
    }
  }, [lessonId, loadInitialData]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ 
      word: '', 
      meaning: '', 
      definition: '', 
      example_sentence: '',
      order_index: words.length + 1 
    });
    setFormErrors({});
    setSelectedWord(null);
    setImageFile(null);
    setAudioFile(null);
    setShowModal(true);
  };

  const openEditModal = (word) => {
    setModalMode('edit');
    setFormData({
      word: word.word || '',
      meaning: word.meaning || '',
      definition: word.definition || '',
      example_sentence: word.example_sentence || '',
      order_index: word.order_index || 1
    });
    setFormErrors({});
    setSelectedWord(word);
    setImageFile(null);
    setAudioFile(null);
    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
    setFormData({ word: '', meaning: '', definition: '', example_sentence: '', order_index: 1 });
    setFormErrors({});
    setSelectedWord(null);
    setImageFile(null);
    setAudioFile(null);
  };


  const validateForm = () => {
    const errors = {};
    
    if (!formData.word.trim()) {
      errors.word = 'Word is required';
    }
    
    if (!formData.meaning.trim()) {
      errors.meaning = 'Meaning is required';
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
        response = await coursesService.words.create(lessonId, submitData);
      } else {
        response = await coursesService.words.update(selectedWord.id, submitData);
      }
      
      if (response.success) {
        const wordId = response.data?.word_id || selectedWord?.id;
        
        // Upload files if provided
        if (wordId) {
          if (imageFile) {
            await uploadImage(wordId, imageFile);
          }
          if (audioFile) {
            await uploadAudio(wordId, audioFile);
          }
        }
        
        closeModal();
        loadInitialData(); // Reload the list
      } else {
        setError(response.detail || `Failed to ${modalMode} word`);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const openImagePreview = (imageUrl) => {
    // Remove /api from the base URL for media files
    const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || '';
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
    setPreviewImageUrl(fullImageUrl);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImageUrl('');
  };

  const playAudio = (audioUrl) => {
    // Remove /api from the base URL for media files
    const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || '';
    const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${baseUrl}${audioUrl}`;
    const audio = new Audio(fullAudioUrl);
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
      alert('Failed to play audio');
    });
  };

  const uploadImage = async (wordId, file) => {
    try {
      await coursesService.words.uploadImage(wordId, file);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const uploadAudio = async (wordId, file) => {
    try {
      await coursesService.words.uploadAudio(wordId, file);
    } catch (error) {
      console.error('Failed to upload audio:', error);
    }
  };

  const handleDelete = async (word) => {
    if (!window.confirm(`Are you sure you want to delete the word "${word.word}"?`)) {
      return;
    }

    try {
      const response = await coursesService.words.delete(word.id);
      if (response.success) {
        loadInitialData(); // Reload the list
      } else {
        setError(response.detail || 'Failed to delete word');
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image') {
      if (!isValidImage(file)) {
        setError('Please select a valid image file (PNG, JPG, JPEG)');
        return;
      }
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        setError('Image file size must be less than 1MB');
        return;
      }
      setImageFile(file);
    } else if (type === 'audio') {
      if (!isValidAudio(file)) {
        setError('Please select a valid audio file (MP3, WAV)');
        return;
      }
      
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        setError('Audio file size must be less than 1MB');
        return;
      }
      
      // Check audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration > 7) {
          setError('Audio duration must be 7 seconds or less');
          URL.revokeObjectURL(audio.src);
          return;
        }
        setAudioFile(file);
        URL.revokeObjectURL(audio.src);
      });
      
      audio.addEventListener('error', () => {
        setError('Failed to load audio file');
        URL.revokeObjectURL(audio.src);
      });
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
      key: 'word',
      title: 'Word',
      render: (value) => (
        <span className="word-text">{value || 'N/A'}</span>
      )
    },
    {
      key: 'meaning',
      title: 'Meaning',
      render: (value) => value || 'N/A'
    },
    {
      key: 'definition',
      title: 'Definition',
      render: (value) => (
        <div className="word-definition">
          {value ? (value.length > 80 ? `${value.substring(0, 80)}...` : value) : 'N/A'}
        </div>
      )
    },
    {
      key: 'media',
      title: 'Media',
      width: '100px',
      render: (_, word) => (
        <div className="media-indicators">
          {word.image_url ? (
            <button 
              className="btn btn-sm btn-info mr-5" 
              onClick={() => openImagePreview(word.image_url)}
              title="View image"
              style={{ fontSize: '16px', padding: '8px 12px' }}
            >
              🖼️
            </button>
          ) : null}
          {word.audio_url ? (
            <button 
              className="btn btn-sm btn-success" 
              onClick={() => playAudio(word.audio_url)}
              title="Play audio"
              style={{ fontSize: '16px', padding: '8px 12px' }}
            >
              ▶️
            </button>
          ) : (
            <span className="no-audio" title="No audio" style={{ fontSize: '16px', opacity: '0.5' }}>🔇</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      render: (_, word) => (
        <div className="table-actions">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => openEditModal(word)}
          >
            Edit
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(word)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading words..." />;
  }

  return (
    <div className="words-page">
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
            <span className="breadcrumb-link">Modules</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-link">Lessons</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-current">Words</span>
          </div>
          <h2>Words & Vocabulary</h2>
          <p>Manage vocabulary for this lesson</p>
        </div>
        <div className="page-header-actions">
          <Link to="/courses" className="btn btn-secondary mr-10">
            Back to Courses
          </Link>
          <button className="btn btn-primary" onClick={openCreateModal}>
            Add Word
          </button>
        </div>
      </div>

      <div className="words-content">
        <Table 
          columns={columns}
          data={words.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))}
          loading={loading}
          emptyMessage="No words found. Add your first word to get started."
        />
      </div>

      {/* Word Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Add New Word' : 'Edit Word'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Word *</label>
              <input
                type="text"
                name="word"
                className={`form-control ${formErrors.word ? 'error' : ''}`}
                value={formData.word}
                onChange={handleFormChange}
                placeholder="Enter word"
                disabled={modalLoading}
              />
              {formErrors.word && (
                <div className="form-error">{formErrors.word}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Meaning *</label>
              <input
                type="text"
                name="meaning"
                className={`form-control ${formErrors.meaning ? 'error' : ''}`}
                value={formData.meaning}
                onChange={handleFormChange}
                placeholder="Enter meaning in Uzbek"
                disabled={modalLoading}
              />
              {formErrors.meaning && (
                <div className="form-error">{formErrors.meaning}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Definition</label>
            <input
              type="text"
              name="definition"
              className="form-control"
              value={formData.definition}
              onChange={handleFormChange}
              placeholder="Enter English definition"
              disabled={modalLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Example Sentence</label>
            <textarea
              name="example_sentence"
              className="form-control"
              value={formData.example_sentence}
              onChange={handleFormChange}
              placeholder="Enter example sentence"
              rows="3"
              disabled={modalLoading}
            />
          </div>

          <div className="form-row">
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Image Upload</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                disabled={modalLoading}
              />
              {imageFile && (
                <div className="file-info">
                  Selected: {imageFile.name} ({formatFileSize(imageFile.size)})
                </div>
              )}
              {selectedWord?.image_url && (
                <div className="current-file">
                  Current: Has image
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Audio Upload</label>
              <input
                type="file"
                className="form-control"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audio')}
                disabled={modalLoading}
              />
              {audioFile && (
                <div className="file-info">
                  Selected: {audioFile.name} ({formatFileSize(audioFile.size)})
                </div>
              )}
              {selectedWord?.audio_url && (
                <div className="current-file">
                  Current: Has audio
                </div>
              )}
            </div>
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
              {modalLoading ? 'Saving...' : modalMode === 'create' ? 'Add Word' : 'Update Word'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={showImagePreview}
        onClose={closeImagePreview}
        title="Image Preview"
        size="large"
      >
        <div className="image-preview-container">
          <img 
            src={previewImageUrl} 
            alt="Word illustration" 
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </Modal>

    </div>
  );
};

export default Words;