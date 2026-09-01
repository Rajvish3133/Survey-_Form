import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);

  const loadSurveys = async () => {
    try {
      const { data } = await api.get("/surveys/admin/all");
      setSurveys(data.surveys);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to load surveys"
      );
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const deleteSurvey = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/surveys/admin/${id}`);

      toast.success("Survey deleted");
      loadSurveys();
    } catch (error) {
      toast.error("Unable to delete survey");
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
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">
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
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black"
          >
            Add Survey
          </button>

          <button
            onClick={logout}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 md:p-10">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-white/5 text-sm text-gray-300">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Work</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Caste</th>
                <th className="p-4">Added By</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {surveys.map((survey) => (
                <tr
                  key={survey._id}
                  className="border-t border-white/10 text-sm text-gray-400"
                >
                  <td className="p-4">{survey.name}</td>
                  <td className="p-4">{survey.email}</td>
                  <td className="p-4">{survey.mobile}</td>
                  <td className="p-4">{survey.categoryOfWork}</td>
                  <td className="p-4">{survey.workExperience}</td>
                  <td className="p-4">{survey.caste}</td>
                  <td className="p-4 capitalize">
                    {survey.addedBy}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/edit/${survey._id}`)
                        }
                        className="rounded-md border border-cyan-400/30 px-3 py-1 text-cyan-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteSurvey(survey._id)}
                        className="rounded-md border border-red-400/30 px-3 py-1 text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!surveys.length && (
            <p className="p-8 text-center text-gray-500">
              No survey records found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;