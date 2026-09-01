import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const SurveyForm = () => {
  const navigate = useNavigate();

  const [surveyId, setSurveyId] = useState(null);
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
    const loadData = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        const surveyResponse = await api.get("/surveys/my");

        const user = userResponse.data.user;
        const survey = surveyResponse.data.survey;

        if (survey) {
          setSurveyId(survey._id);

          const availableSubCastes =
            casteOptions[survey.caste] || [];

          const isPredefinedSubCaste =
            availableSubCastes.includes(survey.subCaste);

          setFormData({
            name: survey.name || "",
            email: survey.email || "",
            mobile: survey.mobile || "",
            categoryOfWork: survey.categoryOfWork || "",
            aboutUs: survey.aboutUs || "",
            workExperience: survey.workExperience || "",
            caste: survey.caste || "",
            subCaste: isPredefinedSubCaste
              ? survey.subCaste
              : survey.subCaste
                ? "Other"
                : "",
          });

          if (
            survey.subCaste &&
            !isPredefinedSubCaste
          ) {
            setOtherSubCaste(survey.subCaste);
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            name: user.fullName || "",
            email: user.email || "",
          }));
        }
      } catch (error) {
        toast.error("Unable to load your details");
      }
    };

    loadData();
  }, []);

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

    const finalFormData = {
      ...formData,
      subCaste:
        formData.subCaste === "Other"
          ? otherSubCaste.trim()
          : formData.subCaste,
    };

    try {
      setLoading(true);

      if (surveyId) {
        await api.put("/surveys/my", finalFormData);

        toast.success("Survey updated successfully");
      } else {
        const { data } = await api.post(
          "/surveys",
          finalFormData
        );

        setSurveyId(data.survey._id);

        toast.success("Survey submitted successfully");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save survey"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");

     toast.success("Logged out successfully");

      navigate("/login");
    } catch (error) {
      toast.error("Unable to logout");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <div>
          <h1 className="text-xl font-bold tracking-[0.14em]">
            HONELOGIX
          </h1>

          <p className="mt-1 text-[9px] tracking-[0.3em] text-gray-500">
            SURVEY FORM
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-white/10 px-5 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          Logout
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="rounded-2xl border border-white/10 bg-[#111620] p-6 shadow-xl md:p-10">
          <div>
            <h2 className="text-3xl font-bold">
              {surveyId
                ? "Your Survey Details"
                : "Complete Your Survey"}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Please provide the details below.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2"
          >

            <div>
              <label className="text-sm text-gray-300">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">
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
              <label className="text-sm text-gray-300">
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

                {workCategories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">
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
              <label className="text-sm text-gray-300">
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
              <label className="text-sm text-gray-300">
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

                {(casteOptions[formData.caste] || []).map(
                  (subCaste) => (
                    <option
                      key={subCaste}
                      value={subCaste}
                    >
                      {subCaste}
                    </option>
                  )
                )}
              </select>
            </div>

            {formData.subCaste === "Other" && (
              <div>
                <label className="text-sm text-gray-300">
                  Enter Sub Caste
                </label>

                <input
                  type="text"
                  value={otherSubCaste}
                  onChange={(e) =>
                    setOtherSubCaste(e.target.value)
                  }
                  placeholder="Enter your sub caste"
                  className="auth-input"
                  required
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">
                About Us
              </label>

              <textarea
                name="aboutUs"
                value={formData.aboutUs}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us a little about yourself..."
                className="auth-input resize-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 py-3 font-medium transition hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : surveyId
                    ? "Update Survey"
                    : "Submit Survey"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SurveyForm;