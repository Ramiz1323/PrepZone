import express from 'express';
import { 
  listPlanners, 
  getPlanner, 
  updatePlanner, 
  setActivePlan, 
  deletePlanner 
} from './planner.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Multi-plan routes
router.get('/list', listPlanners);      // List all plan titles
router.get('/', getPlanner);            // Get active plan
router.get('/:id', getPlanner);         // Get specific plan by ID
router.post('/', updatePlanner);        // Create new plan
router.put('/:id', updatePlanner);      // Update specific plan
router.patch('/:id/active', setActivePlan); // Set a plan as primary
router.delete('/:id', deletePlanner);   // Delete a specific roadmap

export default router;
