import React, { useEffect } from 'react';
import { FiCheckCircle, FiClock, FiTarget, FiTrendingUp, FiEdit2 } from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ReferenceLine 
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, updateDailyGoal } from '../../store/slices/dashboardSlice';
import GlassCard from '../../components/GlassCard';
import { SkeletonCard, SkeletonChart } from '../../components/Skeleton';
import { getSubjectColor } from '../../utils/chartUtils';
import '../../styles/pages/_dashboard.scss';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { summary, weekly, loading } = useSelector((state) => state.dashboard);
  
  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [tempGoal, setTempGoal] = React.useState('');

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const subjectData = Object.keys(summary?.subjectAccuracy || {}).map(sub => ({
    name: sub,
    accuracy: summary.subjectAccuracy[sub].accuracy,
    total: summary.subjectAccuracy[sub].total
  }));

  const chartData = weekly?.dailyBreakdown?.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    mcqs: day.totalMCQs,
    accuracy: day.accuracy,
    isGoalMet: day.isGoalMet
  })) || [];

  const dailyGoal = weekly?.dailyGoal || 50;

  const handleGoalEdit = () => {
    setTempGoal(dailyGoal.toString());
    setIsEditingGoal(true);
  };

  const [isSubmittingGoal, setIsSubmittingGoal] = React.useState(false);

  const handleGoalSubmit = async () => {
    if (isSubmittingGoal) return;

    const newGoal = parseInt(tempGoal);
    if (!isNaN(newGoal) && newGoal > 0 && newGoal !== dailyGoal) {
      setIsSubmittingGoal(true);
      try {
        await dispatch(updateDailyGoal(newGoal)).unwrap();
      } catch (err) {
        console.error("Failed to update goal:", err);
      } finally {
        setIsSubmittingGoal(false);
        setIsEditingGoal(false);
      }
    } else {
      setIsEditingGoal(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleGoalSubmit();
    if (e.key === 'Escape') setIsEditingGoal(false);
  };

  return (
    <div className="dashboard-page">
      <div className="header-section">
        <h1>Overview</h1>
        <p>Your JECA preparation summary.</p>
      </div>

      <div className="stats-grid">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : summary ? (
          <>
            <GlassCard className="stat-card">
              <div className="icon-wrapper primary"><FiTarget /></div>
              <div className="stat-info">
                <h3>Total MCQs</h3>
                <p className="value">{summary.totalMCQs}</p>
              </div>
            </GlassCard>
            <GlassCard className="stat-card">
              <div className="icon-wrapper success"><FiCheckCircle /></div>
              <div className="stat-info">
                <h3>Avg Accuracy</h3>
                <p className="value">{summary.avgAccuracy}%</p>
              </div>
            </GlassCard>
            <GlassCard className="stat-card">
              <div className="icon-wrapper warning"><FiClock /></div>
              <div className="stat-info">
                <h3>MCQ Goal Met</h3>
                <p className="value">{weekly?.goalMetDays || 0}/{weekly?.totalDays || 0} <small>Days</small></p>
              </div>
            </GlassCard>
            <GlassCard className="stat-card">
              <div className="icon-wrapper accent"><FiTrendingUp /></div>
              <div className="stat-info">
                <h3>Current Streak</h3>
                <p className="value">{summary.streak?.current || 0} days</p>
              </div>
            </GlassCard>
          </>
        ) : null}
      </div>

      <div className="charts-grid">
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : summary && weekly ? (
          <>
            <GlassCard className="chart-card">
              <div className="card-header-flex">
                <h3>Weekly Progress (MCQs)</h3>
                <div className="goal-container">
                  {isEditingGoal ? (
                    <input 
                      type="number" 
                      className="goal-input"
                      value={tempGoal}
                      onChange={(e) => setTempGoal(e.target.value)}
                      onBlur={handleGoalSubmit}
                      onKeyDown={handleKeyDown}
                      disabled={isSubmittingGoal}
                      autoFocus
                    />
                  ) : (
                    <span className="goal-badge clickable" onClick={handleGoalEdit}>
                      Daily Goal: {dailyGoal} <FiEdit2 size={10} />
                    </span>
                  )}
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
                    <ReferenceLine 
                      y={dailyGoal} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3" 
                      label={{ value: 'GOAL', position: 'insideRight', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Line type="monotone" dataKey="mcqs" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="chart-card">
              <h3>Subject Accuracy</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSubjectColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </>
        ) : null}
      </div>

      {!loading && summary && summary.weakSubjects?.length > 0 && (
        <GlassCard className="weak-topics-card">
          <h3>Attention Needed</h3>
          <p>Subjects with accuracy below 60%</p>
          <div className="tags">
            {summary.weakSubjects.map(sub => (
              <span key={sub} className="tag tag-danger">{sub}</span>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Dashboard;
