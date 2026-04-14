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
  const accScore = Math.pow(avgAccuracy / 100, 3) * 70;

  // 2. Volume Component (Max 20 points) - TOUGHER THRESHOLD
  const volScore = Math.min(totalMCQs / 5000, 1) * 20;

  // 3. Consistency Component (Max 10 points)
  const streakScore = Math.min((streak?.current || 0) / 15, 1) * 10;

  let baseReadiness = accScore + volScore + streakScore;

  // 4. WEAK SUBJECT PENALTY
  const penaltyMultiplier = Math.max(0.75, 1 - (weakSubjects.length * 0.05));
  const totalReadiness = Math.max(0, Math.round(baseReadiness * penaltyMultiplier));

  // 5. Calculate GMR - SHARPER DISTRIBUTION
  const percentile = totalReadiness / 100;
  let predictedGMR = Math.round(TOTAL_CANDIDATES * Math.pow(1 - percentile, 2.2));
  predictedGMR = Math.max(1, Math.min(predictedGMR, TOTAL_CANDIDATES));

  // 6. College Probabilities with Granular Proximity Modeling
  const collegeMatches = COLLEGES.map(college => {
    let probability = 0;
    let jumpNeeded = Math.max(0, predictedGMR - college.cutoff);
    
    if (predictedGMR <= college.minCutoff) {
      probability = 95; 
    } else if (predictedGMR <= college.cutoff) {
      const range = college.cutoff - college.minCutoff;
      const pos = predictedGMR - college.minCutoff;
      probability = 90 - (pos / range) * 40; 
    } else {
      // PROXIMITY MODELING for Low Chance
      // Instead of flat 5%, scale based on rank distance
      const distance = predictedGMR - college.cutoff;
      const maxPossibleDistance = TOTAL_CANDIDATES - college.cutoff;
      const proximityFactor = 1 - (distance / maxPossibleDistance);
      
      // Scale from 2% (very far) to 25% (very close to cutoff)
      probability = 2 + (Math.pow(proximityFactor, 2) * 23);
    }

    return {
      ...college,
      probability: parseFloat(probability.toFixed(1)),
      jumpNeeded
    };
  });

  return {
    gmr: predictedGMR,
    readiness: totalReadiness,
    collegeMatches
  };
};
