import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

const casteOptions = {
  General: [
    "Brahmin",
    "Rajput",
    "Kayastha",
    "Other",
  ],

  OBC: [
    "Yadav",
    "Kurmi",
    "Kushwaha",
    "Gurjar",
    "Other",
  ],

  SC: [
    "Jatav",
    "Pasi",
    "Kori",
    "Dhobi",
    "Other",
  ],

  ST: [
    "Gond",
    "Bhil",
    "Kol",
    "Other",
  ],

  Other: [
    "Other",
  ],
};

const workCategories = [
  "Private",
  "Government",
  "Business",
  "Self Employed",
  "Student",
  "Other",
];

const AdminSurveyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [otherSubCaste, setOtherSubCaste] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    categoryOfWork: "",
    aboutUs: "",
    workExperience: "",
    caste: "",
    subCaste: "",
  });

  useEffect(() => {
    if (!id) return;

    const loadSurvey = async () => {
      try {
        const { data } = await api.get(
          `/surveys/admin/${id}`
        );

        const survey = data.survey;

        const availableSubCastes =
          casteOptions[survey.caste] || [];

        const isExistingOption =
          availableSubCastes.includes(survey.subCaste);

        setFormData({
          name: survey.name || "",
          email: survey.email || "",
          mobile: survey.mobile || "",
          categoryOfWork:
            survey.categoryOfWork || "",
          aboutUs: survey.aboutUs || "",
          workExperience:
            survey.workExperience || "",
          caste: survey.caste || "",
          subCaste: isExistingOption
            ? survey.subCaste
            : survey.subCaste
              ? "Other"
              : "",
        });

        if (
          survey.subCaste &&
          !isExistingOption
        ) {
          setOtherSubCaste(survey.subCaste);
        }
      } catch (error) {
        toast.error("Unable to load survey");
      }
    };

    loadSurvey();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const mobile = value.replace(/\D/g, "");

      setFormData((prev) => ({
        ...prev,
        mobile: mobile.slice(0, 10),
      }));

      return;
    }

    if (name === "caste") {
      setFormData((prev) => ({
        ...prev,
        caste: value,
        subCaste: "",
      }));

      setOtherSubCaste("");

      return;
    }

    if (name === "subCaste") {
      setFormData((prev) => ({
        ...prev,
        subCaste: value,
      }));

      if (value !== "Other") {
        setOtherSubCaste("");
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mobile.length !== 10) {
      toast.error(
        "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    if (
      formData.subCaste === "Other" &&
      !otherSubCaste.trim()
    ) {
      toast.error("Please enter your sub caste");
      return;
    }

    const surveyData = {
      ...formData,

      subCaste:
        formData.subCaste === "Other"
          ? otherSubCaste.trim()
          : formData.subCaste,
    };

    try {
      setLoading(true);

      if (isEditing) {
        await api.put(
          `/surveys/admin/${id}`,
          surveyData
        );

        toast.success("Survey updated successfully");
      } else {
        await api.post(
          "/surveys/admin/add",
          surveyData
        );

        toast.success("Survey added successfully");
      }

      navigate("/admin");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save survey"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] px-5 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#111620] p-6 md:p-10">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing
                ? "Edit Survey"
                : "Add Survey"}
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              {isEditing
                ? "Update the survey details."
                : "Add a new survey record."}
            </p>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-gray-400 transition hover:text-white"
          >
            Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2"
        >

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Mobile
            </label>

            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className="auth-input"
              inputMode="numeric"
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Category of Work
            </label>

            <select
              name="categoryOfWork"
              value={formData.categoryOfWork}
              onChange={handleChange}
              className="auth-input"
              required
            >
              <option value="">
                Select category
              </option>

              {workCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Work Experience
            </label>

            <input
              type="text"
              name="workExperience"
              value={formData.workExperience}
              onChange={handleChange}
              placeholder="e.g. 2 years"
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Caste
            </label>

            <select
              name="caste"
              value={formData.caste}
              onChange={handleChange}
              className="auth-input"
              required
            >
              <option value="">
                Select caste
              </option>

              {Object.keys(casteOptions).map(
                (caste) => (
                  <option
                    key={caste}
                    value={caste}
                  >
                    {caste}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Sub Caste
            </label>

            <select
              name="subCaste"
              value={formData.subCaste}
              onChange={handleChange}
              className="auth-input"
              disabled={!formData.caste}
              required
            >
              <option value="">
                Select sub caste
              </option>

              {(
                casteOptions[formData.caste] || []
              ).map((subCaste) => (
                <option
                  key={subCaste}
                  value={subCaste}
                >
                  {subCaste}
                </option>
              ))}
            </select>
          </div>

          {formData.subCaste === "Other" && (
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Enter Sub Caste
              </label>

              <input
                type="text"
                value={otherSubCaste}
                onChange={(e) =>
                  setOtherSubCaste(
                    e.target.value
                  )
                }
                placeholder="Enter your sub caste"
                className="auth-input"
                required
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">
              About Us
            </label>

            <textarea
              name="aboutUs"
              value={formData.aboutUs}
              onChange={handleChange}
              placeholder="About Us"
              rows="4"
              className="auth-input resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 py-3 font-medium transition hover:opacity-90 disabled:opacity-50 md:col-span-2"
          >
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Survey"
                : "Add Survey"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSurveyForm;