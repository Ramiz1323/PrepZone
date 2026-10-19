import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiHome,
  FiCalendar,
  FiEdit3,
  FiBookOpen,
  FiFileText,
  FiPieChart,
  FiTrendingUp,
  FiList,
  FiAlertCircle,
  FiClock,
  FiTarget
} from 'react-icons/fi';
import clsx from 'clsx';
import '../styles/components/_sidebar.scss';

const NAV_SECTIONS = [
  {
    title: 'Core',
    items: [
      { path: '/dashboard', name: 'Dashboard', icon: FiHome },
      { path: '/planner', name: 'Study Planner', icon: FiCalendar },
      { path: '/tracker', name: 'Study Tracker', icon: FiEdit3 },
    ],
  },
  {
    title: 'Preparation',
    items: [
      { path: '/practice', name: 'MCQ Tests', icon: FiBookOpen },
      { path: '/materials', name: 'Study Materials', icon: FiFileText },
      { path: '/revision', name: 'Revision', icon: FiList },
      { path: '/mistakes', name: 'Mistakes Log', icon: FiAlertCircle },
    ],
  },
  {
    title: 'Performance',
    items: [
      { path: '/analytics', name: 'Analytics', icon: FiPieChart },
      { path: '/predictor', name: 'Rank Predictor', icon: FiTrendingUp },
      { path: '/history', name: 'History', icon: FiClock },
    ],
  },
];

const Sidebar = ({ isOpen, setOpen }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <div
        className={clsx('sidebar-overlay', isOpen && 'open')}
        onClick={() => setOpen?.(false)}
      />
      <aside className={clsx('sidebar', isOpen && 'open')}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="brand-wrapper" onClick={() => setOpen?.(false)}>
            <div className="brand-left">
              <div className="brand-title">
                <span className="brand-accent">Prep</span>Zone
              </div>
            </div>
            <span className="brand-badge">JECA</span>
          </Link>
        </div>

        {/* Grouped Navigation */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="nav-section">
              <span className="section-title">{section.title}</span>
              <div className="section-items">
                {section.items.map(({ path, name, icon: Icon }) => {
                  const isActive = location.pathname.startsWith(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={clsx('nav-item', isActive && 'active')}
                      onClick={() => setOpen?.(false)}
                    >
                      <Icon className="nav-icon" />
                      <span className="nav-label">{name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Profile & Version */}
        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-details">
              <div className="mini-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="mini-info">
                <span className="mini-name">{user?.name || 'Student'}</span>
                <span className="mini-sub">
                  Lvl {user?.level || 1} • {user?.streak?.current || 0}d streak
                </span>
              </div>
            </div>
            <span className="version-badge">v1.2.1</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
