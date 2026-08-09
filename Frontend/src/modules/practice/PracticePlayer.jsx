import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiCheckCircle, FiArrowRight, FiAward, FiHome, FiBookOpen, FiCode } from 'react-icons/fi';
import { fetchTestDetails, submitTestResult, resetPracticeState } from '../../store/slices/practiceSlice';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import PageLoader from '../../components/PageLoader';
import confetti from 'canvas-confetti';
import { getLocalDateString } from '../../utils/dateUtils';
import { highlightCode } from '../../utils/highlighter';
import { db } from '../../services/db';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import '../../styles/pages/_practice.scss';

const PracticePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTest, loading, submitLoading } = useSelector(state => state.practice);
  const isOnline = useOnlineStatus();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]); // Stores user choices
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    dispatch(fetchTestDetails(id));
  }, [id, dispatch]);

  const saveProgress = useCallback((index, currentAnswers, secondsLeft) => {
    if (!id || !currentTest) return;
    db.activeTests.put({
      testId: id,
      currentIndex: index,
      answers: currentAnswers,
      timeLeft: secondsLeft
    }).catch(err => console.error('Failed to save progress to IndexedDB:', err));
  }, [id, currentTest]);

  // Load progress if exists
  useEffect(() => {
    if (currentTest) {
      db.activeTests.get(id).then(savedProgress => {
        if (savedProgress) {
          setCurrentIndex(savedProgress.currentIndex);
          setAnswers(savedProgress.answers);
          setSelectedOption(savedProgress.answers[savedProgress.currentIndex] ?? null);
          if (currentTest.isTimed) {
            setTimeLeft(savedProgress.timeLeft);
          }
        } else {
          setAnswers(new Array(currentTest.questions.length).fill(null));
          if (currentTest.isTimed) {
            setTimeLeft(currentTest.timeLimit * 60);
          }
        }
      }).catch(err => {
        console.error('Failed to load saved progress:', err);
        setAnswers(new Array(currentTest.questions.length).fill(null));
        if (currentTest.isTimed) {
          setTimeLeft(currentTest.timeLimit * 60);
        }
      });
    }
  }, [currentTest, id]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const nextTime = prev - 1;
          if (nextTime % 5 === 0) {
            saveProgress(currentIndex, answers, nextTime);
          }
          return nextTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentTest?.isTimed && !isFinished) {
      handleFinish();
    }
  }, [timeLeft, isFinished, currentTest, currentIndex, answers, saveProgress]);

  const handleFinish = useCallback(async (finalAnswers = answers) => {
    if (isFinished) return;
    setIsFinished(true);

    // Delete local active progress since the test is finished
    await db.activeTests.delete(id).catch(err => console.error('Failed to delete progress:', err));

    // Calculate score using passed answers to avoid stale state
    const score = finalAnswers.reduce((acc, ans, idx) => {
      return ans === currentTest.questions[idx].answer ? acc + 1 : acc;
    }, 0);

    const resultData = {
      score,
      totalQuestions: currentTest.questions.length,
      timeTaken: currentTest.isTimed ? (currentTest.timeLimit * 60 - timeLeft) : 0,
      userAnswers: finalAnswers, // Sending detailed answers for review
      date: getLocalDateString()
    };

    if (navigator.onLine) {
      dispatch(submitTestResult({ testId: id, resultData }));
    } else {
      try {
        await db.syncOutbox.add({
          testId: id,
          resultData,
          timestamp: Date.now()
        });
        console.log('Test completed offline, results queued in syncOutbox.');
      } catch (err) {
        console.error('Failed to save test result offline:', err);
      }
    }

    const accuracy = score / currentTest.questions.length;
    console.log('Result Calculated:', { score, total: currentTest.questions.length, accuracy });

    if (accuracy >= 0.8) {
      // Basic Pop
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#f43f5e', '#fbbf24']
      });

      // Special 'Patakha' animation for 90%+
      if (accuracy >= 0.9) {
        console.log('Triggering Patakha!');
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          // Firing from the sides
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.4, 0.6) } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.4, 0.6) } });
        }, 250);
      }
    }
  }, [id, answers, currentTest, timeLeft, isFinished, dispatch]);

  const handleSelectOption = (idx) => {
    setSelectedOption(idx);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = idx;
    setAnswers(newAnswers);
    saveProgress(currentIndex, newAnswers, timeLeft);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedOption;
    setAnswers(newAnswers);

    if (currentIndex < currentTest.questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(answers[nextIdx] ?? null);
      saveProgress(nextIdx, newAnswers, timeLeft);
    } else {
      handleFinish(newAnswers);
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
          {!isOnline && (
            <div className="offline-notice" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '12px',
              borderRadius: '8px',
              margin: '12px auto',
              fontSize: '14px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              ⚠️ You are offline. Your score of <strong>{score}/{currentTest.questions.length}</strong> has been saved locally and will sync when you reconnect.
            </div>
          )}
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
            <Button variant="outline" onClick={() => navigate(`/practice/review/${id}`)}>
              <FiCheckCircle /> Review Answers
            </Button>
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

          {currentQ.codeSnippet && (
            <div className="code-snippet-box">
              <div className="snippet-header">
                <span><FiCode /> Code Snippet</span>
              </div>
              <div className="snippet-content">
                <div className="line-numbers">
                  {currentQ.codeSnippet.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre dangerouslySetInnerHTML={{ __html: highlightCode(currentQ.codeSnippet) }} />
              </div>
            </div>
          )}

          <div className="options-grid">
            {currentQ.options.map((opt, idx) => (
              <div
                key={idx}
                className={`option-item ${selectedOption === idx ? 'selected' : ''}`}
                onClick={() => handleSelectOption(idx)}
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
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setSelectedOption(answers[prevIndex]);
            saveProgress(prevIndex, answers, timeLeft);
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
