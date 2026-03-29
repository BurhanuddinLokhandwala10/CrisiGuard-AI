import Incident from '../models/Incident.js';
import { analyzeCrisisText } from '../services/aiService.js';
import { calculateVerificationScore } from '../services/verificationService.js';

export const createIncident = async (req, res) => {
  try {
    const { title, description, image, location } = req.body;

    if (!description || !location || !location.lat || !location.lng) {
      return res.status(400).json({ message: 'Description and location are required' });
    }

    // 1. AI Analysis
    const aiResult = await analyzeCrisisText(description);

    // 2. Verification Scoring
    const verificationData = await calculateVerificationScore({
      description,
      image,
      location
    });

    const incident = await Incident.create({
      title: title || 'Emergency Report',
      description,
      image,
      location,
      type: aiResult.type,
      severity: aiResult.severity,
      urgency: aiResult.urgency,
      fakeDetectionScore: verificationData.score,
      statusType: verificationData.statusType,
      aiVerified: verificationData.statusType === 'VERIFIED',
      reportedBy: req.user._id,
      status: 'New'
    });

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email');
    if (incident) {
      res.json(incident);
    } else {
      res.status(404).json({ message: 'Incident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
