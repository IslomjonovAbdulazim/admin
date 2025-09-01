import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: ROUTES.STUDENTS,
      label: 'Students',
      icon: '👥'
    },
    {
      path: ROUTES.TEACHERS,
      label: 'Teachers',
      icon: '👨‍🏫'
    },
    {
      path: ROUTES.GROUPS,
      label: 'Groups',
      icon: '👥'
    },
    {
      path: ROUTES.COURSES,
      label: 'Courses',
      icon: '📚'
    },
    {
      path: ROUTES.ANALYTICS,
      label: 'Analytics',
      icon: '📈'
    },
    {
      path: ROUTES.PAYMENTS,
      label: 'Payments',
      icon: '💳'
    },
    {
      path: ROUTES.CENTER,
      label: 'Center Settings',
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
            <h2>EduTi Admin</h2>
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