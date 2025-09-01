import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { analyticsService } from '../../services/analytics';
import { ROUTES } from '../../utils/constants';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
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
      console.log('Failed to load center info for sidebar');
    }
  };

  const menuItems = [
    {
      path: ROUTES.DASHBOARD,
      label: 'Boshqaruv paneli',
      icon: '📊'
    },
    {
      path: ROUTES.STUDENTS,
      label: 'Talabalar',
      icon: '👥'
    },
    {
      path: ROUTES.TEACHERS,
      label: 'Oʻqituvchilar',
      icon: '👨‍🏫'
    },
    {
      path: ROUTES.GROUPS,
      label: 'Guruhlar',
      icon: '👥'
    },
    {
      path: ROUTES.COURSES,
      label: 'Kurslar',
      icon: '📚'
    },
    {
      path: ROUTES.ANALYTICS,
      label: 'Tahlillar',
      icon: '📈'
    },
    {
      path: ROUTES.PAYMENTS,
      label: 'Toʻlovlar',
      icon: '💳'
    },
    {
      path: ROUTES.CENTER,
      label: 'Markaz sozlamalari',
      icon: '⚙️'
    }
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>{centerInfo?.title || 'EduTi Admin paneli'}</h2>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}
    </>
  );
};

export default Sidebar;