import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // Base64 or URL
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  type: { type: String, default: 'General' },
  severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'MODERATE' },
  urgency: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'IMMEDIATE'], default: 'MODERATE' },
  
  // Verification and AI
  fakeDetectionScore: { type: Number, default: 0 },
  aiVerified: { type: Boolean, default: false },
  statusType: { type: String, enum: ['VERIFIED', 'UNDER_REVIEW', 'SUSPICIOUS'], default: 'UNDER_REVIEW' },
  
  // Resolution tracking
  status: { type: String, enum: ['New', 'Assigned', 'En Route', 'Resolved', 'Closed'], default: 'New' },
  
  // References
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedResponder: {
    name: String,
    type: { type: String }, // e.g. 'hospital', 'police'
    dist: Number // approximate distance if known
  },
}, { timestamps: true });

export default mongoose.model('Incident', incidentSchema);
