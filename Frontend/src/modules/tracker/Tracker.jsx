import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiClock, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { submitLog, resetTrackerState, fetchHistory } from '../../store/slices/trackerSlice';
import GlassCard from '../../components/GlassCard';
import Input from '../../components/Input';
import Button from '../../components/Button';
import CongratsModal from '../../components/CongratsModal';
import { getLocalDateString } from '../../utils/dateUtils';
import '../../styles/pages/_tracker.scss';

const DEFAULT_SUBJECTS = [
  'C Programming', 'OOP', 'Unix', 'Data Structures', 
  'Computer Intro', 'Operating System', 'Computer Network', 
  'DBMS', 'Software Engineering', 'Machine Learning', 'Others'
];

const Tracker = () => {
  const dispatch = useDispatch();
  const { submitting, success } = useSelector((state) => state.tracker);
  
  const [activeSubjects, setActiveSubjects] = useState(() => {
    const saved = localStorage.getItem('prepzone_active_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [formData, setFormData] = useState(() => {
    return activeSubjects.reduce((acc, sub) => ({ ...acc, [sub]: { mcqsDone: 0, correct: 0 } }), {});
  });

  const [timeSpent, setTimeSpent] = useState(0);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [lastSessionStats, setLastSessionStats] = useState({ totalMCQs: 0, timeSpent: 0 });

  useEffect(() => {
    localStorage.setItem('prepzone_active_subjects', JSON.stringify(activeSubjects));
  }, [activeSubjects]);

  const handleInputChange = (subject, field, value) => {
    setFormData({
      ...formData,
      [subject]: { ...formData[subject], [field]: parseInt(value) || 0 }
    });
  };

  const addCustomSubject = () => {
    if (!newSubjectName.trim()) return;
    const name = newSubjectName.trim();
    if (activeSubjects.includes(name)) return alert("Subject already exists!");
    setActiveSubjects([...activeSubjects, name]);
    setFormData({ ...formData, [name]: { mcqsDone: 0, correct: 0 } });
    setNewSubjectName('');
    setIsAdding(false);
  };

  const removeSubject = (name) => {
    if (DEFAULT_SUBJECTS.includes(name)) return; 
    setActiveSubjects(activeSubjects.filter(s => s !== name));
    const newFormData = { ...formData };
    delete newFormData[name];
    setFormData(newFormData);
  };

  const handleSave = async () => {
    const subjectsToSubmit = {};
    let totalMCQs = 0;
    activeSubjects.forEach(sub => {
      if (formData[sub]?.mcqsDone > 0) {
        subjectsToSubmit[sub] = {
          total: formData[sub].mcqsDone,
          correct: formData[sub].correct
        };
        totalMCQs += formData[sub].mcqsDone;
      }
    });

    if (totalMCQs === 0) return alert("Please log some MCQs.");
    if (timeSpent <= 0) return alert("Please enter the time spent in minutes.");

    const date = getLocalDateString();
    const result = await dispatch(submitLog({ subjects: subjectsToSubmit, timeSpent, date }));
    
    if (result.meta.requestStatus === 'fulfilled') {
        setLastSessionStats({ totalMCQs, timeSpent });
        setShowCongrats(true);
        
        // Refresh history
        dispatch(fetchHistory());

        const clearedFormData = { ...formData };
        activeSubjects.forEach(sub => { clearedFormData[sub] = { mcqsDone: 0, correct: 0 }; });
        setFormData(clearedFormData);
        setTimeSpent(0);
        setTimeout(() => dispatch(resetTrackerState()), 3000);
    }
  };

  return (
    <div className="tracker-page">
      <div className="header-section">
        <div className="title-row">
          <h1>Daily Log</h1>
          <Button className="add-subject-btn" variant="outline" onClick={() => setIsAdding(!isAdding)}>
            <FiPlus /> Add Subject
          </Button>
        </div>
        <p>Record your practice sessions and MCQs.</p>
      </div>

      {isAdding && (
        <GlassCard className="add-subject-overlay">
          <Input 
            label="New Subject Name" 
            placeholder="e.g. Machine Learning" 
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            autoFocus
          />
          <div className="action-row">
            <Button onClick={addCustomSubject} size="sm">Add</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)} size="sm">Cancel</Button>
          </div>
        </GlassCard>
      )}

      {showCongrats && (
        <CongratsModal 
          stats={lastSessionStats} 
          onClose={() => setShowCongrats(false)} 
        />
      )}

      <div className="tracker-grid">
        {activeSubjects.map((sub) => (
          <GlassCard key={sub} className="subject-card">
            <div className="card-header">
              <h3>{sub}</h3>
              {!DEFAULT_SUBJECTS.includes(sub) && (
                <button className="remove-btn" onClick={() => removeSubject(sub)}>
                  <FiTrash2 size={14} />
                </button>
              )}
            </div>
            <div className="inputs">
              <Input 
                label="Attempted" type="number" min="0"
                value={formData[sub]?.mcqsDone || ''}
                onChange={(e) => handleInputChange(sub, 'mcqsDone', e.target.value)}
              />
              <Input 
                label="Correct" type="number" min="0" max={formData[sub]?.mcqsDone}
                value={formData[sub]?.correct || ''}
                onChange={(e) => handleInputChange(sub, 'correct', e.target.value)}
              />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="submit-card">
        <Input 
          label="Total Time Spent (Minutes)" type="number" min="0"
          value={timeSpent || ''}
          onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
        />
        <Button onClick={handleSave} className="save-btn" isLoading={submitting} size="lg">
          <FiSave /> Save Log
        </Button>
      </GlassCard>
    </div>
  );
};

export default Tracker;
