import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { FiEdit3, FiPieChart, FiList, FiAlertCircle, FiClock, FiLogOut, FiX } from 'react-icons/fi';
import clsx from 'clsx';
import '../styles/components/_bottom-sheet.scss';

const SHEET_ITEMS = [
  { path: '/tracker', name: 'Study Tracker', icon: FiEdit3 },
  { path: '/analytics', name: 'Analytics', icon: FiPieChart },
  { path: '/revision', name: 'Revision', icon: FiList },
  { path: '/mistakes', name: 'Mistakes Log', icon: FiAlertCircle },
  { path: '/history', name: 'History', icon: FiClock },
];

const BottomSheet = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    dispatch(logoutUser());
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="bottom-sheet-overlay" onClick={onClose}></div>

      {/* Sheet Container */}
      <div className={clsx('bottom-sheet', isOpen && 'open')}>
        {/* Drag handle decoration */}
        <div className="bottom-sheet-handle-container" onClick={onClose}>
          <div className="bottom-sheet-handle"></div>
        </div>

        {/* Header */}
        <div className="bottom-sheet-header">
          <h3>More Menu</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        {/* Navigation list */}
        <div className="bottom-sheet-content">
          <div className="sheet-nav">
            {SHEET_ITEMS.map(({ path, name, icon: Icon }) => {
              const isActive = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={clsx('sheet-item', isActive && 'active')}
                  onClick={onClose}
                >
                  <Icon className="sheet-icon" />
                  <span className="sheet-label">{name}</span>
                </Link>
              );
            })}
            
            <div className="sheet-divider"></div>
            
            <button type="button" className="sheet-item logout-item" onClick={handleLogout}>
              <FiLogOut className="sheet-icon" />
              <span className="sheet-label">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
