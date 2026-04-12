import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiHome, FiEdit3, FiPieChart, FiAlertCircle, FiList, FiClock, FiBookOpen } from 'react-icons/fi';
import clsx from 'clsx';
import '../styles/components/_sidebar.scss';

import ActivityTimeline from './ActivityTimeline';

const NAV_ITEMS = [
  { path: '/dashboard', name: 'Dashboard', icon: FiHome },
  { path: '/tracker', name: 'Tracker', icon: FiEdit3 },
  { path: '/practice', name: 'MCQ Master', icon: FiBookOpen },
  { path: '/history', name: 'History', icon: FiClock },
  { path: '/analytics', name: 'Analytics', icon: FiPieChart },
  { path: '/mistakes', name: 'Mistakes Log', icon: FiAlertCircle },
  { path: '/revision', name: 'Revision', icon: FiList },
];

const Sidebar = ({ isOpen, setOpen }) => {
  const location = useLocation();

  return (
    <>
      <div className={clsx('sidebar-overlay', isOpen && 'open')} onClick={() => setOpen(false)}></div>
      <aside className={clsx('sidebar', isOpen && 'open')}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-accent">Prep</span>Zone
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
          <p className="footer-text">JECA Prep v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
