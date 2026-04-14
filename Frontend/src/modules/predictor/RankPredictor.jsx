import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import { calculateWBJECAReadiness } from '../../utils/predictionUtils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiAward, FiCheckCircle, FiInfo, FiMapPin, FiBriefcase } from 'react-icons/fi';
import GlassCard from '../../components/GlassCard';
import PageLoader from '../../components/PageLoader';
import '../../styles/pages/_predictor.scss';

const RankPredictor = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (!summary) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, summary]);

  const results = useMemo(() => {
    return calculateWBJECAReadiness(summary);
  }, [summary]);

  if (loading && !summary) return <PageLoader />;

  const gaugeData = [
    { name: 'Readiness', value: results.readiness },
    { name: 'Remaining', value: 100 - results.readiness }
  ];

  const GAUGE_COLORS = ['#6366f1', 'rgba(255, 255, 255, 0.05)'];

  const getProbabilityLabel = (prob) => {
    if (prob >= 80) return { text: 'High Chance', class: 'prob-high' };
    if (prob >= 50) return { text: 'Good Chance', class: 'prob-mid' };
    if (prob >= 20) return { text: 'Marginal', class: 'prob-low' };
    return { text: 'Low Chance', class: 'prob-none' };
  };

  return (
    <div className="predictor-page">
      <div className="header-section">
        <h1>WBJECA Rank Predictor</h1>
        <p>Estimated GMR and college admission chances based on your performance.</p>
      </div>

      <div className="readiness-grid">
        {/* Readiness Gauge */}
        <GlassCard className="gauge-card">
          <div className="card-header">
            <h3>Readiness Score</h3>
            <FiInfo className="info-icon" title="Aggregated from Accuracy, Volume, and Consistency" />
          </div>
          <div className="gauge-container">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="gauge-text">
              <span className="percentage">{results.readiness}%</span>
              <span className="label">Prepared</span>
            </div>
          </div>
          <p className="readiness-tip">
            {results.readiness > 80 ? "🚀 You are in the top elite bracket!" : 
             results.readiness > 50 ? "📈 You're doing well! Focus on weak topics to break into the top 500." :
             "🎯 Increase your MCQ volume and accuracy to boost your GMR prediction."}
          </p>
        </GlassCard>

        {/* Prediction Card */}
        <GlassCard className="prediction-card">
          <div className="card-badge">🎯 Predicted Rank</div>
          <div className="rank-display">
            <span className="label">Estimated GMR</span>
            <h2 className={results.gmr < 500 ? 'top-tier' : ''}>#{results.gmr}</h2>
            <p className="candidate-context">Among ~25,000 yearly candidates</p>
          </div>
          <div className="prediction-breakdown">
            <div className="metric">
              <span className="icon"><FiCheckCircle /></span>
              <div className="text-group">
                <span className="label">Accuracy Impact</span>
                <span className="value">{(summary?.avgAccuracy || 0).toFixed(1)}%</span>
              </div>
            </div>
            <div className="metric">
              <span className="icon"><FiBriefcase /></span>
              <div className="text-group">
                <span className="label">Practice Volume</span>
                <span className="value">{summary?.totalMCQs || 0} MCQs</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* College Matcher */}
      <h2 className="section-title">WBJECA College Probability</h2>
      
      {Object.entries(
        (results?.collegeMatches ?? []).reduce((acc, college) => {
          if (!acc[college.tier]) acc[college.tier] = [];
          acc[college.tier].push(college);
          return acc;
        }, {})
      ).map(([tier, colleges]) => (
        <div key={tier} className="tier-section">
          <h3 className="tier-title">{tier}</h3>
          <div className="colleges-grid">
            {colleges.map((college) => {
              const prob = getProbabilityLabel(college.probability);
              return (
                <GlassCard key={college.name} className="college-card">
                  <div className="college-header">
                    <div>
                      <h4>{college.name}</h4>
                      <div className="college-meta">
                        <span><FiMapPin /> {college.location}</span>
                        <span className="separator">•</span>
                        <span>{college.type}</span>
                      </div>
                    </div>
                    <span className={`prob-badge ${prob.class}`}>{prob.text}</span>
                  </div>
                  <div className="college-footer">
                    <span className="cutoff-hint">GMR Range: {college.minCutoff} - {college.cutoff}</span>
                    <div className="prob-bar">
                      <div className="fill" style={{ 
                        width: `${college.probability}%`, 
                        backgroundColor: prob.class === 'prob-high' ? '#10b981' : 
                                       prob.class === 'prob-mid' ? '#f59e0b' : 
                                       prob.class === 'prob-low' ? '#ef4444' : '#64748b' 
                      }}></div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      ))}

      <div className="readiness-footer-notice">
        <FiAward className="award-icon" />
        <div className="notice-content">
          <h4>Calculation & Accuracy Disclaimer</h4>
          <p>Predictions are generated using statistical modeling based on historical WBJECA trends and online data sources. Actual GMR and admission results may vary slightly from these estimates. These values are for reference and preparation guidance only.</p>
        </div>
      </div>
    </div>
  );
};

export default RankPredictor;
