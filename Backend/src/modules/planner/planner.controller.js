import { Planner } from './planner.model.js';

// Get all planners for selection
export const listPlanners = async (req, res) => {
  try {
    const planners = await Planner.find({ userId: req.user.id })
      .select('title isActive lastImported createdAt')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: planners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get specific planner details
export const getPlanner = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { userId: req.user.id };
    
    // If ID is provided, find by ID, otherwise find the active one
    if (id && id !== 'active') {
      query._id = id;
    } else {
      query.isActive = true;
    }

    let planner = await Planner.findOne(query);
    
    // Fallback: If no active plan, get the most recent one
    if (!planner && query.isActive) {
      planner = await Planner.findOne({ userId: req.user.id }).sort({ updatedAt: -1 });
    }

    res.json({ success: true, data: planner || { plans: [], title: 'New Plan' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or Update a specific plan
export const updatePlanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { plans, title, isActive } = req.body;

    if (plans && !Array.isArray(plans)) {
      return res.status(400).json({ success: false, message: 'Plans must be an array' });
    }

    // If isActive is becoming true, deactivate all other plans for this user
    if (isActive) {
      await Planner.updateMany({ userId: req.user.id }, { isActive: false });
    }

    let planner;
    if (id && id !== 'new') {
      // Update existing
      planner = await Planner.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { 
          ...(plans && { plans }),
          ...(title && { title }),
          ...(isActive !== undefined && { isActive }),
          lastImported: new Date()
        },
        { new: true }
      );
    } else {
      // Create new
      planner = await Planner.create({
        userId: req.user.id,
        title: title || 'My Plan',
        plans: plans || [],
        isActive: isActive !== undefined ? isActive : true
      });
    }

    res.json({ success: true, data: planner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Switch active plan
export const setActivePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deactivate all
    await Planner.updateMany({ userId: req.user.id }, { isActive: false });
    
    // Activate specific
    const planner = await Planner.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isActive: true },
      { new: true }
    );

    res.json({ success: true, data: planner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlanner = async (req, res) => {
  try {
    const { id } = req.params;
    await Planner.findOneAndDelete({ _id: id, userId: req.user.id });
    res.json({ success: true, message: 'Planner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
