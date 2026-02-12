function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
}

function teacherOnly(req, res, next) {
  if (!req.user || req.user.role !== "TEACHER") {
    return res.status(403).json({ message: "Teacher only" });
  }
  return next();
}

function adminOrTeacher(req, res, next) {
  if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "TEACHER")) {
    return res.status(403).json({ message: "Admin/Teacher only" });
  }
  return next();
}

function studentOnly(req, res, next) {
  if (!req.user || req.user.role !== "STUDENT") {
    return res.status(403).json({ message: "Student only" });
  }
  return next();
}

module.exports = { adminOnly, teacherOnly, adminOrTeacher, studentOnly };
