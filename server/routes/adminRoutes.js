const express = require('express');
const {
  getAdminStats,
  getUsers,
  deleteUser,
  getPendingCompanies,
  verifyCompany,
  moderateJob,
  getAuditLogs,
  getSubscriptions,
  updateSubscription,
  getReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/companies/pending', getPendingCompanies);
router.put('/companies/:id/verify', verifyCompany);

router.put('/jobs/:id/moderate', moderateJob);

router.get('/audit-logs', getAuditLogs);
router.get('/subscriptions', getSubscriptions);
router.put('/subscriptions/:id', updateSubscription);
router.get('/reports', getReports);

module.exports = router;
