module.exports = {
  // require user to login
  requireLogin: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  },

  // check if its guest, then ask user to login,
  // if already logged in then redirecting to profile page
  ensureGuest: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.redirect("/profile");
    } else {
      return next();
    }
  },
};
