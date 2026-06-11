/**
 * Custom Mongo Sanitize Middleware for Express 5 compatibility.
 * Modifies objects in-place to avoid "Cannot set property query" errors.
 */
const hasMongoKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  return Object.keys(obj).some(key => key.startsWith('$') || key.includes('.'));
};

const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    obj.forEach(item => sanitize(item));
    return obj;
  }

  for (const key in obj) {
    if (key.startsWith('$') || key.includes('.')) {
      console.log(`[Sanitizer] Removing prohibited key: ${key}`);
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitize(obj[key]);
    }
  }
  return obj;
};

export const mongoSanitizeCustom = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};
