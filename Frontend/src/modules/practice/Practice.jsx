import React, { useEffect, useState } from 'react';
import { FiPlus, FiPlay, FiBookOpen, FiClock, FiSearch, FiUploadCloud } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyTests, importNewTest, resetPracticeState } from '../../store/slices/practiceSlice';
import { fetchPlanner } from '../../store/slices/plannerSlice';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { SkeletonCard } from '../../components/Skeleton';
import ImportModal from './components/ImportModal';
import { db } from '../../services/db';
import { syncService } from '../../services/syncService';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import '../../styles/pages/_practice.scss';

const Practice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tests, loading, submitLoading, success, error } = useSelector(state => state.practice);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  const updateSyncCount = async () => {
    try {
      const count = await db.syncOutbox.count();
      setPendingSyncs(count);
    } catch (err) {
      console.error('Failed to update sync count:', err);
    }
  };

  useEffect(() => {
    dispatch(fetchMyTests());
    dispatch(fetchPlanner());
    updateSyncCount();
  }, [dispatch]);

  useEffect(() => {
    // Keep count updated in real time
    const interval = setInterval(updateSyncCount, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (syncing || !isOnline || pendingSyncs === 0) return;
    setSyncing(true);
    const res = await syncService.syncPendingResults();
    if (res.status === 'finished') {
      alert(`Successfully synchronized ${res.successCount} test results with the cloud!`);
      dispatch(fetchMyTests());
    } else if (res.status === 'offline') {
      alert('You are offline. Please reconnect to internet to sync.');
    } else {
      alert('Failed to sync. Please try again later.');
    }
    setSyncing(false);
    updateSyncCount();
  };

  const { data: plannerData } = useSelector((state) => state.planner);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlan = plannerData?.plans?.find((p) => p.date === todayStr);

  useEffect(() => {
    if (success) {
      setIsModalOpen(false);
      dispatch(resetPracticeState());
    }
    if (error) {
      alert(error);
      dispatch(resetPracticeState());
    }
  }, [success, error, dispatch]);

  const handleImport = (testData) => {
    dispatch(importNewTest(testData));
  };

  const filteredTests = tests.filter(test => 
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="practice-page">
      <div className="header-section">
        <div className="title-area">
          <h1>MCQ Master</h1>
          <p>Import custom tests from ChatGPT and master any topic.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Import Test
        </Button>
      </div>

      {pendingSyncs > 0 && (
        <GlassCard className="sync-banner" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '16px',
          borderRadius: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiUploadCloud size={24} style={{ color: '#f59e0b', animation: syncing ? 'pulse 2s infinite' : 'none' }} />
            <div>
              <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '15px', fontWeight: '600' }}>Sync Pending Results</h4>
              <p style={{ margin: 0, color: '#d1d5db', fontSize: '13px' }}>
                You have {pendingSyncs} test attempt{pendingSyncs > 1 ? 's' : ''} saved locally.
              </p>
            </div>
          </div>
          <Button 
            variant="primary" 
            onClick={handleManualSync}
            disabled={syncing || !isOnline}
            isLoading={syncing}
            style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000', padding: '8px 16px', fontSize: '14px' }}
          >
            {isOnline ? 'Sync Now' : 'Connect to Sync'}
          </Button>
        </GlassCard>
      )}

      {todayPlan && (
        <GlassCard className="today-target-card">
          <div className="card-badge">Today's Mission</div>
          <div className="card-content">
            <div className="main-info">
              <div className="subject-row">
                <span className="subject">{todayPlan.subject}</span>
              </div>
              <div className="topics" aria-label="Today's topics">
                {todayPlan.topics?.slice(0, 4).map((topic) => (
                  <span key={topic} className="topic-tag">{topic}</span>
                ))}
                {todayPlan.topics?.length > 4 && (
                  <span className="topic-tag more">+{todayPlan.topics.length - 4}</span>
                )}
              </div>
            </div>

            <div className="target-stats" aria-label="Today's target">
              <span className="label">Target</span>
              <span className="value">{todayPlan.mcqTarget}</span>
              <span className="unit">MCQs</span>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search by subject or topic..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="tests-grid">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredTests.length > 0 ? (
          filteredTests.map(test => {
            const hasAttempt = !!test.lastAttempt?.date;
            const lastAttemptDate = hasAttempt ? new Date(test.lastAttempt.date).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : null;

            return (
              <GlassCard key={test._id} className={`test-card ${hasAttempt ? 'attempted' : ''}`}>
                <div className="subject-badge">{test.subject}</div>
                <h3>{test.topic || 'General Practice'}</h3>
                <div className="test-meta">
                  <span><FiBookOpen /> {test.totalQuestions} Questions</span>
                  {test.isTimed && <span><FiClock /> {test.timeLimit} Min</span>}
                  <span className={`difficulty-badge ${test.difficulty?.toLowerCase()}`}>
                    {test.difficulty || 'Medium'}
                  </span>
                </div>

                {hasAttempt && (
                  <div className="last-attempt-info">
                    Last Attempt: {lastAttemptDate}
                  </div>
                )}

                <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <Button 
                    variant={hasAttempt ? 'secondary' : 'primary'}
                    className="start-btn"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/practice/${test._id}`)}
                  >
                    <FiPlay /> {hasAttempt ? 'Re Test' : 'Start Test'}
                  </Button>
                  {hasAttempt && (
                    <Button 
                      variant="outline"
                      className="review-btn"
                      onClick={() => navigate(`/practice/review/${test._id}`)}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </GlassCard>
            );
          })
        ) : (
          <div className="empty-state">
            <FiUploadCloud size={48} />
            <h3>No Tests Found</h3>
            <p>Click "Import Test" to add your first ChatGPT generated MCQ set!</p>
          </div>
        )}
      </div>

      <ImportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onImport={handleImport}
        loading={submitLoading}
      />
    </div>
  );
};

export default Practice;
