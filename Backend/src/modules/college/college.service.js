import College from './college.model.js';
import { logger } from '../../shared/utils/logger.js';

/**
 * Service to fetch all colleges
 */
export const getAllColleges = async () => {
  return await College.find({}).sort({ cutoff: 1 });
};

/**
 * Seed colleges into the database if empty
 */
export const seedColleges = async () => {
  try {
    const count = await College.countDocuments();
    if (count > 0) {
      logger.info('Colleges already seeded. Skipping...');
      return;
    }

    const initialColleges = [
      { name: 'Jadavpur University (JU)', cutoff: 30, minCutoff: 1, location: 'Kolkata', type: 'Govt', tier: '🥇 TOP TIER' },
      { name: 'MAKAUT (WBUT Main Campus)', cutoff: 250, minCutoff: 50, location: 'Haringhata', type: 'Govt', tier: '🥇 TOP TIER' },
      { name: 'University of Calcutta (CU)', cutoff: 850, minCutoff: 170, location: 'Kolkata', type: 'Govt', tier: '🥇 TOP TIER' },
      { name: 'University of Kalyani', cutoff: 600, minCutoff: 200, location: 'Kalyani', type: 'Govt', tier: '🥈 GOOD GOVT' },
      { name: 'Kalyani Govt Engg College (KGEC)', cutoff: 800, minCutoff: 80, location: 'Kalyani', type: 'Govt', tier: '🥈 GOOD GOVT' },
      { name: 'Jalpaiguri Govt Engg College (JGEC)', cutoff: 1500, minCutoff: 800, location: 'Jalpaiguri', type: 'Govt', tier: '🥈 GOOD GOVT' },
      { name: 'IEM Kolkata', cutoff: 1000, minCutoff: 200, location: 'Kolkata', type: 'Private', tier: '🥉 PRIVATE (GOOD ROI)' },
      { name: 'UEM Kolkata', cutoff: 1200, minCutoff: 300, location: 'Kolkata', type: 'Private', tier: '🥉 PRIVATE (GOOD ROI)' },
      { name: 'Heritage Institute of Tech (HIT)', cutoff: 2000, minCutoff: 500, location: 'Kolkata', type: 'Private', tier: '🥉 PRIVATE (GOOD ROI)' },
      { name: 'RCC Institute of IT (RCCIIT)', cutoff: 2000, minCutoff: 1300, location: 'Kolkata', type: 'Govt Aided', tier: '🥉 PRIVATE (GOOD ROI)' },
      { name: 'Techno Main Salt Lake', cutoff: 3500, minCutoff: 2500, location: 'Kolkata', type: 'Private', tier: '🧪 BACKUP' },
      { name: 'Haldia Institute of Tech (HIT)', cutoff: 3000, minCutoff: 2000, location: 'Haldia', type: 'Private', tier: '🧪 BACKUP' },
      { name: 'Netaji Subhash Engg College (NSEC)', cutoff: 3000, minCutoff: 1500, location: 'Kolkata', type: 'Private', tier: '🧪 BACKUP' },
      { name: 'Techno India Hooghly', cutoff: 5500, minCutoff: 3000, location: 'Hooghly', type: 'Private', tier: '🧪 BACKUP' },
    ];

    await College.insertMany(initialColleges);
    logger.info(`Successfully seeded ${initialColleges.length} colleges!`);
  } catch (error) {
    logger.error('Error seeding colleges:', error);
  }
};
