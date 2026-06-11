/**
 * Async handler wrapper to avoid repetitive try/catch in controllers.
 * Catches promise rejections and forwards to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
