import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage, isValidImage, formatFileSize } from '../../utils/helpers';
import './Center.css';

const Center = () => {
  const { changePassword } = useAuth();
  const [centerInfo, setCenterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [titleForm, setTitleForm] = useState('');
  const [passwordForm, setPasswordForm] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoWarning, setLogoWarning] = useState('');

  useEffect(() => {
    loadCenterInfo();
  }, []);

  const loadCenterInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await analyticsService.center.getInfo();
      
      if (response.success) {
        setCenterInfo(response.data);
        setTitleForm(response.data.title || '');
      } else {
        setError('Failed to load center information');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    
    if (!titleForm.trim()) return;

    setModalLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await analyticsService.center.update({
        title: titleForm.trim()
      });
      
      if (response.success) {
        setSuccess('Center name updated successfully');
        setShowTitleModal(false);
        loadCenterInfo(); // Reload center info
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.detail || 'Failed to update center name');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.trim()) return;

    setModalLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await changePassword(passwordForm);
      
      if (result.success) {
        setSuccess('Password changed successfully');
        setShowPasswordModal(false);
        setPasswordForm('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to change password');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLogoSubmit = async (e) => {
    e.preventDefault();
    
    if (!logoFile) return;

    setModalLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await analyticsService.center.uploadLogo(logoFile);
      
      if (response.success) {
        setSuccess('Logo updated successfully');
        setShowLogoModal(false);
        setLogoFile(null);
        setLogoPreview(null);
        loadCenterInfo(); // Reload center info
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.detail || 'Failed to update logo');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isValidImage(file)) {
      setError('Please select a valid PNG image file');
      return;
    }

    if (file.size > 3 * 1024 * 1024) { // 3MB limit
      setError('Logo file size must be less than 3MB');
      return;
    }

    setLogoFile(file);
    setError('');
    setLogoWarning('');
    
    // Create preview and check dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
      
      // Check if image is square
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          setLogoWarning('For best results, use a square image (equal width and height)');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <LoadingSpinner message="Loading center settings..." />;
  }

  return (
    <div className="center-page">
      {error && (
        <div className="alert alert-error">
          {error}
          {!modalLoading && (
            <button className="btn btn-sm btn-secondary ml-10" onClick={clearMessages}>
              Dismiss
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h2>Center Settings</h2>
          <p>Manage your learning center configuration and preferences</p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadCenterInfo()}>
          Refresh
        </button>
      </div>

      {centerInfo && (
        <div className="center-content">
          {/* Center Information */}
          <div className="center-section">
            <div className="center-card">
              <div className="card-header">
                <h3>Center Information</h3>
              </div>
              
              <div className="center-info-grid">
                <div className="info-item">
                  <div className="info-label">Center Name</div>
                  <div className="info-value">
                    <span>{centerInfo.title}</span>
                    <button 
                      className="btn btn-sm btn-secondary ml-10"
                      onClick={() => setShowTitleModal(true)}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">Center ID</div>
                  <div className="info-value">{centerInfo.id}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Student Limit</div>
                  <div className="info-value">{centerInfo.student_limit} students</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Status</div>
                  <div className="info-value">
                    <span className={`status-badge ${centerInfo.is_active ? 'status-active' : 'status-inactive'}`}>
                      {centerInfo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">Created Date</div>
                  <div className="info-value">{formatDate(centerInfo.created_at)}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Days Remaining</div>
                  <div className="info-value">
                    <span className={centerInfo.days_remaining < 7 ? 'critical' : ''}>
                      {centerInfo.days_remaining} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Management */}
          <div className="center-section">
            <div className="center-card">
              <div className="card-header">
                <h3>Center Logo</h3>
              </div>
              
              <div className="logo-content">
                <div className="logo-preview">
                  {centerInfo.logo ? (
                    <img 
                      src={centerInfo.logo.startsWith('http') ? centerInfo.logo : `${process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || ''}${centerInfo.logo}`} 
                      alt="Center Logo" 
                      className="current-logo"
                    />
                  ) : (
                    <div className="no-logo">
                      <div className="no-logo-icon">🏢</div>
                      <div className="no-logo-text">No logo uploaded</div>
                    </div>
                  )}
                </div>
                
                <div className="logo-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowLogoModal(true)}
                  >
                    {centerInfo.logo ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  <div className="logo-requirements">
                    <small>
                      Requirements: PNG format, max 3MB, recommended size: 200x200px
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="center-section">
            <div className="center-card">
              <div className="card-header">
                <h3>Security Settings</h3>
              </div>
              
              <div className="security-content">
                <div className="security-item">
                  <div className="security-info">
                    <div className="security-title">Admin Password</div>
                    <div className="security-description">
                      Change your admin account password for enhanced security
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="center-section">
            <div className="center-card">
              <div className="card-header">
                <h3>System Information</h3>
              </div>
              
              <div className="system-info">
                <div className="system-item">
                  <span className="system-label">API Version:</span>
                  <span className="system-value">v1.0</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Last Sync:</span>
                  <span className="system-value">{formatDate(new Date())}</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Server Status:</span>
                  <span className="system-value status-online">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      <Modal
        isOpen={showTitleModal}
        onClose={() => {
          setShowTitleModal(false);
          setTitleForm(centerInfo?.title || '');
        }}
        title="Edit Center Name"
        size="medium"
      >
        <form onSubmit={handleTitleSubmit}>
          <div className="form-group">
            <label className="form-label">Center Name *</label>
            <input
              type="text"
              className="form-control"
              value={titleForm}
              onChange={(e) => setTitleForm(e.target.value)}
              placeholder="Enter center name"
              disabled={modalLoading}
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowTitleModal(false)}
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading || !titleForm.trim()}
            >
              {modalLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm('');
        }}
        title="Change Password"
        size="medium"
      >
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label">New Password *</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm}
              onChange={(e) => setPasswordForm(e.target.value)}
              placeholder="Enter new password"
              disabled={modalLoading}
              minLength="6"
              required
            />
            <small className="form-help">Password must be at least 6 characters long</small>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowPasswordModal(false)}
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading || passwordForm.length < 6}
            >
              {modalLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Logo Modal */}
      <Modal
        isOpen={showLogoModal}
        onClose={() => {
          setShowLogoModal(false);
          setLogoFile(null);
          setLogoPreview(null);
        }}
        title="Upload Center Logo"
        size="medium"
      >
        <form onSubmit={handleLogoSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          {logoWarning && (
            <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
              ⚠️ {logoWarning}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Select Logo Image *</label>
            <input
              type="file"
              className="form-control"
              accept=".png"
              onChange={handleLogoFileChange}
              disabled={modalLoading}
              required
            />
            <small className="form-help">Only PNG files are allowed, max size 3MB</small>
          </div>

          {logoPreview && (
            <div className="form-group">
              <label className="form-label">Preview</label>
              <div className="logo-preview-modal">
                <img src={logoPreview} alt="Logo Preview" />
              </div>
              {logoFile && (
                <div className="file-info">
                  {logoFile.name} ({formatFileSize(logoFile.size)})
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowLogoModal(false)}
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading || !logoFile}
            >
              {modalLoading ? 'Uploading...' : 'Upload Logo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Center;