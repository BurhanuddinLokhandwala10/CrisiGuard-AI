// Fallback AI Classification Service
// Normally would call OpenAI API here

export const analyzeCrisisText = async (text) => {
  const lowerText = text.toLowerCase();
  
  let severity = 'MODERATE';
  let urgency = 'MODERATE';
  let type = 'General';

  // Keyword heuristics
  const criticalKeywords = ['fire', 'blood', 'gun', 'shooting', 'explosion', 'dying', 'heart attack', 'unconscious', 'hostage'];
  const highKeywords = ['accident', 'crash', 'robbery', 'injured', 'broken', 'breathing', 'trapped'];
  
  const hasCritical = criticalKeywords.some(kw => lowerText.includes(kw));
  const hasHigh = highKeywords.some(kw => lowerText.includes(kw));

  if (hasCritical) {
    severity = 'CRITICAL';
    urgency = 'IMMEDIATE';
  } else if (hasHigh) {
    severity = 'HIGH';
    urgency = 'HIGH';
  } else if (lowerText.length < 15) {
    severity = 'LOW';
  }

  // Type prediction
  if (lowerText.includes('fire') || lowerText.includes('smoke')) type = 'Fire';
  else if (lowerText.includes('accident') || lowerText.includes('crash')) type = 'Medical/Accident';
  else if (lowerText.includes('gun') || lowerText.includes('robbery') || lowerText.includes('hostage')) type = 'Crime/Violence';
  else if (lowerText.includes('earthquake') || lowerText.includes('flood')) type = 'Natural Disaster';
  
  return {
    severity,
    urgency,
    type,
    analysisComplete: true
  };
};
