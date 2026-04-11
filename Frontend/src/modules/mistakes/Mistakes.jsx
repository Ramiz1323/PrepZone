import React, { useEffect, useState } from 'react';
import { FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMistakes, addMistake, deleteMistake } from '../../store/slices/mistakesSlice';
import GlassCard from '../../components/GlassCard';
import { SkeletonCard } from '../../components/Skeleton';
import Input from '../../components/Input';
import Button from '../../components/Button';
import '../../styles/pages/_mistakes.scss';

const SUBJECTS = [
  'C Programming', 'OOP', 'Unix', 'Data Structures', 
  'Computer Intro', 'Operating System', 'Computer Network', 
  'DBMS', 'Software Engineering', 'Machine Learning', 'Others'
];

const Mistakes = () => {
  const dispatch = useDispatch();
  const { items: mistakes, loading } = useSelector(state => state.mistakes);
  
  // Add Mistake Form State
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [mistakeText, setMistakeText] = useState('');
  const [concept, setConcept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMistakes());
  }, [dispatch]);

  const handleAddMistake = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await dispatch(addMistake({
      subject,
      mistake: mistakeText,
      correction: concept
    }));
    setMistakeText('');
    setConcept('');
    setIsSubmitting(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this mistake?')) return;
    dispatch(deleteMistake(id));
  };

  return (
    <div className="mistakes-page">
      <div className="header-section">
        <h1>Mistakes Log</h1>
        <p>Track your errors and correct concepts to avoid repeating them.</p>
      </div>

      <GlassCard className="add-mistake-card">
        <div className="card-header">
          <FiAlertCircle className="icon" />
          <h3>Log a New Mistake</h3>
        </div>
        <form onSubmit={handleAddMistake}>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Subject</label>
              <select 
                className="glass-input select-input" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input 
              label="What was the mistake?" 
              placeholder="e.g., Confused BFS with DFS in graph traversal..."
              value={mistakeText}
              onChange={(e) => setMistakeText(e.target.value)}
              required
            />
            <Input 
              label="Correct Concept" 
              placeholder="e.g., BFS uses Queue, DFS uses Stack."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              required
            />
          </div>
          <Button type="submit" isLoading={isSubmitting}><FiPlus /> Add Mistake</Button>
        </form>
      </GlassCard>

      <div className="mistakes-list">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : mistakes.length > 0 ? (
          mistakes.map(m => (
            <GlassCard key={m._id} className="mistake-item">
              <div className="mistake-header">
                <div className="header-left">
                  <span className="subject-tag">{m.subject}</span>
                  <span className="date-tag">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <button className="icon-btn delete" title="Delete Mistake" onClick={() => handleDelete(m._id)}>
                  <FiTrash2 />
                </button>
              </div>
              <div className="mistake-body">
                <div className="mistake-block">
                  <strong>Mistake:</strong>
                  <p>{m.mistake}</p>
                </div>
                <div className="concept-block">
                  <strong>Correct Concept:</strong>
                  <p>{m.correction}</p>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="empty-state">No mistakes logged yet. Keep up the good work!</div>
        )}
      </div>
    </div>
  );
};

export default Mistakes;
