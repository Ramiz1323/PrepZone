import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../../store/slices/trackerSlice';
import { FiClock, FiCalendar, FiChevronDown, FiChevronUp, FiBookOpen, FiActivity } from 'react-icons/fi';
import GlassCard from '../../components/GlassCard';
import '../../styles/pages/_history.scss';

const History = () => {
  const dispatch = useDispatch();
  const { logs, loadingLogs } = useSelector((state) => state.tracker);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="header-content">
          <h1><FiActivity /> Study History</h1>
          <p>A detailed timeline of your preparation journey.</p>
        </div>
      </div>

      <div className="history-container">
        {loadingLogs && logs.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Gathering your study records...</p>
          </div>
        ) : logs.length === 0 ? (
          <GlassCard className="empty-history">
            <FiBookOpen size={48} />
            <h3>No Records Found</h3>
            <p>Your study history will appear here once you start logging MCQs in the Tracker.</p>
          </GlassCard>
        ) : (
          <div className="history-timeline">
            {logs.map((log) => (
              <GlassCard key={log._id} className="day-group">
                <div 
                  className="day-header" 
                  onClick={() => setExpandedDay(expandedDay === log._id ? null : log._id)}
                >
                  <div className="day-info">
                    <FiCalendar className="day-icon" />
                    <div className="date-meta">
                      <span className="full-date">{formatDate(log.date)}</span>
                      <span className="day-summary">
                        {log.totalMCQs} MCQs • {log.timeSpent} mins total
                      </span>
                    </div>
                  </div>
                  <div className="header-actions">
                    <div className="accuracy-badge" style={{ 
                      background: `rgba(${log.accuracy > 70 ? '76, 175, 80' : '255, 152, 0'}, 0.1)`,
                      color: log.accuracy > 70 ? '#4caf50' : '#ff9800'
                    }}>
                      {log.accuracy}% Accuracy
                    </div>
                    <div className="expand-toggle">
                      {expandedDay === log._id ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>
                </div>

                {expandedDay === log._id && (
                  <div className="sessions-list">
                    {(log.sessions || []).slice().reverse().map((session, idx) => (
                      <div key={idx} className="session-card">
                        <div className="session-left">
                          <div className="time-stamp">
                            <FiClock /> {formatTime(session.timestamp)}
                          </div>
                          <div className="session-line"></div>
                        </div>
                        <div className="session-right">
                          <div className="session-meta">
                            <div className="stat">
                              <span className="label">Attempted</span>
                              <span className="value">{session.totalMCQs}</span>
                            </div>
                            <div className="stat">
                              <span className="label">Time Spent</span>
                              <span className="value">{session.timeSpent} min</span>
                            </div>
                          </div>
                          <div className="session-subjects">
                            {Object.entries(session.subjects || {}).map(([name, data]) => (
                                <div key={name} className="subject-item">
                                    <span className="sub-name">{name}</span>
                                    <span className="sub-counts">{data.total} MCQs</span>
                                </div>
                            ))}
                          </div>
                          {session.notes && (
                            <div className="session-notes">
                              <p>"{session.notes}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
