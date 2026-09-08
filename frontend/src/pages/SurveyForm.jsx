import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

const casteOptions = {
  General: ["Brahmin", "Rajput", "Kayastha", "Other"],
  OBC: ["Yadav", "Kurmi", "Kushwaha", "Gurjar", "Other"],
  SC: ["Jatav", "Pasi", "Kori", "Dhobi", "Other"],
  ST: ["Gond", "Bhil", "Kol", "Other"],
  Other: ["Other"],
};

const workCategories = [
  "Private",
  "Government",
  "Business",
  "Self Employed",
  "Student",
  "Other",
];

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  categoryOfWork: "",
  aboutUs: "",
  workExperience: "",
  caste: "",
  subCaste: "",
};

const statusInfo = {
  Pending: {
    label: "Pending",
    text: "Your survey has been submitted and is waiting for review.",
    className: "border-yellow-400/20 bg-yellow-400/10 text-yellow-200",
    dot: "bg-yellow-400",
  },
  "In Progress": {
    label: "In Progress",
    text: "Your survey is currently being reviewed.",
    className: "border-blue-400/20 bg-blue-400/10 text-blue-200",
    dot: "bg-blue-400",
  },
  Successful: {
    label: "Successful",
    text: "Your survey has been successfully completed.",
    className: "border-green-400/20 bg-green-400/10 text-green-200",
    dot: "bg-green-400",
  },
  Rejected: {
    label: "Rejected",
    text: "Your survey was not approved. Please contact the administrator for more information.",
    className: "border-red-400/20 bg-red-400/10 text-red-200",
    dot: "bg-red-400",
  },
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SurveyForm = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [otherSubCaste, setOtherSubCaste] = useState("");
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const [userResponse, surveyResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/surveys/my"),
        ]);

        const currentUser = userResponse.data.user;
        const currentSurvey = surveyResponse.data.survey;

        setUser(currentUser);
        setSurvey(currentSurvey);

        if (currentSurvey) {
          setFormFromSurvey(currentSurvey);
        } else {
          setFormData({
            ...emptyForm,
            name: currentUser.fullName || "",
            email: currentUser.email || "",
          });
        }
      } catch (error) {
        toast.error("Unable to load your details");
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, []);

  const setFormFromSurvey = (currentSurvey) => {
    const options = casteOptions[currentSurvey.caste] || [];
    const isKnownSubCaste = options.includes(currentSurvey.subCaste);

    setFormData({
      name: currentSurvey.name || "",
      email: currentSurvey.email || "",
      mobile: currentSurvey.mobile || "",
      categoryOfWork: currentSurvey.categoryOfWork || "",
      aboutUs: currentSurvey.aboutUs || "",
      workExperience: currentSurvey.workExperience || "",
      caste: currentSurvey.caste || "",
      subCaste: isKnownSubCaste
        ? currentSurvey.subCaste
        : currentSurvey.subCaste
          ? "Other"
          : "",
    });

    setOtherSubCaste(
      currentSurvey.subCaste && !isKnownSubCaste
        ? currentSurvey.subCaste
        : ""
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      setFormData((prev) => ({
        ...prev,
        mobile: value.replace(/\D/g, "").slice(0, 10),
      }));
      return;
    }

    if (name === "caste") {
      setFormData((prev) => ({ ...prev, caste: value, subCaste: "" }));
      setOtherSubCaste("");
      return;
    }

    if (name === "subCaste") {
      setFormData((prev) => ({ ...prev, subCaste: value }));
      if (value !== "Other") setOtherSubCaste("");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    if (survey) setFormFromSurvey(survey);
    setPage("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (formData.subCaste === "Other" && !otherSubCaste.trim()) {
      toast.error("Please enter your sub caste");
      return;
    }

    const dataToSend = {
      ...formData,
      subCaste:
        formData.subCaste === "Other"
          ? otherSubCaste.trim()
          : formData.subCaste,
    };

    try {
      setSaving(true);

      if (survey) {
        const response = await api.put("/surveys/my", dataToSend);
        setSurvey(response.data.survey);
        setFormFromSurvey(response.data.survey);
        toast.success("Survey updated successfully");
      } else {
        const response = await api.post("/surveys", dataToSend);
        setSurvey(response.data.survey);
        setFormFromSurvey(response.data.survey);
        toast.success("Survey submitted successfully");
      }

      setPage("dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save survey"
      );
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] text-gray-400">
        Loading your survey...
      </div>
    );
  }

  const currentStatus = statusInfo[survey?.status] || statusInfo.Pending;

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <div>
            <h1 className="text-xl font-bold tracking-[0.14em]">HONELOGIX</h1>
            <p className="mt-1 text-[9px] tracking-[0.3em] text-gray-500">
              SURVEY PORTAL
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        {page === "dashboard" && (
          <Dashboard
            user={user}
            survey={survey}
            status={currentStatus}
            onView={() => setPage("details")}
            onEdit={startEditing}
            onStart={() => setPage("form")}
          />
        )}

        {page === "details" && (
          <Details
            survey={survey}
            onBack={() => setPage("dashboard")}
            onEdit={startEditing}
          />
        )}

        {page === "form" && (
          <SurveyEditor
            survey={survey}
            formData={formData}
            otherSubCaste={otherSubCaste}
            saving={saving}
            onChange={handleChange}
            onOtherSubCasteChange={setOtherSubCaste}
            onSubmit={handleSubmit}
            onBack={() => setPage("dashboard")}
          />
        )}
      </main>
    </div>
  );
};

