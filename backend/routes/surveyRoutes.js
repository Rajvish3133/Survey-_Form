import express from "express";

import {
  saveSurvey,
  getMySurvey,
  updateMySurvey,
  getAllSurveys,
  getSurveyById,
  updateSurveyByAdmin,
  addSurveyByAdmin,
  deleteSurvey,
} from "../controllers/surveyController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveSurvey);
router.get("/my", authMiddleware, getMySurvey);
router.put("/my", authMiddleware, updateMySurvey);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllSurveys
);

router.post(
  "/admin/add",
  authMiddleware,
  adminMiddleware,
  addSurveyByAdmin
);

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getSurveyById
);

router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  updateSurveyByAdmin
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  deleteSurvey
);

export default router;