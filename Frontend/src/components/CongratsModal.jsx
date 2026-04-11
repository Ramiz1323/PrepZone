import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import Button from './Button';
import '../styles/components/_congrats.scss';

const CongratsModal = ({ stats, onClose }) => {
  useEffect(() => {
    // Intense Firework Logic (Dashing Patakha Effect)
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    
    // Brand-aligned colors: PrepZone Red, Success Gold, Crisp White
    const colors = ['#ef4444', '#fbbf24', '#ffffff'];

    const frame = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      const particleCount = 2; // Per frame intensity
      
      // Burst from left
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        startVelocity: 45,
        gravity: 1.2,
        drift: 0,
        ticks: 200
      });

      // Burst from right
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        startVelocity: 45,
        gravity: 1.2,
        drift: 0,
        ticks: 200
      });

      // Random "Surprise" Firecrackers in the middle
      if (Math.random() < 0.1) {
        confetti({
          particleCount: 20,
          startVelocity: 30,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#ef4444', '#ffffff']
        });
      }

      requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <div className="congrats-overlay">
      <div className="congrats-modal">
        <div className="modal-header">
          <div className="success-icon-wrapper">
            <FiCheckCircle className="main-icon" />
            <FiTrendingUp className="stat-icon" />
          </div>
          <h2>Great Work!</h2>
          <p>You're one step closer to your goal.</p>
        </div>

        <div className="modal-content">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalMCQs}</span>
              <span className="stat-label">MCQs Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.timeSpent}m</span>
              <span className="stat-label">Study Duration</span>
            </div>
          </div>
          
          <div className="motivation-text">
            "Consistency is the key to mastery. Keep pushing!"
          </div>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose} size="lg" className="awesome-btn">
            Awesome!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CongratsModal;
