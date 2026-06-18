const rateLimit = new Map();
const LIMIT = parseInt(process.env.API_RATE_LIMIT) || 100;
const WINDOW = 60 * 1000; // 1 minute

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const times = rateLimit.get(ip).filter(t => now - t < WINDOW);
  
  if (times.length >= LIMIT) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  times.push(now);
  rateLimit.set(ip, times);
  
  // Cleanup old entries
  if (rateLimit.size > 1000) {
    for (const [key, val] of rateLimit.entries()) {
      rateLimit.set(key, val.filter(t => now - t < WINDOW));
    }
  }
  
  next();
};
