import Survey from "../models/Survey.js";
import User from "../models/User.js";

export const saveSurvey = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      categoryOfWork,
      aboutUs,
      workExperience,
      caste,
      subCaste,
    } = req.body;

    if (
      !name ||
      !email ||
      !mobile ||
      !categoryOfWork ||
      !aboutUs ||
      !workExperience ||
      !caste
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingSurvey = await Survey.findOne({
      user: req.user.userId,
    });

    if (existingSurvey) {
      return res.status(400).json({
        message: "Survey already submitted",
      });
    }

    const survey = await Survey.create({
      user: req.user.userId,
      name,
      email,
      mobile,
      categoryOfWork,
      aboutUs,
      workExperience,
      caste,
      subCaste,
      addedBy: "user",
    });

    return res.status(201).json({
      message: "Survey submitted successfully",
      survey,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to submit survey",
    });
  }
};

export const getMySurvey = async (req, res) => {
  try {
    const survey = await Survey.findOne({
      user: req.user.userId,
    });

    return res.json({
      survey,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load survey",
    });
  }
};

export const updateMySurvey = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "mobile",
      "categoryOfWork",
      "aboutUs",
      "workExperience",
      "caste",
      "subCaste",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const survey = await Survey.findOneAndUpdate(
      { user: req.user.userId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!survey) {
      return res.status(404).json({
        message: "Survey not found",
      });
    }

    return res.json({
      message: "Survey updated successfully",
      survey,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to update survey",
    });
  }
};

export const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.json({
      surveys,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load survey records",
    });
  }
};

export const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        message: "Survey not found",
      });
    }

    return res.json({
      survey,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load survey",
    });
  }
};

export const updateSurveyByAdmin = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "mobile",
      "categoryOfWork",
      "aboutUs",
      "workExperience",
      "caste",
      "subCaste",
      "status",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      updates.status !== undefined &&
      !["Pending", "In Progress", "Successful", "Rejected"].includes(
        updates.status
      )
    ) {
      return res.status(400).json({
        message: "Invalid survey status",
      });
    }

    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!survey) {
      return res.status(404).json({
        message: "Survey not found",
      });
    }

    return res.json({
      message: "Survey updated successfully",
      survey,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to update survey",
    });
  }
};

export const addSurveyByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      categoryOfWork,
      aboutUs,
      workExperience,
      caste,
      subCaste,
      status,
    } = req.body;

    if (
      !name ||
      !email ||
      !mobile ||
      !categoryOfWork ||
      !aboutUs ||
      !workExperience ||
      !caste
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const survey = await Survey.create({
      name,
      email,
      mobile,
      categoryOfWork,
      aboutUs,
      workExperience,
      caste,
      subCaste,
      status: status || "Pending",
      addedBy: "admin",
    });

    return res.status(201).json({
      message: "Survey added successfully",
      survey,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to add survey",
    });
  }
};

export const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);

    if (!survey) {
      return res.status(404).json({
        message: "Survey not found",
      });
    }

    return res.json({
      message: "Survey deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete survey",
    });
  }
};