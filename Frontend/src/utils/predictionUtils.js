/**
 * Prediction Utilities for WBJECA GMR 
 */

const TOTAL_CANDIDATES = 25000;

export const COLLEGES = [
  // 🥇 TOP TIER
  { name: 'Jadavpur University (JU)', cutoff: 30, minCutoff: 1, location: 'Kolkata', type: 'Govt', tier: '🥇 TOP TIER' },
  { name: 'MAKAUT (WBUT Main Campus)', cutoff: 250, minCutoff: 50, location: 'Haringhata', type: 'Govt', tier: '🥇 TOP TIER' },
  { name: 'University of Calcutta (CU)', cutoff: 850, minCutoff: 170, location: 'Kolkata', type: 'Govt', tier: '🥇 TOP TIER' },
  
  // 🥈 GOOD GOVT / STRONG OPTIONS
  { name: 'University of Kalyani', cutoff: 600, minCutoff: 200, location: 'Kalyani', type: 'Govt', tier: '🥈 GOOD GOVT' },
  { name: 'Kalyani Govt Engg College (KGEC)', cutoff: 800, minCutoff: 80, location: 'Kalyani', type: 'Govt', tier: '🥈 GOOD GOVT' },
  { name: 'Jalpaiguri Govt Engg College (JGEC)', cutoff: 1500, minCutoff: 800, location: 'Jalpaiguri', type: 'Govt', tier: '🥈 GOOD GOVT' },
  
  // 🥉 PRIVATE (GOOD ROI)
  { name: 'IEM Kolkata', cutoff: 1000, minCutoff: 200, location: 'Kolkata', type: 'Private', tier: '🥉 PRIVATE (GOOD ROI)' },
  { name: 'UEM Kolkata', cutoff: 1200, minCutoff: 300, location: 'Kolkata', type: 'Private', tier: '🥉 PRIVATE (GOOD ROI)' },
  { name: 'Heritage Institute of Tech (HIT)', cutoff: 2000, minCutoff: 500, location: 'Kolkata', type: 'Private', tier: '🥉 PRIVATE (GOOD ROI)' },
  { name: 'RCC Institute of IT (RCCIIT)', cutoff: 2000, minCutoff: 1300, location: 'Kolkata', type: 'Govt Aided', tier: '🥉 PRIVATE (GOOD ROI)' },
  
  // 🧪 BACKUP / LOWER TIER
  { name: 'Techno Main Salt Lake', cutoff: 3500, minCutoff: 2500, location: 'Kolkata', type: 'Private', tier: '🧪 BACKUP' },
  { name: 'Haldia Institute of Tech (HIT)', cutoff: 3000, minCutoff: 2000, location: 'Haldia', type: 'Private', tier: '🧪 BACKUP' },
  { name: 'Netaji Subhash Engg College (NSEC)', cutoff: 3000, minCutoff: 1500, location: 'Kolkata', type: 'Private', tier: '🧪 BACKUP' },
  { name: 'Techno India Hooghly', cutoff: 5500, minCutoff: 3000, location: 'Hooghly', type: 'Private', tier: '🧪 BACKUP' },
];

/**
 * Calculates estimated GMR and Readiness Score
 * @param {Object} stats - User summary stats { avgAccuracy, totalMCQs, streak }
 * @returns {Object} { gmr: number, readiness: number, collegeMatches: Array }
 */
export const calculateWBJECAReadiness = (stats) => {
  if (!stats) return { gmr: TOTAL_CANDIDATES, readiness: 0, collegeMatches: [] };

  const { avgAccuracy = 0, totalMCQs = 0, streak = 0 } = stats;

  // 1. Accuracy Component (Max 70 points)
  // Accuracy below 50% yields very little. 90%+ is highly rewarded.
  const accScore = Math.pow(avgAccuracy / 100, 2) * 70;

  // 2. Volume Component (Max 20 points)
  // Target is 2500 MCQs for high readiness
  const volScore = Math.min(totalMCQs / 2500, 1) * 20;

  // 3. Consistency Component (Max 10 points)
  // Target is 15 day streak
  const streakScore = Math.min((streak?.current || 0) / 15, 1) * 10;

  const totalReadiness = Math.round(accScore + volScore + streakScore);

  // 4. Calculate GMR
  // Percentile calculation with adjustment for competitiveness at the top
  const percentile = totalReadiness / 100;
  
  // Rank distribution - makes it harder to reach rank 1
  let predictedGMR = Math.round(TOTAL_CANDIDATES * Math.pow(1 - percentile, 1.5));
  
  // Ensure rank is within bounds [1, 25000]
  predictedGMR = Math.max(1, Math.min(predictedGMR, TOTAL_CANDIDATES));

  // 5. College Probabilities - Using Range logic
  const collegeMatches = COLLEGES.map(college => {
    let probability = 0;
    
    if (predictedGMR <= college.minCutoff) {
      probability = 95; // Extremely High
    } else if (predictedGMR <= college.cutoff) {
      // Linear interpolation within the cutoff range
      const range = college.cutoff - college.minCutoff;
      const pos = predictedGMR - college.minCutoff;
      probability = 90 - (pos / range) * 30; // 90% down to 60%
    } else if (predictedGMR <= college.cutoff * 1.4) {
      probability = 35; // Possible but risky
    } else {
      probability = 5; // Low
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
