import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
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