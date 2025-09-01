import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analytics';
import Modal from '../Modal/Modal';
import './Header.css';

const Header = ({ title, onMenuToggle }) => {
  const { user, logout, changePassword } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [centerInfo, setCenterInfo] = useState(null);

  useEffect(() => {
    loadCenterInfo();
  }, []);

  const loadCenterInfo = async () => {
    try {
      const response = await analyticsService.center.getInfo();
      if (response.success) {
        setCenterInfo(response.data);
      }
    } catch (error) {
      console.log('Failed to load center info for header');
    }
  };
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await changePassword(newPassword);
      if (result.success) {
        setSuccess('Password changed successfully');
        setNewPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to change password');
    }
    setLoading(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className="header-title">{title}</h1>
        </div>

        <div className="header-right">
          <div className="user-menu">
            <button 
              className="user-menu-toggle"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {centerInfo?.logo ? (
                <img 
                  src={centerInfo.logo.startsWith('http') ? centerInfo.logo : `${process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || ''}${centerInfo.logo}`}
                  alt="Center Logo" 
                  className="user-logo"
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <span className="user-initial">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              )}
              <span className="user-name">{user?.full_name || 'Admin'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-info-name">{user?.full_name || 'Admin'}</div>
                  <div className="user-info-email">{user?.email}</div>
                </div>
                <div className="user-menu-divider"></div>
                <button 
                  className="user-menu-item"
                  onClick={() => {
                    setShowPasswordModal(true);
                    setShowUserMenu(false);
                  }}
                >
                  Change Password
                </button>
                <button 
                  className="user-menu-item logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="overlay"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setNewPassword('');
          setError('');
          setSuccess('');
        }}
        title="Change Password"
        size="small"
      >
        <form onSubmit={handlePasswordChange}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setError('');
                setSuccess('');
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !newPassword.trim()}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Header;