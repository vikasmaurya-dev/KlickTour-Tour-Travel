import cron from 'node-cron';
import AuditLog from '../models/AuditLog.js';

export const initCronJobs = () => {
  // Schedule a job to run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled job: Purging old audit logs...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await AuditLog.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`Scheduled job completed: ${result.deletedCount} old audit logs deleted.`);
      } else {
        console.log('Scheduled job completed: No old audit logs to delete.');
      }
    } catch (err) {
      console.error('Error during scheduled audit log purge:', err);
    }
  });
};
