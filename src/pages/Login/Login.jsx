import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { ROUTES } from '../../utils/constants';
import './Login.css';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (loading) {
    return <LoadingSpinner message="Yuklanmoqda..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Iltimos, barcha maydonlarni toʻldiring');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.error);
      }
      // If successful, the AuthContext will handle the redirect
    } catch (error) {
      setError('Kirishda xatolik yuz berdi. Qayta urinib koʻring.');
    }
    
    setFormLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">EduTi Admin</h1>
            <p className="login-subtitle">Admin hisobingizga kiring</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email manzil
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="Email manzilingizni kiriting"
                value={formData.email}
                onChange={handleChange}
                disabled={formLoading}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Parol
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Parolingizni kiriting"
                value={formData.password}
                onChange={handleChange}
                disabled={formLoading}
                autoComplete="current-password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-100"
              disabled={formLoading || !formData.email.trim() || !formData.password.trim()}
            >
              {formLoading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-info">
              EduTi Oʻquv Markazi Admin Paneliga xush kelibsiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;