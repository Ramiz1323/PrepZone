import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiHome, FiEdit3, FiPieChart, FiAlertCircle, FiList, FiClock, FiBookOpen, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import clsx from 'clsx';
import '../styles/components/_sidebar.scss';

import ActivityTimeline from './ActivityTimeline';

const NAV_ITEMS = [
  { path: '/dashboard', name: 'Dashboard', icon: FiHome },
  { path: '/planner', name: 'Study Planner', icon: FiCalendar },
  { path: '/tracker', name: 'Tracker', icon: FiEdit3 },
  { path: '/practice', name: 'MCQ Tests', icon: FiBookOpen },
  { path: '/analytics', name: 'Analytics', icon: FiPieChart },
  { path: '/predictor', name: 'Rank Predictor', icon: FiTrendingUp },
  { path: '/revision', name: 'Revision', icon: FiList },
  { path: '/mistakes', name: 'Mistakes Log', icon: FiAlertCircle },
  { path: '/history', name: 'History', icon: FiClock },
];

const Sidebar = ({ isOpen, setOpen }) => {
  const location = useLocation();

  return (
    <>
      <div className={clsx('sidebar-overlay', isOpen && 'open')} onClick={() => setOpen(false)}></div>
      <aside className={clsx('sidebar', isOpen && 'open')}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">
              <span className="logo-accent">Prep</span>Zone
            </span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, name, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={clsx('nav-item', isActive && 'active')}
                onClick={() => setOpen(false)}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p className="footer-text">JECA Prep v1.2.1</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
