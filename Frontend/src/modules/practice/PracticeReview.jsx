import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTestDetails, fetchLatestResult, resetPracticeState } from '../../store/slices/practiceSlice';
import { FiArrowLeft, FiCheck, FiX, FiBarChart2, FiClock, FiTarget } from 'react-icons/fi';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import PageLoader from '../../components/PageLoader';
import '../../styles/pages/_practice.scss';

const PracticeReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTest, lastResult, loading, error } = useSelector((state) => state.practice);

  useEffect(() => {
    dispatch(fetchTestDetails(id));
    dispatch(fetchLatestResult(id));

    return () => {
      dispatch(resetPracticeState());
    };
  }, [dispatch, id]);

  if (loading) return <PageLoader />;
  if (error) return <div className="error-container">{error}</div>;
  if (!currentTest || !lastResult) return <div className="error-container">No attempt found to review.</div>;

  return (
    <div className="test-review-page">
      <div className="review-header">
        <div className="header-left">
          <Button variant="ghost" onClick={() => navigate('/practice')} icon={<FiArrowLeft />}>
            Back to Library
          </Button>
          <h2>Review: {currentTest.title}</h2>
          <p>{currentTest.subject} • Completed on {lastResult.date}</p>
        </div>
      </div>

      <div className="review-stats">
        <GlassCard className="stat-card accuracy">
          <label><FiTarget /> Accuracy</label>
          <p>{lastResult.accuracy}%</p>
        </GlassCard>
        <GlassCard className="stat-card">
          <label><FiBarChart2 /> Score</label>
          <p>{lastResult.score} / {lastResult.totalQuestions}</p>
        </GlassCard>
        <GlassCard className="stat-card">
          <label><FiClock /> Time Spent</label>
          <p>{Math.floor(lastResult.timeTaken / 60)}m {lastResult.timeTaken % 60}s</p>
        </GlassCard>
      </div>

      <div className="questions-list">
        {currentTest.questions.map((q, qIndex) => {
          const userAnswer = lastResult.userAnswers ? lastResult.userAnswers[qIndex] : null;
          const isCorrect = userAnswer === q.answer;
          
          return (
            <GlassCard key={qIndex} className="review-question-card">
              <span className="question-num">Question {qIndex + 1}</span>
              <div className="question-text">{q.question}</div>
              
              <div className="options-list">
                {q.options.map((option, oIndex) => {
                  const isUserSelection = userAnswer === oIndex;
                  const isCorrectAnswer = q.answer === oIndex;
                  
                  let statusClass = '';
                  if (isCorrectAnswer) statusClass = 'correct';
                  else if (isUserSelection && !isCorrect) statusClass = 'incorrect';

                  return (
                    <div key={oIndex} className={`option-item ${statusClass}`}>
                      <span className="prefix">{String.fromCharCode(65 + oIndex)}</span>
                      <span className="text">{option}</span>
                      
                      {isCorrectAnswer && <FiCheck className="status-icon" />}
                      {isUserSelection && !isCorrect && <FiX className="status-icon" />}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="review-footer">
        <Button size="large" onClick={() => navigate(`/practice/${id}`)}>
          Retake Test
        </Button>
      </div>
    </div>
  );
};

export default PracticeReview;
