import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiHome, FiBookOpen, FiCalendar, FiTrendingUp, FiMenu } from 'react-icons/fi';
import clsx from 'clsx';
import '../styles/components/_bottom-navbar.scss';

const BOTTOM_NAV_ITEMS = [
  { path: '/dashboard', name: 'Dashboard', icon: FiHome },
  { path: '/practice', name: 'MCQ Tests', icon: FiBookOpen },
  { path: '/planner', name: 'Planner', icon: FiCalendar },
  { path: '/predictor', name: 'Rank', icon: FiTrendingUp },
];

const BottomNavbar = ({ onToggleSidebar }) => {
  const location = useLocation();

  return (
    <nav className="bottom-navbar">
      <div className="bottom-navbar-container">
        {BOTTOM_NAV_ITEMS.map(({ path, name, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={clsx('bottom-nav-item', isActive && 'active')}
            >
              <Icon className="bottom-nav-icon" />
              <span className="bottom-nav-label">{name}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className="bottom-nav-item more-btn"
          onClick={onToggleSidebar}
          aria-label="Open Sidebar"
        >
          <FiMenu className="bottom-nav-icon" />
          <span className="bottom-nav-label">More</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavbar;
