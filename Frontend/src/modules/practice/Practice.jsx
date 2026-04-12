import React, { useEffect, useState } from 'react';
import { FiPlus, FiPlay, FiBookOpen, FiClock, FiSearch, FiUploadCloud } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyTests, importNewTest, resetPracticeState } from '../../store/slices/practiceSlice';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { SkeletonCard } from '../../components/Skeleton';
import ImportModal from './components/ImportModal';
import '../../styles/pages/_practice.scss';

const Practice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tests, loading, submitLoading, success, error } = useSelector(state => state.practice);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTests());
  }, [dispatch]);

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

                <Button 
                  variant={hasAttempt ? 'secondary' : 'primary'}
                  className="start-btn"
                  onClick={() => navigate(`/practice/${test._id}`)}
                >
                  <FiPlay /> {hasAttempt ? 'Re Test' : 'Start Test'}
                </Button>
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
