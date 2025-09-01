import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await analyticsService.getOverview();
      
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        setError('Tahlil maʻlumotlarini yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };


  if (error) {
    return (
      <div className="analytics-error">
        <div className="alert alert-error">
          {error}
          <button className="btn btn-primary mt-10" onClick={loadAnalyticsData}>
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  const {
    total_lessons = 0,
    completed_lessons = 0,
    completion_rate = 0,
    top_students = []
  } = analyticsData || {};

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Tahlillar va hisobotlar</h2>
          <p>Batafsil oʻquv tahlillari va talabalar samaradorligi koʻrsatkichlarini koʻring</p>
        </div>
        <button className="btn btn-secondary" onClick={loadAnalyticsData}>
          Maʻlumotlarni yangilash
        </button>
      </div>

      {/* Overview Cards */}
      <div className="analytics-overview">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Oʻquv jarayoni</h3>
          </div>
          <div className="progress-stats">
            <div className="progress-item">
              <div className="progress-number">{total_lessons}</div>
              <div className="progress-label">Jami darslar</div>
            </div>
            <div className="progress-item">
              <div className="progress-number">{completed_lessons}</div>
              <div className="progress-label">Tugallangan</div>
            </div>
            <div className="progress-item">
              <div className="progress-number">{completion_rate.toFixed(1)}%</div>
              <div className="progress-label">Tugallanish foizi</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar-label">
              Umumiy jarayon: {total_lessons} darsdan {completed_lessons} tasi tugallangan
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${completion_rate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Students */}
      <div className="analytics-section">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Eng yaxshi talabalar</h3>
            <span className="card-subtitle">Eng koʻp coin toʻplagan talabalar</span>
          </div>
          
          {top_students && top_students.length > 0 ? (
            <div className="top-students">
              {top_students.map((student, index) => (
                <div key={student.profile_id} className="student-card">
                  <div className="student-rank">#{index + 1}</div>
                  <div className="student-avatar">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.full_name} />
                    ) : (
                      <span className="avatar-initial">
                        {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    )}
                  </div>
                  <div className="student-info">
                    <div className="student-name">{student.full_name}</div>
                    <div className="student-coins">
                      <span className="coins-icon">🪙</span>
                      {student.total_coins} coin
                    </div>
                  </div>
                  <div className="student-medal">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Hozircha talabalar samaradorligi haqida maʻlumot yoʻq</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Oʻquv faolligi</h3>
          </div>
          <div className="activity-stats">
            <div className="activity-item">
              <div className="activity-icon">📚</div>
              <div className="activity-content">
                <div className="activity-number">{total_lessons}</div>
                <div className="activity-label">Mavjud darslar soni</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <div className="activity-number">{completed_lessons}</div>
                <div className="activity-label">Tugallangan darslar</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📈</div>
              <div className="activity-content">
                <div className="activity-number">{completion_rate.toFixed(1)}%</div>
                <div className="activity-label">Muvaffaqiyat darajasi</div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Faollik koʻrsatkichlari</h3>
          </div>
          <div className="engagement-content">
            <div className="engagement-item">
              <div className="engagement-label">Faol talabalar</div>
              <div className="engagement-value">{top_students.length}</div>
            </div>
            <div className="engagement-item">
              <div className="engagement-label">Oʻrtacha natija</div>
              <div className="engagement-value">
                {top_students.length > 0 
                  ? Math.round(top_students.reduce((sum, s) => sum + s.total_coins, 0) / top_students.length)
                  : 0
                } coin
              </div>
            </div>
            <div className="engagement-item">
              <div className="engagement-label">Oxirgi yangilash</div>
              <div className="engagement-value">{formatDate(new Date())}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="analytics-section">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Tezkor amallar</h3>
          </div>
          <div className="quick-actions-grid">
            <div className="action-item">
              <button className="action-btn" onClick={loadAnalyticsData}>
                <span className="action-icon">🔄</span>
                <span className="action-text">Tahlillarni yangilash</span>
              </button>
            </div>
            <div className="action-item">
              <button className="action-btn" onClick={() => window.print()}>
                <span className="action-icon">🖨️</span>
                <span className="action-text">Hisobotni chop etish</span>
              </button>
            </div>
            <div className="action-item">
              <button className="action-btn disabled" title="Tez orada">
                <span className="action-icon">📊</span>
                <span className="action-text">Maʻlumotlarni eksport qilish</span>
              </button>
            </div>
            <div className="action-item">
              <button className="action-btn disabled" title="Tez orada">
                <span className="action-icon">📈</span>
                <span className="action-text">Kengaytirilgan hisobotlar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;