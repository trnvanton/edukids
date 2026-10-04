// Role Middleware (Kiểm tra quyền Student, Teacher, Admin)

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này!' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Yêu cầu quyền [${allowedRoles.join(', ')}]. Tài khoản của bạn hiện là [${req.user.role}].`
      });
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
  isStudent: authorizeRoles('student'),
  isTeacher: authorizeRoles('teacher'),
  isAdmin: authorizeRoles('admin')
};
