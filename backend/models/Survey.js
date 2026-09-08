import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    categoryOfWork: {
      type: String,
      required: true,
      trim: true,
    },

    aboutUs: {
      type: String,
      required: true,
      trim: true,
    },

    workExperience: {
      type: String,
      required: true,
      trim: true,
    },

    caste: {
      type: String,
      required: true,
      trim: true,
    },

    subCaste: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Successful", "Rejected"],
      default: "Pending",
    },

    addedBy: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const Survey = mongoose.model("Survey", surveySchema);

export default Survey;