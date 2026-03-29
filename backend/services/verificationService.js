import Incident from '../models/Incident.js';

export const calculateVerificationScore = async (incidentData) => {
  let score = 0;

  // 1. Text Depth (max 30 points)
  if (incidentData.description.length > 100) score += 30;
  else if (incidentData.description.length > 30) score += 15;
  
  // 2. Image Proof (max 30 points)
  if (incidentData.image && incidentData.image.length > 20) {
    score += 30;
  }

  // 3. Location Precision (max 20 points)
  if (incidentData.location && incidentData.location.lat && incidentData.location.lng) {
    score += 20;
  }

  // 4. Time/Duplicate constraints (max 20)
  // Check if similar incident reported nearby within last hour
  if (incidentData.location) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const nearbyDuplicates = await Incident.find({
      'location.lat': { $gte: incidentData.location.lat - 0.05, $lte: incidentData.location.lat + 0.05 },
      'location.lng': { $gte: incidentData.location.lng - 0.05, $lte: incidentData.location.lng + 0.05 },
      createdAt: { $gte: oneHourAgo }
    });

    if (nearbyDuplicates.length > 0) {
      // Multiple reports increase validity!
      score += 20;
    } else {
      score += 10; // First report
    }
  }

  let statusType = 'SUSPICIOUS';
  if (score >= 80) statusType = 'VERIFIED';
  else if (score >= 40) statusType = 'UNDER_REVIEW';

  // Failsafe: Always fallback to UNDER_REVIEW internally if it somehow evaluates incorrectly, or per rules
  // "Fail-safe: -> Always fallback to UNDER_REVIEW"
  if (statusType === 'SUSPICIOUS' && !incidentData.image && incidentData.description.length > 5) {
     statusType = 'UNDER_REVIEW'; // Soften the strictness
  }

  return {
    score,
    statusType
  };
}
