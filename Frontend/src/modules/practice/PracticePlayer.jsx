import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiCheckCircle, FiXCircle, FiArrowRight, FiAward, FiHome } from 'react-icons/fi';
import { fetchTestDetails, submitTestResult, resetPracticeState } from '../../store/slices/practiceSlice';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import PageLoader from '../../components/PageLoader';
import confetti from 'canvas-confetti';
import '../../styles/pages/_practice.scss';

const PracticePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTest, loading, submitLoading, success } = useSelector(state => state.practice);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]); // Stores user choices
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false); // If true, shows answers only at the end

  useEffect(() => {
    dispatch(fetchTestDetails(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (currentTest && currentTest.isTimed) {
      setTimeLeft(currentTest.timeLimit * 60);
    }
  }, [currentTest]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentTest?.isTimed && !isFinished) {
      handleFinish();
    }
  }, [timeLeft, isFinished, currentTest]);

  const handleFinish = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);

    // Calculate score
    const score = answers.reduce((acc, ans, idx) => {
      return ans === currentTest.questions[idx].answer ? acc + 1 : acc;
    }, 0);

    const resultData = {
      score,
      totalQuestions: currentTest.questions.length,
      timeTaken: currentTest.isTimed ? (currentTest.timeLimit * 60 - timeLeft) : 0,
      date: new Date().toISOString().split('T')[0]
    };

    dispatch(submitTestResult({ testId: id, resultData }));

    if (score / currentTest.questions.length >= 0.8) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#f43f5e', '#fbbf24']
      });
    }
  }, [id, answers, currentTest, timeLeft, isFinished, dispatch]);

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedOption;
    setAnswers(newAnswers);

    if (currentIndex < currentTest.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(answers[currentIndex + 1] ?? null);
    } else {
      handleFinish();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading || !currentTest) return <PageLoader />;

  if (isFinished) {
    const score = answers.reduce((acc, ans, idx) => {
      return ans === currentTest.questions[idx].answer ? acc + 1 : acc;
    }, 0);
    const accuracy = Math.round((score / currentTest.questions.length) * 100);

    return (
      <div className="test-results-page">
        <GlassCard className="results-card">
          <div className="icon-celebration">
            <FiAward size={64} color="#fbbf24" />
          </div>
          <h2>Test Completed!</h2>
          <div className="stats-row">
            <div className="stat">
              <label>Score</label>
              <p>{score}/{currentTest.questions.length}</p>
            </div>
            <div className="stat">
              <label>Accuracy</label>
              <p>{accuracy}%</p>
            </div>
            <div className="stat">
              <label>Time Taken</label>
              <p>{formatTime(currentTest.isTimed ? (currentTest.timeLimit * 60 - timeLeft) : 0)}</p>
            </div>
          </div>
          
          <div className="actions">
            <Button variant="secondary" onClick={() => navigate('/practice')}>
              <FiBookOpen /> Back to Library
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              <FiHome /> Go Home
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const currentQ = currentTest.questions[currentIndex];
  const progress = ((currentIndex + 1) / currentTest.questions.length) * 100;

  return (
    <div className="test-player-page">
      <div className="test-header">
        <div className="header-left">
          <h2>{currentTest.title}</h2>
          <div className="progress-bar-container">
            <div className="progress-text">Question {currentIndex + 1} of {currentTest.questions.length}</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        
        {currentTest.isTimed && (
          <div className={`timer-badge ${timeLeft < 60 ? 'critical' : ''}`}>
            <FiClock /> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="question-container">
        <GlassCard className="question-card">
          <p className="question-text">{currentQ.question}</p>
          
          <div className="options-grid">
            {currentQ.options.map((opt, idx) => (
              <div 
                key={idx}
                className={`option-item ${selectedOption === idx ? 'selected' : ''}`}
                onClick={() => setSelectedOption(idx)}
              >
                <div className="prefix">{String.fromCharCode(65 + idx)}</div>
                <div className="text">{opt}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="player-footer">
        <Button 
          variant="secondary" 
          disabled={currentIndex === 0}
          onClick={() => {
            setCurrentIndex(prev => prev - 1);
            setSelectedOption(answers[currentIndex - 1]);
          }}
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={selectedOption === null || submitLoading}
          isLoading={submitLoading && currentIndex === currentTest.questions.length - 1}
        >
          {currentIndex === currentTest.questions.length - 1 ? 'Finish Test' : 'Next Question'} 
          <FiArrowRight style={{ marginLeft: 8 }} />
        </Button>
      </div>
    </div>
  );
};

export default PracticePlayer;
