// Deterministic seeded random — same doc ID always gives same ML result
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  }
  return (Math.abs(hash) % 100000) / 100000;
}

function seededRange(seed, min, max) {
  return min + seededRandom(seed) * (max - min);
}

const ROAD_TYPES = ['Lane', 'Residential', 'Main Road', 'Highway'];

/**
 * Mock ML analysis using the paper's priority formula:
 * J = w1 × (Ap/Amax) / (Rw/Rmax) + w2 × Td
 * w1=0.6, w2=0.4, Amax=500, Rmax=12
 */
export function runMockML(reportId) {
  const W1 = 0.6, W2 = 0.4, AMAX = 500, RMAX = 12;
  const SEVERITIES = ['Minor', 'Medium', 'Major'];

  const severity = SEVERITIES[Math.floor(seededRandom(reportId + '_sev') * 3)];
  const Ap = parseFloat(seededRange(reportId + '_ap', 20, AMAX).toFixed(1));
  const Rw = parseFloat(seededRange(reportId + '_rw', 3, RMAX).toFixed(1));
  const Td = parseFloat(seededRandom(reportId + '_td').toFixed(3));
  const J  = parseFloat((W1 * ((Ap / AMAX) / (Rw / RMAX)) + W2 * Td).toFixed(4));

  const roadType = ROAD_TYPES[Math.floor(seededRandom(reportId + '_rt') * 4)];

  // Map J score to urgency label
  let urgency;
  if (J >= 1.2)      urgency = 'Critical';
  else if (J >= 0.7) urgency = 'High';
  else if (J >= 0.35) urgency = 'Medium';
  else               urgency = 'Low';

  // Pothole size label
  const size = urgency === 'Critical' ? 'Critical'
    : severity === 'Major'  ? 'Large'
    : severity === 'Medium' ? 'Medium' : 'Small';

  // Normalise J to 0-100 priority score for the progress bar
  const priority = Math.min(100, Math.round(J * 55));

  return { severity, Ap, Rw, Td, J, roadType, urgency, size, priority };
}

// Colour helpers used across components
export const URGENCY_COLORS = {
  Critical: { bg: 'bg-purple-100', text: 'text-purple-700', dot: '#7c3aed', hex: '#7c3aed' },
  High:     { bg: 'bg-red-100',    text: 'text-red-600',    dot: '#ef4444', hex: '#ef4444' },
  Medium:   { bg: 'bg-orange-100', text: 'text-orange-600', dot: '#f97316', hex: '#f97316' },
  Low:      { bg: 'bg-green-100',  text: 'text-green-600',  dot: '#22c55e', hex: '#22c55e' },
};

export const STATUS_COLORS = {
  Reported: 'bg-slate-100 text-slate-600',
  Assigned: 'bg-amber-100 text-amber-700',
  Verified: 'bg-blue-100  text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
};
