import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap = {
      '/': 'Dashboard',
      '/students': 'Students',
      '/teachers': 'Teachers',
      '/groups': 'Groups',
      '/courses': 'Courses',
      '/analytics': 'Analytics',
      '/payments': 'Payments',
      '/center': 'Center Settings'
    };
    
    // Handle dynamic routes
    if (path.includes('/modules')) return 'Modules';
    if (path.includes('/lessons')) return 'Lessons';
    if (path.includes('/words')) return 'Words';
    
    return titleMap[path] || 'Admin Panel';
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
      />
      
      <div className="layout-content">
        <Header 
          title={getPageTitle()} 
          onMenuToggle={toggleSidebar}
        />
        
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;