import React, { useState } from 'react';
import { FiX, FiInfo, FiUploadCloud, FiClock, FiCopy, FiCheck } from 'react-icons/fi';
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
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  if (!isOpen) return null;

  const generatedPrompt = `Generate ${questionCount} ${difficulty} level MCQs for ${subject} on the topic "${topic || '(Topic Name)'}" at a JECA exam difficulty level in valid JSON format. 
Structure: [ { "question": "...", "options": ["...", "...", "...", "..."], "answer": 0 } ]
Requirement: Output ONLY the JSON array, no conversational text.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        timeLimit: isTimed ? timeLimit : 0,
        difficulty
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
          
          <div className="modal-header">
            <h2>Import MCQ Test</h2>
            <p className="subtitle">Paste your ChatGPT generated JSON below.</p>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <div className="modal-grid">
              {/* Left Pane: Settings & Generation */}
              <div className="settings-pane">
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
                  <label>Difficulty Level</label>
                  <select 
                    className="glass-input select-input" 
                    value={difficulty} 
                    onChange={e => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Questions</label>
                  <Input 
                    type="number"
                    min="1"
                    max="50"
                    placeholder="E.g., 10" 
                    value={questionCount}
                    onChange={e => setQuestionCount(e.target.value)}
                    required
                  />
                </div>

                {!showPrompt ? (
                  <div className="generate-prompt-wrapper">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="generate-btn"
                      onClick={() => setShowPrompt(true)}
                      disabled={!topic}
                    >
                      Generate Prompt for AI
                    </Button>
                    {!topic && <p className="hint">Enter a topic to generate a prompt</p>}
                  </div>
                ) : (
                  <div className="prompt-section">
                    <div className="label-flex">
                      <label>AI Prompt</label>
                      <div className="prompt-actions">
                        <button 
                          type="button" 
                          className={`copy-prompt-btn ${copied ? 'success' : ''}`} 
                          onClick={handleCopyPrompt}
                        >
                          {copied ? <FiCheck /> : <FiCopy />} {copied ? 'Copied!' : 'Copy Prompt'}
                        </button>
                        <button 
                          type="button" 
                          className="hide-prompt-btn" 
                          onClick={() => setShowPrompt(false)}
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                    <div className="prompt-preview">
                      {generatedPrompt}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane: Data & Actions */}
              <div className="data-pane">
                <div className="form-group">
                  <div className="label-flex">
                    <label>JSON Data</label>
                    <div className="info-tooltip">
                      <FiInfo />
                      <div className="tooltip-text">
                        Format: [ {"{"} 'question': '...', 'options': ['...'], 'answer': 0 {"}"} ]
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
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default ImportModal;
