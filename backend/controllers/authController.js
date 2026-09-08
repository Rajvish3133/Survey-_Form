import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = createToken({
      userId: user._id.toString(),
      role: "user",
    });

    setTokenCookie(res, token);

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (
      email.trim().toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = createToken({
        userId: process.env.HARD_CODED_ADMIN_ID,
        role: "admin",
        isHardcodedAdmin: true,
      });

      setTokenCookie(res, token);

      return res.json({
        message: "Login successful",
        user: {
          id: process.env.HARD_CODED_ADMIN_ID,
          fullName: "Honelogix Admin",
          email: process.env.ADMIN_EMAIL,
          role: "admin",
        },
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = createToken({
      userId: user._id.toString(),
      role: user.role,
    });

    setTokenCookie(res, token);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.json({
    message: "Logged out successfully",
  });
};

export const getMe = async (req, res) => {
  try {
    if (req.user?.isHardcodedAdmin) {
      return res.json({
        user: {
          id: process.env.HARD_CODED_ADMIN_ID,
          fullName: "Honelogix Admin",
          email: process.env.ADMIN_EMAIL,
          role: "admin",
        },
      });
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
