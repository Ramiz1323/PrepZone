import React, { useMemo } from 'react';
import GlassCard from '../../../components/GlassCard';
import { SkeletonText } from '../../../components/Skeleton';
import './Heatmap.scss';

const LEVEL_COLORS = {
  0: 'var(--heatmap-bg)',
  1: 'var(--heatmap-l1)',
  2: 'var(--heatmap-l2)',
  3: 'var(--heatmap-l3)',
  4: 'var(--heatmap-l4)',
};

const ConsistencyHeatmap = ({ data, loading }) => {
  const heatmapData = useMemo(() => {
    // 1. Generate the last 53 weeks of dates
    const currentDate = new Date();
    const result = [];
    
    // Start from 53 weeks ago (to show partial leading week if needed)
    // We want the grid to end at 'today'
    const weeks = 53;
    const daysPerWeek = 7;
    
    // Map existing data for quick lookup
    const dataMap = new Map();
    data?.forEach(item => {
      dataMap.set(item.date, item);
    });

    // To align properly, we find the "start" date which is 52 weeks ago from the nearest Sunday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const endDate = new Date(today);
    
    // Start Date: 52 weeks ago Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (52 * 7) - dayOfWeek);

    let iterDate = new Date(startDate);
    
    // Group into weeks
    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const dateStr = iterDate.toISOString().split('T')[0];
        const activity = dataMap.get(dateStr) || { level: 0, totalMCQs: 0 };
        
        week.push({
          date: dateStr,
          level: activity.level,
          count: activity.totalMCQs,
          tooltip: `${dateStr}: ${activity.totalMCQs} MCQs`,
          future: iterDate > today
        });
        
        iterDate.setDate(iterDate.getDate() + 1);
      }
      result.push(week);
    }
    
    return result;
  }, [data]);

  const monthLabels = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let lastMonth = -1;

    heatmapData.forEach((week, index) => {
      const firstDayDate = new Date(week[0].date);
      const month = firstDayDate.getMonth();
      if (month !== lastMonth) {
        labels.push({ name: months[month], index });
        lastMonth = month;
      }
    });

    return labels;
  }, [heatmapData]);

  if (loading) {
    return (
      <GlassCard className="heatmap-container loading">
        <SkeletonText width="100%" height="150px" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="heatmap-container">
      <div className="heatmap-header">
        <h3>Consistency Heatmap</h3>
        <span className="subtitle">Rolling 12-month study effort</span>
      </div>
      
      <div className="heatmap-grid-wrapper">
        <div className="month-labels">
          {monthLabels.map((lbl, i) => (
            <span key={i} className="month-label" style={{ gridColumn: lbl.index + 1 }}>
              {lbl.name}
            </span>
          ))}
        </div>
        
        <div className="heatmap-main">
          <div className="day-labels">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          
          <div className="grid">
            {heatmapData.map((week, wIdx) => (
              <div key={wIdx} className="week-col">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    className={`day-cell level-${day.level} ${day.future ? 'future' : ''}`}
                    style={{ backgroundColor: day.future ? 'transparent' : LEVEL_COLORS[day.level] }}
                  >
                    {!day.future && (
                      <div className="tooltip">
                        {day.tooltip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="heatmap-footer">
        <div className="legend">
          <span>Less</span>
          <div className="legend-cells">
            <div className="day-cell level-0"></div>
            <div className="day-cell level-1"></div>
            <div className="day-cell level-2"></div>
            <div className="day-cell level-3"></div>
            <div className="day-cell level-4"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ConsistencyHeatmap;
