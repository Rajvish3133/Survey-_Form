import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Successful",
  "Rejected",
];

const getStatusClass = (status) => {
  switch (status) {
    case "Successful":
      return "border-green-400/30 bg-green-400/10 text-green-300";
    case "In Progress":
      return "border-blue-400/30 bg-blue-400/10 text-blue-300";
    case "Rejected":
      return "border-red-400/30 bg-red-400/10 text-red-300";
    default:
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  }
};

const AdminPanel = () => {
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const loadSurveys = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/surveys/admin/all");
      setSurveys(data.surveys || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load surveys"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingStatus(id);

      const { data } = await api.put(
        `/surveys/admin/${id}`,
        { status }
      );

      setSurveys((prev) =>
        prev.map((survey) =>
          survey._id === id ? data.survey : survey
        )
      );

      setSelectedSurvey((prev) =>
        prev?._id === id ? data.survey : prev
      );

      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteSurvey = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/surveys/admin/${id}`);

      setSurveys((prev) =>
        prev.filter((survey) => survey._id !== id)
      );

      if (selectedSurvey?._id === id) {
        setSelectedSurvey(null);
      }

      toast.success("Survey deleted");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete survey"
      );
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

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        surveys
          .map((survey) => survey.categoryOfWork)
          .filter(Boolean)
      ),
    ];
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    const query = search.trim().toLowerCase();

    return surveys.filter((survey) => {
      const matchesSearch =
        !query ||
        [survey.name, survey.email, survey.mobile]
          .filter(Boolean)
          .some((value) =>
            value.toLowerCase().includes(query)
          );

      const matchesStatus =
        statusFilter === "All" ||
        (survey.status || "Pending") === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        survey.categoryOfWork === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [surveys, search, statusFilter, categoryFilter]);

  const recentEntries = surveys.slice(0, 5);

  const stats = {
    total: surveys.length,
    pending: surveys.filter(
      (survey) => (survey.status || "Pending") === "Pending"
    ).length,
    inProgress: surveys.filter(
      (survey) =>
        (survey.status || "Pending") === "In Progress"
    ).length,
    successful: surveys.filter(
      (survey) =>
        (survey.status || "Pending") === "Successful"
    ).length,
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <header className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">
        <div>
          <h1 className="text-xl font-bold">
            Honelogix Admin
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Survey Management
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/add")}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-cyan-400"
          >
            Add Survey
          </button>

          <button
            onClick={logout}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="space-y-8 p-6 md:p-10">
       
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#111620] p-5">
            <p className="text-sm text-gray-500">
              Total Surveys
            </p>
            <p className="mt-2 text-3xl font-bold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-400/10 bg-[#111620] p-5">
            <p className="text-sm text-gray-500">
              Pending
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-300">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-xl border border-blue-400/10 bg-[#111620] p-5">
            <p className="text-sm text-gray-500">
              In Progress
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-300">
              {stats.inProgress}
            </p>
          </div>

          <div className="rounded-xl border border-green-400/10 bg-[#111620] p-5">
            <p className="text-sm text-gray-500">
              Successful
            </p>
            <p className="mt-2 text-3xl font-bold text-green-300">
              {stats.successful}
            </p>
          </div>
        </section>

      
        <section className="rounded-xl border border-white/10 bg-[#111620]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold">
                Recent Entries
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Latest survey submissions
              </p>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("all-surveys")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-sm text-cyan-300 hover:text-cyan-200"
            >
              View All →
            </button>
          </div>

          <div className="divide-y divide-white/10">
            {recentEntries.length ? (
              recentEntries.map((survey) => (
                <div
                  key={survey._id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-200">
                      {survey.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {survey.categoryOfWork} ·{" "}
                      {survey.workExperience}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(
                        survey.status || "Pending"
                      )}`}
                    >
                      {survey.status || "Pending"}
                    </span>

                    <button
                      onClick={() =>
                        setSelectedSurvey(survey)
                      }
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-gray-500">
                No recent entries.
              </p>
            )}
          </div>
        </section>

     
        <section id="all-surveys">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              All Survey Records
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage submitted survey details and status.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or mobile..."
              className="auth-input"
            />

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="auth-input"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="auth-input"
            >
              <option value="All">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="bg-white/5 text-sm text-gray-300">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category of Work</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Caste</th>
                  <th className="p-4">Sub Caste</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Added By</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSurveys.map((survey) => {
                  const status = survey.status || "Pending";

                  return (
                    <tr
                      key={survey._id}
                      className="border-t border-white/10 text-sm text-gray-400"
                    >
                      <td className="p-4 font-medium text-gray-200">
                        {survey.name}
                      </td>

                      <td className="p-4">
                        {survey.categoryOfWork}
                      </td>

                      <td className="p-4">
                        {survey.workExperience}
                      </td>

                      <td className="p-4">
                        {survey.caste}
                      </td>

                      <td className="p-4">
                        {survey.subCaste || "—"}
                      </td>

                      <td className="p-4">
                        <select
                          value={status}
                          disabled={
                            updatingStatus === survey._id
                          }
                          onChange={(e) =>
                            updateStatus(
                              survey._id,
                              e.target.value
                            )
                          }
                          className={`rounded-md border bg-transparent px-3 py-2 text-xs outline-none ${getStatusClass(
                            status
                          )} disabled:opacity-50`}
                        >
                          {STATUS_OPTIONS.map(
                            (statusOption) => (
                              <option
                                key={statusOption}
                                value={statusOption}
                                className="bg-[#111620] text-white"
                              >
                                {statusOption}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="p-4 capitalize">
                        {survey.addedBy}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setSelectedSurvey(survey)
                            }
                            className="rounded-md border border-white/10 px-3 py-1 text-gray-300 hover:bg-white/5"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/edit/${survey._id}`
                              )
                            }
                            className="rounded-md border border-cyan-400/30 px-3 py-1 text-cyan-300"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteSurvey(survey._id)
                            }
                            className="rounded-md border border-red-400/30 px-3 py-1 text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!loading && !filteredSurveys.length && (
              <p className="p-8 text-center text-gray-500">
                No survey records found.
              </p>
            )}

            {loading && (
              <p className="p-8 text-center text-gray-500">
                Loading survey records...
              </p>
            )}
          </div>
        </section>
      </main>

     
      {selectedSurvey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          onClick={() => setSelectedSurvey(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111620] p-6 shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Survey Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Complete information for{" "}
                  {selectedSurvey.name}
                </p>
              </div>

              <button
                onClick={() => setSelectedSurvey(null)}
                className="text-xl text-gray-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Name" value={selectedSurvey.name} />
              <Detail
                label="Email"
                value={selectedSurvey.email}
              />
              <Detail
                label="Mobile"
                value={selectedSurvey.mobile}
              />
              <Detail
                label="Category"
                value={selectedSurvey.categoryOfWork}
              />
              <Detail
                label="Experience"
                value={selectedSurvey.workExperience}
              />
              <Detail
                label="Caste"
                value={selectedSurvey.caste}
              />
              <Detail
                label="Sub Caste"
                value={selectedSurvey.subCaste || "—"}
              />
              <Detail
                label="Added By"
                value={selectedSurvey.addedBy}
              />

              <div className="sm:col-span-2">
                <Detail
                  label="Status"
                  value={selectedSurvey.status || "Pending"}
                />
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                  About Us
                </p>

                <p className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-gray-300">
                  {selectedSurvey.aboutUs || "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedSurvey(null);
                  navigate(
                    `/admin/edit/${selectedSurvey._id}`
                  );
                }}
                className="rounded-lg border border-cyan-400/30 px-4 py-2 text-sm text-cyan-300"
              >
                Edit Survey
              </button>

              <button
                onClick={() => setSelectedSurvey(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
      {label}
    </p>

    <p className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-gray-200">
      {value || "—"}
    </p>
  </div>
);

export default AdminPanel;
