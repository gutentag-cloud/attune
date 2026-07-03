// Flooding meter: exponentially weighted moving average of turn hostility.
// Proxy for Gottman's diffuse physiological arousal ("flooding") threshold —
// past it, nothing said lands, so ATTUNE calls the break instead of coaching.

export function createMeter({ threshold = 0.72, alpha = 0.35 } = {}) {
  const meter = {
    level: 0,
    threshold,
    flooded: false,
    push(turnResult, { interruption = false } = {}) {
      let signal = turnResult?.intensity ?? 0;
      if (interruption) signal = Math.min(1, signal + 0.12);
      meter.level = alpha * signal + (1 - alpha) * meter.level;
      if (meter.level >= threshold) meter.flooded = true; // latches
      return meter.level;
    },
  };
  return meter;
}
