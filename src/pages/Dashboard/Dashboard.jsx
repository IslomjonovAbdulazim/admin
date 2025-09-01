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
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="alert alert-error">
          {error}
          <button className="btn btn-primary mt-10" onClick={loadDashboardData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_students, center } = dashboardData || {};

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to {center?.title || 'EduTi Admin'}</h1>
        <p>Here's what's happening with your learning center today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_students || 0}</div>
            <div className="stat-label">Total Students</div>
            <Link to={ROUTES.STUDENTS} className="stat-link">
              View all →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_teachers || 0}</div>
            <div className="stat-label">Total Teachers</div>
            <Link to={ROUTES.TEACHERS} className="stat-link">
              View all →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_groups || 0}</div>
            <div className="stat-label">Total Groups</div>
            <Link to={ROUTES.GROUPS} className="stat-link">
              View all →
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{stats?.total_courses || 0}</div>
            <div className="stat-label">Total Courses</div>
            <Link to={ROUTES.COURSES} className="stat-link">
              View all →
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Center Info */}
        <div className="dashboard-section">
          <div className="card">
            <h3>Center Information</h3>
            <div className="center-info">
              <div className="center-detail">
                <span className="center-label">Center Name:</span>
                <span className="center-value">{center?.title || 'N/A'}</span>
              </div>
              <div className="center-detail">
                <span className="center-label">Student Limit:</span>
                <span className="center-value">
                  {stats?.total_students || 0} / {center?.student_limit || 0}
                </span>
              </div>
              <div className="center-detail">
                <span className="center-label">Days Remaining:</span>
                <span className={`center-value ${(center?.days_remaining || 0) < 7 ? 'warning' : ''}`}>
                  {center?.days_remaining || 0} days
                </span>
              </div>
            </div>
            <Link to={ROUTES.CENTER} className="btn btn-primary mt-20">
              Manage Center
            </Link>
          </div>
        </div>

        {/* Recent Students */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h3>Recent Students</h3>
              <Link to={ROUTES.STUDENTS} className="btn btn-sm btn-secondary">
                View All
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
                        Joined {formatDate(student.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent students found</p>
                <Link to={ROUTES.STUDENTS} className="btn btn-primary">
                  Add Student
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to={ROUTES.STUDENTS} className="action-btn">
              <span className="action-icon">👥</span>
              <span>Add Student</span>
            </Link>
            <Link to={ROUTES.TEACHERS} className="action-btn">
              <span className="action-icon">👨‍🏫</span>
              <span>Add Teacher</span>
            </Link>
            <Link to={ROUTES.GROUPS} className="action-btn">
              <span className="action-icon">👥</span>
              <span>Create Group</span>
            </Link>
            <Link to={ROUTES.COURSES} className="action-btn">
              <span className="action-icon">📚</span>
              <span>Add Course</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;