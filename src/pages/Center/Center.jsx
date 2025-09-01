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
        setError('Markaz maʻlumotlarini yuklashda xatolik yuz berdi');
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
        setSuccess('Markaz nomi muvaffaqiyatli yangilandi');
        setShowTitleModal(false);
        loadCenterInfo(); // Reload center info
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.detail || 'Markaz nomini yangilashda xatolik yuz berdi');
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
        setSuccess('Parol muvaffaqiyatli oʻzgartirildi');
        setShowPasswordModal(false);
        setPasswordForm('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Parolni oʻzgartirishda xatolik yuz berdi');
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
        setSuccess('Logo muvaffaqiyatli yangilandi');
        setShowLogoModal(false);
        setLogoFile(null);
        setLogoPreview(null);
        loadCenterInfo(); // Reload center info
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.detail || 'Logoni yangilashda xatolik yuz berdi');
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
      setError('Iltimos, toʻgʻri PNG rasm faylini tanlang');
      return;
    }

    if (file.size > 3 * 1024 * 1024) { // 3MB limit
      setError('Logo fayl hajmi 3MB dan kam boʻlishi kerak');
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
          setLogoWarning('Eng yaxshi natija uchun kvadrat rasm (teng kenglik va balandlik) ishlatish tavsiya etiladi');
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


  return (
    <div className="center-page">
      {error && (
        <div className="alert alert-error">
          {error}
          {!modalLoading && (
            <button className="btn btn-sm btn-secondary ml-10" onClick={clearMessages}>
              Yopish
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
          <h2>Markaz sozlamalari</h2>
          <p>Oʻquv markazi konfiguratsiyasi va sozlamalarini boshqaring</p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadCenterInfo()}>
          Yangilash
        </button>
      </div>

      {centerInfo && (
        <div className="center-content">
          {/* Center Information */}
          <div className="center-section">
            <div className="center-card">
              <div className="card-header">
                <h3>Markaz maʻlumotlari</h3>
              </div>
              
              <div className="center-info-grid">
                <div className="info-item">
                  <div className="info-label">Markaz nomi</div>
                  <div className="info-value">
                    <span>{centerInfo.title}</span>
                    <button 
                      className="btn btn-sm btn-secondary ml-10"
                      onClick={() => setShowTitleModal(true)}
                    >
                      Tahrirlash
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">Markaz ID</div>
                  <div className="info-value">{centerInfo.id}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Talabalar chegarasi</div>
                  <div className="info-value">{centerInfo.student_limit} talaba</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Holat</div>
                  <div className="info-value">
                    <span className={`status-badge ${centerInfo.is_active ? 'status-active' : 'status-inactive'}`}>
                      {centerInfo.is_active ? 'Faol' : 'Faol emas'}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">Yaratilgan sana</div>
                  <div className="info-value">{formatDate(centerInfo.created_at)}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Qolgan kunlar</div>
                  <div className="info-value">
                    <span className={centerInfo.days_remaining < 7 ? 'critical' : ''}>
                      {centerInfo.days_remaining} kun
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
                <h3>Markaz logotipi</h3>
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
                      <div className="no-logo-text">Logo yuklanmagan</div>
                    </div>
                  )}
                </div>
                
                <div className="logo-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowLogoModal(true)}
                  >
                    {centerInfo.logo ? 'Logoni oʻzgartirish' : 'Logo yuklash'}
                  </button>
                  <div className="logo-requirements">
                    <small>
                      Talablar: PNG format, maksimal 3MB, tavsiya etilgan oʻlcham: 200x200px
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
                <h3>Xavfsizlik sozlamalari</h3>
              </div>
              
              <div className="security-content">
                <div className="security-item">
                  <div className="security-info">
                    <div className="security-title">Admin paroli</div>
                    <div className="security-description">
                      Xavfsizlikni oshirish uchun admin hisob parolingizni oʻzgartiring
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Parolni oʻzgartirish
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="center-section">
            <div className="center-card">
              <div className="card-header">
                <h3>Tizim maʻlumotlari</h3>
              </div>
              
              <div className="system-info">
                <div className="system-item">
                  <span className="system-label">API versiyasi:</span>
                  <span className="system-value">v1.0</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Oxirgi sinxronizatsiya:</span>
                  <span className="system-value">{formatDate(new Date())}</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Server holati:</span>
                  <span className="system-value status-online">Onlayn</span>
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
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading || !titleForm.trim()}
            >
              {modalLoading ? 'Saqlanmoqda...' : 'Oʻzgarishlarni saqlash'}
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
        title="Parolni oʻzgartirish"
        size="medium"
      >
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Yangi parol *</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm}
              onChange={(e) => setPasswordForm(e.target.value)}
              placeholder="Yangi parolni kiriting"
              disabled={modalLoading}
              minLength="6"
              required
            />
            <small className="form-help">Parol kamida 6 ta belgidan iborat boʻlishi kerak</small>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowPasswordModal(false)}
              disabled={modalLoading}
            >
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading || passwordForm.length < 6}
            >
              {modalLoading ? 'Oʻzgartirilmoqda...' : 'Parolni oʻzgartirish'}
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
        title="Markaz logotipini yuklash"
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
            <label className="form-label">Logo rasmini tanlang *</label>
            <input
              type="file"
              className="form-control"
              accept=".png"
              onChange={handleLogoFileChange}
              disabled={modalLoading}
              required
            />
            <small className="form-help">Faqat PNG fayllarga ruxsat berilgan, maksimal hajm 3MB</small>
          </div>

          {logoPreview && (
            <div className="form-group">
              <label className="form-label">Oldindan koʻrish</label>
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
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={modalLoading || !logoFile}
            >
              {modalLoading ? 'Yuklanmoqda...' : 'Logoni yuklash'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Center;