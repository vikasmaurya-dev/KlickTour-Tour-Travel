import Booking from '../models/Booking.js';
import Contact from '../models/Contact.js';
import Coupon from '../models/Coupon.js';
import Destination from '../models/Destination.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import Review from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Transportation from '../models/Transportation.js';
import AuditLog from '../models/AuditLog.js';
import { createLog } from '../utils/logger.js';

export const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      packagesCount,
      destinationsCount,
      bookings,
      contactsCount,
      usersCount,
      couponsCount,
      wishlistCount,
      reviews,
      hotelsCount,
      transportsCount
    ] = await Promise.all([
      Package.countDocuments(),
      Destination.countDocuments(),
      Booking.find().populate('packageId', 'name'),
      Contact.countDocuments(),
      User.countDocuments(),
      Coupon.countDocuments(),
      Wishlist.countDocuments(),
      Review.find(),
      Hotel.countDocuments(),
      Transportation.countDocuments(),
    ]);

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;
    let todayBookings = 0;
    let monthlyBookings = 0;

    bookings.forEach((booking) => {
      if (booking.status !== 'Cancelled') {
        const price = booking.totalPrice || 0;
        totalRevenue += price;

        const bookingDate = new Date(booking.createdAt);
        if (bookingDate >= today) {
          todayRevenue += price;
          todayBookings++;
        }
        if (bookingDate >= firstDayOfMonth) {
          monthlyRevenue += price;
          monthlyBookings++;
        }
      }
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    const packageCountMap = bookings.reduce((acc, booking) => {
      const name = booking.packageId?.name || 'Unknown Package';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const popularPackages = Object.entries(packageCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get all packages to calculate category distribution
    const allPackages = await Package.find();
    const categoryCounts = allPackages.reduce((acc, pkg) => {
      const cat = pkg.category || 'Adventure';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const categoryChart = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // Monthly data for charts (last 6 months)
    const last6MonthsData = [];
    const allUsers = await User.find();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthRevenue = bookings.reduce((sum, b) => {
        const bDate = new Date(b.createdAt);
        return (b.status !== 'Cancelled' && bDate >= monthStart && bDate <= monthEnd) 
          ? sum + (b.totalPrice || 0) 
          : sum;
      }, 0);

      const monthBookings = bookings.filter(b => {
        const bDate = new Date(b.createdAt);
        return bDate >= monthStart && bDate <= monthEnd;
      }).length;

      const monthUsers = allUsers.filter(u => {
        const uDate = new Date(u.createdAt);
        return uDate >= monthStart && uDate <= monthEnd;
      }).length;

      last6MonthsData.push({ 
        month: monthName, 
        revenue: monthRevenue, 
        bookings: monthBookings,
        users: monthUsers 
      });
    }

    res.json({
      success: true,
      data: {
        packages: packagesCount,
        destinations: destinationsCount,
        hotels: hotelsCount,
        transports: transportsCount,
        bookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'Pending').length,
        confirmedBookings: bookings.filter(b => b.status === 'Confirmed').length,
        cancelledBookings: bookings.filter(b => b.status === 'Cancelled').length,
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        todayBookings,
        monthlyBookings,
        users: usersCount,
        reviews: totalReviews,
        avgRating,
        contacts: contactsCount,
        coupons: couponsCount,
        wishlistItems: wishlistCount,
        popularPackages,
        revenueChart: last6MonthsData,
        categoryChart,
        userGrowthChart: last6MonthsData.map(m => ({ month: m.month, users: m.users }))
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    await User.findByIdAndDelete(req.params.id);
    
    if (userToDelete) {
      await createLog({
        user: req.user._id,
        action: 'User Deletion',
        category: 'User',
        details: `Administrator deleted user: ${userToDelete.email}`,
        status: 'warning'
      }, req);
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role' });
    }

    if (String(req.user._id) === String(req.params.id) && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin access' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await createLog({
      user: req.user._id,
      action: 'User Role Update',
      category: 'User',
      details: `Administrator changed ${updatedUser.email} role to ${role}`,
      status: 'info'
    }, req);

    res.json({ success: true, data: updatedUser, message: 'User role updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const { category, status, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    res.json({ 
      success: true, 
      data: logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: err.message });
  }
};

export const purgeAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    
    await createLog({
      user: req.user._id,
      action: 'Audit Log Purge',
      category: 'Security',
      details: 'Administrator purged all system audit logs',
      status: 'warning'
    }, req);

    res.json({ success: true, message: 'Audit logs purged successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to purge audit logs' });
  }
};
