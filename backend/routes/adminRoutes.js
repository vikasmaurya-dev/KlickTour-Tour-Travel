import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getAnalytics, getUsers, deleteUser, updateUserRole, getAuditLogs, purgeAuditLogs } from '../controllers/adminController.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/audit-logs', protect, adminOnly, getAuditLogs);
router.delete('/audit-logs', protect, adminOnly, purgeAuditLogs);

export default router;
