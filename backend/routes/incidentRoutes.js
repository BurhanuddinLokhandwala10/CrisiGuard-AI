import express from 'express';
import { createIncident, getIncidents, getIncidentById } from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createIncident)
  .get(protect, getIncidents);

router.route('/:id')
  .get(protect, getIncidentById);

export default router;
