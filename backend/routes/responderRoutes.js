import express from 'express';
import { getAssignedIncidents, updateIncidentStatus } from '../controllers/responderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { responderOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/incidents')
  .get(protect, responderOnly, getAssignedIncidents);

router.route('/incidents/:id/status')
  .put(protect, responderOnly, updateIncidentStatus);

export default router;
