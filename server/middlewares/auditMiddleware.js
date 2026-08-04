const AuditLog = require('../models/AuditLog');

const logAudit = async (actorId, actorEmail, action, targetType, targetId, details = {}, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await AuditLog.create({
      actor: actorId || null,
      actorEmail: actorEmail || 'system@jobportal.com',
      action,
      targetType,
      targetId: targetId ? targetId.toString() : '',
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog Error]:', err.message);
  }
};

module.exports = { logAudit };
