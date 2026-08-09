import React from 'react';
import { FiMenu, FiBell, FiLogOut, FiUploadCloud, FiWifiOff } from 'react-icons/fi';
import { HiFire } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { db } from '../services/db';
import '../styles/components/_topbar.scss';

const Topbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showMobileXP, setShowMobileXP] = React.useState(false);
  const isOnline = useOnlineStatus();
  const [pendingSyncs, setPendingSyncs] = React.useState(0);

  React.useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await db.syncOutbox.count();
        setPendingSyncs(count);
      } catch (err) {
        console.error('Failed to get outbox count:', err);
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const xpInLevel = currentXP % 1000;
  const progressPercent = (xpInLevel / 1000) * 100;

  const getRank = (level) => {
    if (level <= 5) return { name: 'Bronze', color: '#cd7f32' };
    if (level <= 15) return { name: 'Silver', color: '#c0c0c0' };
    if (level <= 30) return { name: 'Gold', color: '#ffd700' };
    if (level <= 45) return { name: 'Platinum', color: '#e5e4e2' };
    if (level <= 60) return { name: 'Diamond', color: '#b9f2ff' };
    if (level <= 80) return { name: 'Master', color: '#ff00ff' };
    return { name: 'Grandmaster', color: '#ff4500' };
  };

  const rank = getRank(currentLevel);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="page-title">
          <h2><span className="welcome-text">Welcome back, </span><span className="highlight">{user?.name?.split(' ')[0] || 'User'}</span> 👋</h2>
        </div>
      </div>

      <div className="xp-progression">
        <div className="level-badge">{currentLevel}</div>
        <div className="xp-info">
          <span className="rank-text" style={{ color: rank.color }}>{rank.name}</span>
          <div className="streak-badge">
            <HiFire style={{ color: user?.streak?.current > 0 ? '#ff4500' : '#text-muted' }} />
            <span>{user?.streak?.current || 0} Day Streak</span>
          </div>
          <span className="xp-score">{xpInLevel} / 1000 XP</span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-fill" style={{ width: `${progressPercent}%`, background: `linear-gradient(to right, ${rank.color}, #ffffff)` }}></div>
        </div>
      </div>

      {/* Mobile XP Trigger Pill */}
      <div className="mobile-xp-pill" onClick={() => setShowMobileXP(!showMobileXP)} role="button" tabIndex={0}>
        <span className="lvl">Lvl {currentLevel}</span>
        <div className="divider"></div>
        <span className="streak">
          <HiFire style={{ color: user?.streak?.current > 0 ? '#ff4500' : '#9ca3af' }} />
          <span>{user?.streak?.current || 0}</span>
        </span>
      </div>

      {/* Mobile XP Details Dropdown Panel */}
      {showMobileXP && (
        <div className="mobile-xp-dropdown">
          <div className="dropdown-rank" style={{ color: rank.color }}>
            {rank.name} Rank
          </div>
          <div className="dropdown-xp-score">{xpInLevel} / 1000 XP</div>
          <div className="dropdown-xp-bar">
            <div
              className="dropdown-xp-fill"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(to right, ${rank.color}, #ffffff)`,
              }}
            ></div>
          </div>
          <div className="dropdown-streak">
            <HiFire style={{ color: user?.streak?.current > 0 ? '#ff4500' : '#9ca3af' }} />
            <span>{user?.streak?.current || 0} Day Streak</span>
          </div>
        </div>
      )}
      
      <div className="topbar-right">
        <button className="icon-btn notification-btn" aria-label="Notifications">
          <FiBell />
          <span className="badge"></span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
             <FiLogOut />
          </button>
        </div>
      </div>

      {/* Floating Network & Sync Status indicators */}
      <div className="topbar-floating-status">
        {!isOnline && (
          <div className="floating-badge offline" title="App is currently offline">
            <FiWifiOff /> Offline
          </div>
        )}
        {pendingSyncs > 0 && (
          <div className="floating-badge sync-pending" title={`${pendingSyncs} test attempts waiting to sync`}>
            <FiUploadCloud className={`sync-icon ${isOnline ? 'online' : 'offline'}`} />
            <span>{pendingSyncs} Sync Pending</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
