import Incident from '../models/Incident.js';
import User from '../models/User.js';

export const getAssignedIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ assignedResponder: req.user._id })
      .populate('reportedBy', 'name email');
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (incident) {
      if (incident.assignedResponder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return res.status(403).json({ message: 'Not authorized to update this incident' });
      }

      incident.status = status;
      const updatedIncident = await incident.save();
      res.json(updatedIncident);
    } else {
      res.status(404).json({ message: 'Incident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
