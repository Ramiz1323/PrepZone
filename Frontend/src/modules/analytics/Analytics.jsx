import React, { useEffect } from 'react';
import { FiCpu, FiAlertTriangle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestions, fetchCalendarData } from '../../store/slices/dashboardSlice';
import ConsistencyHeatmap from './components/ConsistencyHeatmap';
import GlassCard from '../../components/GlassCard';
import { SkeletonCard, SkeletonText } from '../../components/Skeleton';
import '../../styles/pages/_analytics.scss';

const Analytics = () => {
  const dispatch = useDispatch();
  const { 
    suggestions: data, 
    suggestionsLoading: loading, 
    summary,
    calendarData,
    calendarLoading
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchSuggestions());
    dispatch(fetchCalendarData()); // Fetches current year activity
  }, [dispatch]);

  return (
    <div className="analytics-page">
      <div className="header-section">
        <h1>AI Insights & Suggestions</h1>
        <p>Personalized study recommendations based on your performance.</p>
      </div>

      <ConsistencyHeatmap data={calendarData} loading={calendarLoading} />

      {loading ? (
        <>
          <SkeletonText width="150px" height="30px" className="mb-4" />
          <div className="suggestions-list">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : data ? (
        <>
          <div className="source-indicator">
            {data.source === 'mistral-ai' ? (
              <span className="badge badge-ai"><FiCpu /> AI Generated</span>
            ) : (
              <span className="badge badge-rule"><FiAlertTriangle /> Rule-based Fallback</span>
            )}
          </div>

          <div className="suggestions-list">
            {data.suggestions?.length > 0 ? (
              data.suggestions.map((item, idx) => (
                <GlassCard key={idx} className={`suggestion-card priority-${item.priority}`}>
                  <div className="card-header">
                    <h3>{item.subject}</h3>
                    <span className={`priority-tag ${item.priority}`}>{item.priority}</span>
                  </div>
                  <div className="accuracy-bar-container">
                    <div className="accuracy-label">Accuracy: {item.accuracy}%</div>
                    <div className="accuracy-bar">
                      <div 
                        className="accuracy-fill" 
                        style={{ width: `${item.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="suggestion-text">{item.suggestion}</p>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="empty-state">
                <p>{summary?.totalMCQs === 0 ? "You haven't tracked any mock tests yet! Log your scores in the Tracker module to unlock AI-powered insights." : "Great job! You don't have any weak topics right now."}</p>
              </GlassCard>
            )}
          </div>
        </>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default Analytics;
