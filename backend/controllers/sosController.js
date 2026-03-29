import Incident from '../models/Incident.js';

export const triggerSOS = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: 'Location is required for SOS' });
    }

    const incident = await Incident.create({
      title: 'SOS Emergency',
      description: 'Immediate SOS triggered by user.',
      location,
      type: 'General',
      severity: 'CRITICAL',
      urgency: 'IMMEDIATE',
      fakeDetectionScore: 100, // SOS is assumed high trust initially, or reviewable
      statusType: 'VERIFIED',
      aiVerified: true,
      reportedBy: req.user._id,
      status: 'New'
    });

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
