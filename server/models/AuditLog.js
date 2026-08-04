const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorEmail: String,
    action: {
      type: String,
      required: true,
    },
    targetType: String,
    targetId: String,
    details: Object,
    ipAddress: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