const Dashboard = ({ user, survey, status, onView, onEdit, onStart }) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-cyan-300">Welcome back</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">
          {user?.fullName || "Welcome"} 👋
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          View your survey information and check its current status here.
        </p>
      </div>

      {!survey ? (
        <div className="rounded-2xl border border-white/10 bg-[#111620] p-7 md:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">
            📝
          </div>
          <h3 className="mt-5 text-xl font-semibold">Complete your survey</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
            Your survey has not been submitted yet. Add your information to get started.
          </p>
          <button
            onClick={onStart}
            className="mt-6 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Start Survey
          </button>
        </div>
      ) : (
        <>
          <section className={`rounded-2xl border p-6 md:p-7 ${status.className}`}>
            <p className="text-sm opacity-80">Your Survey Status</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${status.dot}`} />
              <h3 className="text-2xl font-bold">{status.label}</h3>
            </div>
            <p className="mt-2 max-w-2xl text-sm opacity-80">{status.text}</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111620] p-6 md:p-7">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-semibold">Your Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  A quick look at the details you submitted.
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Submitted {formatDate(survey.createdAt)}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Name" value={survey.name} />
              <InfoItem label="Mobile" value={survey.mobile} />
              <InfoItem label="Category of Work" value={survey.categoryOfWork} />
              <InfoItem label="Work Experience" value={survey.workExperience} />
              <InfoItem label="Caste" value={survey.caste} />
              <InfoItem label="Sub Caste" value={survey.subCaste || "-"} />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onView}
                className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-200 transition hover:bg-white/5"
              >
                View Full Details
              </button>
              <button
                onClick={onEdit}
                className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-200"
              >
                Edit Information
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="rounded-xl border border-white/5 bg-[#0d1119] px-4 py-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-gray-200">{value || "-"}</p>
  </div>
);

const Details = ({ survey, onBack, onEdit }) => {
  const status = statusInfo[survey?.status] || statusInfo.Pending;

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="mb-5 text-sm text-gray-400 transition hover:text-white"
      >
        ← Back to Dashboard
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#111620] p-6 md:p-9">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm text-cyan-300">My Survey</p>
            <h2 className="mt-1 text-3xl font-bold">Full Details</h2>
            <p className="mt-2 text-sm text-gray-400">
              These are the details currently saved in your survey.
            </p>
          </div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${status.className}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <InfoItem label="Name" value={survey.name} />
          <InfoItem label="Email" value={survey.email} />
          <InfoItem label="Mobile" value={survey.mobile} />
          <InfoItem label="Category of Work" value={survey.categoryOfWork} />
          <InfoItem label="Work Experience" value={survey.workExperience} />
          <InfoItem label="Caste" value={survey.caste} />
          <InfoItem label="Sub Caste" value={survey.subCaste || "-"} />
          <InfoItem label="Submitted On" value={formatDate(survey.createdAt)} />
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-[#0d1119] p-4">
          <p className="text-xs text-gray-500">About You</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
            {survey.aboutUs || "-"}
          </p>
        </div>

        <button
          onClick={onEdit}
          className="mt-7 rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-200"
        >
          Edit Information
        </button>
      </div>
    </div>
  );
};

const SurveyEditor = ({
  survey,
  formData,
  otherSubCaste,
  saving,
  onChange,
  onOtherSubCasteChange,
  onSubmit,
  onBack,
}) => {
  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="mb-5 text-sm text-gray-400 transition hover:text-white"
      >
        ← Back to Dashboard
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#111620] p-6 shadow-xl md:p-9">
        <div>
          <p className="text-sm text-cyan-300">Survey Form</p>
          <h2 className="mt-1 text-3xl font-bold">
            {survey ? "Update Your Information" : "Complete Your Survey"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Please enter your details carefully. You can update them later if needed.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-8">
          <FormSection title="Personal Information" description="Tell us how we can identify and contact you.">
            <Field label="Name">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                className="auth-input"
                placeholder="Enter your full name"
                required
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                className="auth-input"
                placeholder="Enter your email"
                required
              />
            </Field>

            <Field label="Mobile">
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={onChange}
                className="auth-input"
                placeholder="10-digit mobile number"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </Field>
          </FormSection>

          <FormSection title="Work Information" description="Add your current work or professional details.">
            <Field label="Category of Work">
              <select
                name="categoryOfWork"
                value={formData.categoryOfWork}
                onChange={onChange}
                className="auth-input"
                required
              >
                <option value="">Select category</option>
                {workCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Work Experience">
              <input
                type="text"
                name="workExperience"
                value={formData.workExperience}
                onChange={onChange}
                className="auth-input"
                placeholder="e.g. 2 years"
                required
              />
            </Field>
          </FormSection>

          <FormSection title="Other Information" description="A few additional details help us complete your survey.">
            <Field label="Caste">
              <select
                name="caste"
                value={formData.caste}
                onChange={onChange}
                className="auth-input"
                required
              >
                <option value="">Select caste</option>
                {Object.keys(casteOptions).map((caste) => (
                  <option key={caste} value={caste}>
                    {caste}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sub Caste">
              <select
                name="subCaste"
                value={formData.subCaste}
                onChange={onChange}
                className="auth-input"
                disabled={!formData.caste}
                required
              >
                <option value="">Select sub caste</option>
                {(casteOptions[formData.caste] || []).map((subCaste) => (
                  <option key={subCaste} value={subCaste}>
                    {subCaste}
                  </option>
                ))}
              </select>
            </Field>

            {formData.subCaste === "Other" && (
              <Field label="Enter Sub Caste">
                <input
                  type="text"
                  value={otherSubCaste}
                  onChange={(e) => onOtherSubCasteChange(e.target.value)}
                  className="auth-input"
                  placeholder="Enter your sub caste"
                  required
                />
              </Field>
            )}

            <div className="sm:col-span-2">
              <Field label="About You">
                <textarea
                  name="aboutUs"
                  value={formData.aboutUs}
                  onChange={onChange}
                  rows="5"
                  placeholder="Tell us a little about yourself..."
                  className="auth-input resize-none"
                  required
                />
              </Field>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-white/10 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-7 py-3 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : survey ? "Save Changes" : "Submit Survey"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormSection = ({ title, description, children }) => (
  <section>
    <div className="mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
  </section>
);

const Field = ({ label, children }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    {children}
  </div>
);

export default SurveyForm;
