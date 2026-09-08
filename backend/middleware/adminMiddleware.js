import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {

    if (req.user?.isHardcodedAdmin && req.user?.role === "admin") {
      req.user = {
        _id: req.user.userId,
        fullName: "Honelogix Admin",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      };

      return next();
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export default adminMiddleware;
