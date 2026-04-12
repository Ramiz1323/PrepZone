import React, { useState } from 'react';
import { FiX, FiInfo, FiUploadCloud, FiClock } from 'react-icons/fi';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import GlassCard from '../../../components/GlassCard';
import './ImportModal.scss';

const SUBJECTS = [
  'C Programming', 'OOP', 'Unix', 'Data Structures', 
  'Computer Intro', 'Operating System', 'Computer Network', 
  'DBMS', 'Software Engineering', 'Machine Learning', 'Others'
];

const ImportModal = ({ isOpen, onClose, onImport, loading }) => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const questions = JSON.parse(jsonText);
      if (!Array.isArray(questions)) throw new Error('Root must be an array');
      
      onImport({
        title: `${subject} - ${topic}`,
        subject,
        topic,
        questions,
        isTimed,
        timeLimit: isTimed ? timeLimit : 0
      });
    } catch (err) {
      alert('Invalid JSON format. Please ensure it follows the ChatGPT guide.');
    }
  };

  return (
    <div className="import-modal-overlay">
      <div className="modal-container">
        <GlassCard className="modal-content">
          <button className="close-btn" onClick={onClose}><FiX /></button>
          
          <h2>Import MCQ Test</h2>
          <p className="subtitle">Paste your ChatGPT generated JSON below.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject</label>
              <select 
                className="glass-input select-input" 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Topic Name</label>
              <Input 
                placeholder="E.g., Pointer Arithmetic" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="label-flex">
                <label>JSON Data</label>
                <div className="info-tooltip">
                  <FiInfo />
                  <div className="tooltip-text">
                    Ask ChatGPT: "Generate 10 C Programming MCQs on Pointers in JSON format: [ {"{"} 'question': '...', 'options': ['...'], 'answer': 0 {"}"} ]"
                  </div>
                </div>
              </div>
              <textarea 
                className="glass-input json-textarea"
                placeholder='[ { "question": "...", "options": [...], "answer": 0 } ]'
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                required
              />
            </div>

            <div className="options-row">
              <div className="toggle-group">
                <label className="switch">
                  <input type="checkbox" checked={isTimed} onChange={e => setIsTimed(e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <span>Timed Test</span>
              </div>
              
              {isTimed && (
                <div className="time-input-group">
                  <FiClock />
                  <input 
                    type="number" 
                    value={timeLimit} 
                    onChange={e => setTimeLimit(e.target.value)}
                    min="1"
                  />
                  <span>min</span>
                </div>
              )}
            </div>

            <div className="actions">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={loading}>
                <FiUploadCloud /> Import & Start
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default ImportModal;
