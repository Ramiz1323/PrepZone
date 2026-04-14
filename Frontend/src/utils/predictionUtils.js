/**
 * Prediction Utilities for WBJECA GMR 
 */

const TOTAL_CANDIDATES = 25000;

/**
 * Calculates estimated GMR and Readiness Score - PRO V2 (High Rigor)
 * @param {Object} stats - User summary stats { avgAccuracy, totalMCQs, streak, weakSubjects }
 * @param {Array} COLLEGES - List of colleges from DB
 * @returns {Object} { gmr: number, readiness: number, collegeMatches: Array }
 */
export const calculateWBJECAReadiness = (stats, COLLEGES = []) => {
  if (!stats) return { gmr: TOTAL_CANDIDATES, readiness: 0, collegeMatches: [] };

  const { avgAccuracy = 0, totalMCQs = 0, streak = 0, weakSubjects = [] } = stats;

  // 1. Accuracy Component (Max 70 points) - CUBIC SCALING
  // Extreme penalty below 70%, exponential reward for 95%+
  const accScore = Math.pow(avgAccuracy / 100, 3) * 70;

  // 2. Volume Component (Max 20 points) - TOUGHER THRESHOLD
  // Target is now 5,000 MCQs for full mastery points
  const volScore = Math.min(totalMCQs / 5000, 1) * 20;

  // 3. Consistency Component (Max 10 points)
  // Target is 15 day streak
  const streakScore = Math.min((streak?.current || 0) / 15, 1) * 10;

  let baseReadiness = accScore + volScore + streakScore;

  // 4. WEAK SUBJECT PENALTY (Pro Feature)
  // Top rankers must be all-rounders. Reduce readiness by 5% per weak subject (Max 25% penalty)
  const penaltyMultiplier = Math.max(0.75, 1 - (weakSubjects.length * 0.05));
  const totalReadiness = Math.max(0, Math.round(baseReadiness * penaltyMultiplier));

  // 5. Calculate GMR - SHARPER DISTRIBUTION
  // Percentile calculation
  const percentile = totalReadiness / 100;
  
  // Power of 2.2 makes the Top 100 ranks significantly harder to crack
  let predictedGMR = Math.round(TOTAL_CANDIDATES * Math.pow(1 - percentile, 2.2));
  
  // Ensure rank is within bounds [1, 25000]
  predictedGMR = Math.max(1, Math.min(predictedGMR, TOTAL_CANDIDATES));

  // 6. College Probabilities
  const collegeMatches = COLLEGES.map(college => {
    let probability = 0;
    
    if (predictedGMR <= college.minCutoff) {
      probability = 95; 
    } else if (predictedGMR <= college.cutoff) {
      const range = college.cutoff - college.minCutoff;
      const pos = predictedGMR - college.minCutoff;
      probability = 90 - (pos / range) * 40; // 90% down to 50%
    } else if (predictedGMR <= college.cutoff * 1.3) {
      probability = 25; // More conservative at the edges
    } else {
      probability = 5; 
    }

    return {
      ...college,
      probability
    };
  });

  return {
    gmr: predictedGMR,
    readiness: totalReadiness,
    collegeMatches
  };
};
