import Incident from '../models/Incident.js';
import User from '../models/User.js';

export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const overrideIncidentStatus = async (req, res) => {
  try {
    const { statusType } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (incident) {
      incident.statusType = statusType;
      incident.aiVerified = (statusType === 'VERIFIED');
      
      const updatedIncident = await incident.save();
      res.json(updatedIncident);
    } else {
      res.status(404).json({ message: 'Incident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);

    if (incident) {
      res.json({ message: 'Incident removed' });
    } else {
      res.status(404).json({ message: 'Incident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResponders = async (req, res) => {
  try {
    const responders = await User.find({ role: 'responder' }).select('-password');
    res.json(responders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignResponder = async (req, res) => {
  try {
    const { responderDetails } = req.body;
    const incident = await Incident.findById(req.params.id);
    
    if (incident) {
      incident.assignedResponder = responderDetails;
      incident.status = 'Assigned';
      
      const updatedIncident = await incident.save();
      res.json(updatedIncident);
    } else {
      res.status(404).json({ message: 'Incident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
