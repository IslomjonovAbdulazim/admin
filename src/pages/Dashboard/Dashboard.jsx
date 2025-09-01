import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analytics';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await analyticsService.getDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Boshqaruv paneli maʻlumotlarini yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      setError('Boshqaruv paneli maʻlumotlarini yuklashda xatolik yuz berdi');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };


  if (error) {
    return (
      <div className="dashboard-error">
        <div className="alert alert-error">
          {error}
          <button className="btn btn-primary mt-10" onClick={loadDashboardData}>
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_students, center } = dashboardData || {};

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{center?.title || 'EduTi Admin paneli'}ga xush kelibsiz</h1>
        <p>Bugun oʻquv markazingizda sodir boʻlyotgan voqealar.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_students || 0}</div>
            <div className="stat-label">Jami talabalar</div>
            <Link to={ROUTES.STUDENTS} className="stat-link">
              Barchasini koʻrish →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_teachers || 0}</div>
            <div className="stat-label">Jami oʻqituvchilar</div>
            <Link to={ROUTES.TEACHERS} className="stat-link">
              Barchasini koʻrish →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_groups || 0}</div>
            <div className="stat-label">Jami guruhlar</div>
            <Link to={ROUTES.GROUPS} className="stat-link">
              Barchasini koʻrish →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_courses || 0}</div>
            <div className="stat-label">Jami kurslar</div>
            <Link to={ROUTES.COURSES} className="stat-link">
              Barchasini koʻrish →
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Center Info */}
        <div className="dashboard-section">
          <div className="card">
            <h3>Markaz maʻlumotlari</h3>
            <div className="center-info">
              <div className="center-detail">
                <span className="center-label">Markaz nomi:</span>
                <span className="center-value">{center?.title || 'Maʻlumot yoʻq'}</span>
              </div>
              <div className="center-detail">
                <span className="center-label">Talabalar chegarasi:</span>
                <span className="center-value">
                  {stats?.total_students || 0} / {center?.student_limit || 0}
                </span>
              </div>
              <div className="center-detail">
                <span className="center-label">Qolgan kunlar:</span>
                <span className={`center-value ${(center?.days_remaining || 0) < 7 ? 'warning' : ''}`}>
                  {center?.days_remaining || 0} kun
                </span>
              </div>
            </div>
            <Link to={ROUTES.CENTER} className="btn btn-primary mt-20">
              Markazni boshqarish
            </Link>
          </div>
        </div>

        {/* Recent Students */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h3>Soʻnggi talabalar</h3>
              <Link to={ROUTES.STUDENTS} className="btn btn-sm btn-secondary">
                Barchasini koʻrish
              </Link>
            </div>
            
            {recent_students && recent_students.length > 0 ? (
              <div className="recent-students">
                {recent_students.map((student) => (
                  <div key={student.id} className="student-item">
                    <div className="student-avatar">
                      {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div className="student-info">
                      <div className="student-name">{student.full_name}</div>
                      <div className="student-date">
                        Qoʻshilgan: {formatDate(student.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Soʻnggi talabalar topilmadi</p>
                <Link to={ROUTES.STUDENTS} className="btn btn-primary">
                  Talaba qoʻshish
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="card">
          <h3>Tezkor amallar</h3>
          <div className="actions-grid">
            <Link to={ROUTES.STUDENTS} className="action-btn">
              <span className="action-icon">👥</span>
              <span>Talaba qoʻshish</span>
            </Link>
            <Link to={ROUTES.TEACHERS} className="action-btn">
              <span className="action-icon">👨‍🏫</span>
              <span>Oʻqituvchi qoʻshish</span>
            </Link>
            <Link to={ROUTES.GROUPS} className="action-btn">
              <span className="action-icon">👥</span>
              <span>Guruh yaratish</span>
            </Link>
            <Link to={ROUTES.COURSES} className="action-btn">
              <span className="action-icon">📚</span>
              <span>Kurs qoʻshish</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;