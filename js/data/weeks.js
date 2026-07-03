// Eight weeks of SIMULATED signature data for the demo household.
// Clearly labeled in the UI. Weeks 6–8 show the validated early-warning
// pattern: fights aren't more frequent — repairs are slower.

export const SIMULATED = true;

export const WEEKS = [
  { week: 1, escalationVelocity: 0.34, repairLatencyHrs: 3.5,  warmthToCriticism: 5.6, stonewallCount: 1 },
  { week: 2, escalationVelocity: 0.31, repairLatencyHrs: 4.0,  warmthToCriticism: 5.2, stonewallCount: 1 },
  { week: 3, escalationVelocity: 0.36, repairLatencyHrs: 3.8,  warmthToCriticism: 4.8, stonewallCount: 2 },
  { week: 4, escalationVelocity: 0.40, repairLatencyHrs: 4.2,  warmthToCriticism: 4.1, stonewallCount: 2 },
  { week: 5, escalationVelocity: 0.47, repairLatencyHrs: 5.0,  warmthToCriticism: 3.4, stonewallCount: 3 },
  { week: 6, escalationVelocity: 0.52, repairLatencyHrs: 7.5,  warmthToCriticism: 2.7, stonewallCount: 4 },
  { week: 7, escalationVelocity: 0.55, repairLatencyHrs: 11.0, warmthToCriticism: 2.1, stonewallCount: 5 },
  { week: 8, escalationVelocity: 0.61, repairLatencyHrs: 16.0, warmthToCriticism: 1.8, stonewallCount: 6 },
];
