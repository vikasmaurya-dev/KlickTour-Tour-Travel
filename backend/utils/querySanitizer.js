/**
 * Strip $ and . from query parameter keys to prevent NoSQL injection.
 */
export const sanitizeQuery = (obj) => {
  if (!obj || typeof obj !== 'object') return {};
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = key.replace(/[$.]/, '');
    if (typeof value === 'string') {
      clean[safeKey] = value.replace(/[$]/, '');
    } else {
      clean[safeKey] = value;
    }
  }
  return clean;
};

/**
 * Parse and validate pagination parameters.
 * Clamps limit to max 50, ensures page >= 1.
 */
export const parsePagination = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 12;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 50) limit = 50;

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Standard response helper.
 */
export const sendResponse = (res, statusCode, success, data, meta = {}) =>
  res.status(statusCode).json({ success, data, ...meta });
