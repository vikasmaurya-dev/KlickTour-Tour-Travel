import AuditLog from '../models/AuditLog.js';

/**
 * Creates an audit log entry.
 * @param {Object} data - Log data
 * @param {string} data.user - User ID
 * @param {string} data.action - Action performed
 * @param {string} data.category - Category (Security, Package, etc.)
 * @param {string} data.details - Description of the action
 * @param {string} data.status - Status (success, failure, warning, info)
 * @param {Object} req - Request object to extract IP and User-Agent
 */
export const createLog = async ({ user, action, category, details, status = 'success' }, req = null) => {
  try {
    const logData = {
      user,
      action,
      category,
      details,
      status,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'Internal',
      userAgent: req ? req.headers['user-agent'] : 'System'
    };

    await AuditLog.create(logData);
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};
