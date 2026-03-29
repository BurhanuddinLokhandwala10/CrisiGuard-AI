import express from 'express';
import { getAllIncidents, overrideIncidentStatus, deleteIncident, getResponders, assignResponder } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/incidents')
  .get(protect, adminOnly, getAllIncidents);

router.route('/incidents/:id')
  .put(protect, adminOnly, overrideIncidentStatus)
  .delete(protect, adminOnly, deleteIncident);

router.route('/incidents/:id/assign')
  .post(protect, adminOnly, assignResponder);

router.route('/responders')
  .get(protect, adminOnly, getResponders);

export default router;
