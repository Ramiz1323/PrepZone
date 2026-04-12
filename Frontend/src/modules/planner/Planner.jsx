import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiCalendar, FiPlus, FiTrash2, FiSave, FiInfo, FiCheckCircle, 
  FiCpu, FiCopy, FiCheck, FiChevronLeft, FiChevronRight, 
  FiList, FiX, FiCheckSquare, FiSettings, FiActivity, FiChevronDown 
} from 'react-icons/fi';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { 
  fetchPlanner, 
  savePlanner, 
  listPlanners, 
  setActivePlan, 
  deletePlanner,
  clearPlannerData 
} from '../../store/slices/plannerSlice';
import '../../styles/pages/_planner.scss';


const Planner = () => {
  const dispatch = useDispatch();
  const { data, allPlanners, loading, saveLoading } = useSelector((state) => state.planner);
  const [activeTab, setActiveTab] = useState('view');
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState(null);
  
  // Custom Selector State
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

  // New Plan State
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");

  // AI Prompt Generator State
  const [aiConfig, setAiConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    subjects: 'Mathematics, Computer Science',
    syllabus: '',
    mcqTarget: 50
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  // Calendar State
  const [viewType, setViewType] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    dispatch(listPlanners());
    dispatch(fetchPlanner());

    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleImport = async () => {
    try {
      setError(null);
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array');
      
      await dispatch(savePlanner({ 
        id: data._id, 
        plans: parsed,
        title: data.title 
      })).unwrap();
      
      setActiveTab('view');
      dispatch(listPlanners());
    } catch (err) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  const handleCreateNewPlan = async () => {
    if (!newPlanTitle.trim()) return;
    try {
      await dispatch(savePlanner({ 
        title: newPlanTitle, 
        plans: [], 
        isActive: true 
      })).unwrap();
      setNewPlanTitle("");
      setShowNewPlanModal(false);
      dispatch(listPlanners());
      setActiveTab('manage');
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      await dispatch(deletePlanner(id)).unwrap();
      dispatch(fetchPlanner());
    }
  };

  const handleSwitchPlan = (id) => {
    if (id === 'new') {
      setShowNewPlanModal(true);
    } else {
      dispatch(fetchPlanner(id));
    }
    setIsSelectorOpen(false);
    setActiveTab('view');
  };

  const handleSetPrimary = (id) => {
    dispatch(setActivePlan(id));
  };

  const generateAIPrompt = () => {
    const prompt = `Act as an expert study planner for ${data?.title || 'JECA preparation'}. 
I want to create a roadmap from ${aiConfig.startDate} to ${aiConfig.endDate || 'the next 30 days'}.

Subjects to cover: ${aiConfig.subjects}
Syllabus/Focus Areas: ${aiConfig.syllabus || 'standard syllabus'}
Daily MCQ Target: ${aiConfig.mcqTarget}

Please generate a study plan in the following STRICT JSON format (no chat text, only JSON):
[
  {
    "date": "YYYY-MM-DD",
    "subject": "Subject Name",
    "topics": ["Topic 1", "Topic 2"],
    "mcqTarget": ${aiConfig.mcqTarget}
  }
]

Ensure the dates are consecutive and properly cover the syllabus across the specified subjects.`;
    
    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calendar Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasPlan = data?.plans?.some(p => p.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div 
          key={d} 
          className={`calendar-day ${hasPlan ? 'has-plan' : ''} ${isToday ? 'today' : ''} ${selectedDate === dateStr ? 'selected' : ''}`}
          onClick={() => setSelectedDate(dateStr)}
        >
          <span className="day-num">{d}</span>
          {hasPlan && <div className="plan-dot"></div>}
        </div>
      );
    }
    return days;
  };

  const sortedPlans = [...(data?.plans || [])].sort((a, b) => a.date.localeCompare(b.date));
  const selectedPlan = data?.plans?.find(p => p.date === selectedDate);

  if (loading && !data._id) return <div className="loading-state">Loading schedules...</div>;

  return (
    <div className="planner-page">
      <div className="header-section">
        <div className="title-area">
          <div className="plan-breadcrumb">
            <FiActivity size={12} />
            <span>Study Planner / Current</span>
          </div>
          <h1>{data?.title || 'Study Planner'}</h1>
          <p>Managing {allPlanners.length} roadmap{allPlanners.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="actions">
          <div className="custom-selector-wrapper" ref={selectorRef}>
            <button 
              className={`selector-toggle ${isSelectorOpen ? 'open' : ''}`}
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            >
              <div className="selected-info">
                <FiActivity className="icon" />
                <span className="text">{data?.title || 'Select Roadmap'}</span>
                {data?.isActive && <span className="badge">Primary</span>}
              </div>
              <FiChevronDown className="chevron" />
            </button>

            {isSelectorOpen && (
              <GlassCard className="selector-dropdown">
                {allPlanners.map(p => (
                  <div 
                    key={p._id} 
                    className={`dropdown-item ${p._id === data._id ? 'active' : ''}`}
                    onClick={() => handleSwitchPlan(p._id)}
                  >
                    <div className="item-text">
                      <span className="title">{p.title}</span>
                      {p.isActive && <span className="active-tag">Current Mission</span>}
                    </div>
                    {p._id === data._id && <FiCheck className="check-icon" />}
                  </div>
                ))}
                <div className="dropdown-divider"></div>
                <div className="dropdown-item new-plan" onClick={() => handleSwitchPlan('new')}>
                  <FiPlus />
                  <span>Create New Roadmap</span>
                </div>
              </GlassCard>
            )}
          </div>

          <div className="view-toggle">
            <button 
              className={viewType === 'list' ? 'active' : ''} 
              onClick={() => { setViewType('list'); setActiveTab('view'); }}
              title="Switch to List View"
            >
              <FiList size={20} />
            </button>
            <button 
              className={viewType === 'calendar' ? 'active' : ''} 
              onClick={() => { setViewType('calendar'); setActiveTab('view'); }}
              title="Switch to Calendar View"
            >
              <FiCalendar size={20} />
            </button>
          </div>

          <button 
            className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <span className="tab-text">Planning</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <FiSettings /> <span className="tab-text">Settings</span>
          </button>
        </div>
      </div>

      {activeTab === 'view' ? (
        <div className="view-container">
          {sortedPlans.length === 0 ? (
            <GlassCard className="empty-state">
              <FiCalendar size={48} />
              <h3>Roadmap is Empty</h3>
              <p>Configure your study targets for "{data?.title}" to begin tracking.</p>
              <Button onClick={() => setActiveTab('manage')}>Setup Now</Button>
            </GlassCard>
          ) : viewType === 'list' ? (
            <div className="timeline">
              {sortedPlans.map((plan, index) => {
                const isPast = new Date(plan.date) < new Date(new Date().setHours(0,0,0,0));
                const isToday = plan.date === new Date().toISOString().split('T')[0];

                return (
                  <div key={index} className={`timeline-item ${isPast ? 'past' : ''} ${isToday ? 'today' : ''}`}>
                    <div className="date-side">
                      <span className="date-label">{new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                    </div>
                    <GlassCard className="plan-card">
                      <div className="card-top">
                        <span className="subject-badge">{plan.subject}</span>
                        {isToday && <span className="today-badge">Active Task</span>}
                      </div>
                      <div className="topics-list">
                        {plan.topics?.map((topic, i) => (
                          <span key={i} className="topic-tag">{topic}</span>
                        ))}
                      </div>
                      <div className="card-footer">
                        <div className="target-info">
                          <FiCheckCircle />
                          <span>Goal: <strong>{plan.mcqTarget} MCQs</strong></span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="calendar-view">
              <GlassCard className="calendar-card">
                <div className="calendar-header">
                  <button onClick={handlePrevMonth}><FiChevronLeft /></button>
                  <h3>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={handleNextMonth}><FiChevronRight /></button>
                </div>
                
                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday-label">{day}</div>
                  ))}
                  {renderCalendar()}
                </div>
              </GlassCard>

              {selectedDate && (
                <GlassCard className="day-detail-panel">
                  <div className="panel-header">
                    <h4>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                    <button onClick={() => setSelectedDate(null)}><FiX size={18}/></button>
                  </div>
                  
                  {selectedPlan ? (
                    <div className="plan-content">
                      <div className="subject-info">
                        <span className="subject-badge">{selectedPlan.subject}</span>
                        <h3>Goal: {selectedPlan.mcqTarget} MCQs</h3>
                      </div>
                      <div className="topics-section">
                        <label>Target Topics:</label>
                        <div className="topics-list">
                          {selectedPlan.topics?.map((topic, i) => (
                            <span key={i} className="topic-tag">{topic}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-plan">
                      <p>No study targets set for this day.</p>
                    </div>
                  )}
                </GlassCard>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="manage-container">
          <div className="management-grid">
            <div className="main-settings">
              <GlassCard className="ai-generator-card">
                <div className="card-header">
                  <h3><FiCpu /> Roadmap Architect</h3>
                  <p>Design a new AI roadmap for <strong>{data?.title}</strong>.</p>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label>Start Date</label>
                    <input type="date" value={aiConfig.startDate} onChange={(e) => setAiConfig({...aiConfig, startDate: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>End Date</label>
                    <input type="date" value={aiConfig.endDate} onChange={(e) => setAiConfig({...aiConfig, endDate: e.target.value})} />
                  </div>
                  <div className="input-group full">
                    <label>Subjects</label>
                    <input type="text" value={aiConfig.subjects} onChange={(e) => setAiConfig({...aiConfig, subjects: e.target.value})} />
                  </div>
                  <div className="input-group full">
                    <label>Syllabus Focus</label>
                    <textarea value={aiConfig.syllabus} onChange={(e) => setAiConfig({...aiConfig, syllabus: e.target.value})} />
                  </div>
                </div>

                <button className="glow-btn" onClick={generateAIPrompt}>Generate JSON Prompt</button>

                {generatedPrompt && (
                  <div className="prompt-result">
                    <div className="result-header">
                      <span>Copy this to AI:</span>
                      <button className="copy-btn" onClick={copyToClipboard}>
                        {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                      </button>
                    </div>
                    <pre>{generatedPrompt}</pre>
                  </div>
                )}
              </GlassCard>

              <GlassCard className="editor-card">
                <div className="editor-header">
                  <h3><FiPlus /> Import Data</h3>
                  <span className="info-badge">Updating: {data?.title}</span>
                </div>
                
                <textarea
                  className="json-editor"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste AI generated JSON array here..."
                />

                {error && <div className="error-msg">{error}</div>}

                <div className="editor-actions">
                  <Button variant="danger" onClick={() => handleDelete(data?._id)}>
                    <FiTrash2 /> Delete Roadmap
                  </Button>
                  <Button className="glow-btn" onClick={handleImport} isLoading={saveLoading}>
                    <FiSave /> Sync Roadmap
                  </Button>
                </div>
              </GlassCard>
            </div>

            <div className="plan-list-sidebar">
              <GlassCard className="sidebar-card">
                <div className="sidebar-header">
                  <h3>Plan Management</h3>
                  <button className="small-add-btn" onClick={() => setShowNewPlanModal(true)}>
                    <FiPlus /> New
                  </button>
                </div>
                
                <div className="planners-list">
                  {allPlanners.map(p => (
                    <div 
                      key={p._id} 
                      className={`plan-item ${p._id === data._id ? 'active' : ''}`}
                      onClick={() => handleSwitchPlan(p._id)}
                    >
                      <div className="plan-info">
                        <strong>{p.title}</strong>
                        {p.isActive && <span className="primary-tag">Primary</span>}
                      </div>
                      {!p.isActive && (
                        <button 
                          className="set-active-btn" 
                          onClick={(e) => { e.stopPropagation(); handleSetPrimary(p._id); }}
                          title="Set as Dashboard Primary"
                        >
                          <FiActivity />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {showNewPlanModal && (
        <div className="modal-overlay">
          <GlassCard className="modal-content">
            <div className="modal-header">
              <h3>Create New Roadmap</h3>
              <button onClick={() => setShowNewPlanModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Roadmap Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Web Development, JECA Round 2"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowNewPlanModal(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleCreateNewPlan} disabled={!newPlanTitle.trim()}>Create</button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Planner;
