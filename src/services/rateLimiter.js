// Basic in-memory rate limiter
const limits = new Map();

/**
 * rateLimiter middleware
 * @param {Number} limit - max requests
 * @param {Number} windowMs - time window in ms
 */
function rateLimiter(limit = 5, windowMs = 10000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!limits.has(ip)) {
      limits.set(ip, []);
    }

    const timestamps = limits.get(ip).filter(ts => now - ts < windowMs);
    timestamps.push(now);
    limits.set(ip, timestamps);

    if (timestamps.length > limit) {
      return res.status(429).json({ error: 'Too many requests, please slow down.' });
    }

    next();
  };
}

module.exports = rateLimiter;
