import React, { useEffect, useState } from 'react';
import { FiCheckSquare, FiSquare, FiTrash2, FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevisions, addRevision, toggleRevisionStatus, deleteRevision } from '../../store/slices/revisionSlice';
import GlassCard from '../../components/GlassCard';
import { SkeletonCard } from '../../components/Skeleton';
import Input from '../../components/Input';
import Button from '../../components/Button';
import '../../styles/pages/_revision.scss';

const SUBJECTS = [
  'C Programming', 'OOP', 'Unix', 'Data Structures', 
  'Computer Intro', 'Operating System', 'Computer Network', 
  'DBMS', 'Software Engineering', 'Machine Learning', 'Others'
];

const Revision = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.revision);

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchRevisions());
  }, [dispatch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await dispatch(addRevision({ subject, topic, priority }));
    setTopic('');
    setIsSubmitting(false);
  };

  const handleToggleStatus = (id, currentStatus) => {
    dispatch(toggleRevisionStatus({ id, status: currentStatus }));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this item?')) return;
    dispatch(deleteRevision(id));
  };

  return (
    <div className="revision-page">
      <div className="header-section">
        <h1>Revision Queue</h1>
        <p>Prioritize topics you need to practice again.</p>
      </div>

      <GlassCard className="add-task-card">
        <form onSubmit={handleAdd} className="task-form">
          <div className="form-row">
            <select className="glass-input select-input" value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input 
              placeholder="E.g., Virtual Memory Paging" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
            <select className="glass-input select-input" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <Button type="submit" isLoading={isSubmitting} className="add-btn"><FiPlus /></Button>
          </div>
        </form>
      </GlassCard>

      <div className="task-list">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : items.length > 0 ? (
          items.map(item => (
            <GlassCard key={item._id} className={`task-item ${item.status}`}>
              <div className={`priority-indicator ${item.priority}`}></div>
              
              <button className="check-btn" onClick={() => handleToggleStatus(item._id, item.status)}>
                {item.status === 'completed' ? <FiCheckSquare className="checked" /> : <FiSquare />}
              </button>
              
              <div className="task-content">
                <span className="subject-tag">{item.subject}</span>
                <span className="topic-text">{item.topic}</span>
              </div>
              
              <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                <FiTrash2 />
              </button>
            </GlassCard>
          ))
        ) : (
          <div className="empty-state">No revision tasks pending.</div>
        )}
      </div>
    </div>
  );
};

export default Revision;
