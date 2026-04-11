import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../store/slices/trackerSlice';
import { FiClock, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import GlassCard from './GlassCard';

const ActivityTimeline = () => {
  const dispatch = useDispatch();
  const { logs, loadingLogs } = useSelector((state) => state.tracker);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="activity-timeline">
      <div className="timeline-header">
        <h3><FiCalendar /> Recent Activity</h3>
      </div>

      <div className="timeline-content">
        {loadingLogs && logs.length === 0 ? (
          <div className="timeline-state">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="timeline-state empty">No activity logged.</div>
        ) : (
          logs.slice(0, 5).map((log) => (
            <div key={log._id} className="timeline-day">
              <div 
                className="day-header" 
                onClick={() => setExpandedDay(expandedDay === log._id ? null : log._id)}
              >
                <div className="day-info">
                  <span className="day-date">{formatDate(log.date)}</span>
                  <span className="day-total">{log.totalMCQs} MCQs</span>
                </div>
                {expandedDay === log._id ? <FiChevronUp /> : <FiChevronDown />}
              </div>

              {expandedDay === log._id && (
                <div className="day-sessions">
                  {(log.sessions || []).slice().reverse().map((session, idx) => (
                    <div key={idx} className="session-node">
                      <div className="node-time">
                        <FiClock /> {formatTime(session.timestamp)}
                      </div>
                      <div className="node-body">
                        <div className="node-stats">
                          {session.totalMCQs} MCQs • {session.timeSpent}m
                        </div>
                        <div className="node-subjects">
                          {Object.entries(session.subjects || {}).map(([name]) => (
                            <span key={name} className="sub-tag">{name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
