import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

const AssignedIssues = () => {
  const [issues, setIssues] = useState([]);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = () => {
    axios.defaults.withCredentials = true;
    axios
      .get("http://localhost:3000/assigned-issues")
      .then((res) => {
        setIssues(res.data.issues || []);
      })
      .catch((err) => {
        console.error("Error fetching assigned issues:", err);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleResolve = async (issueId) => {
    try {
      await axios.patch(
        `http://localhost:3000/issues/${issueId}`,
        { status: "resolved", remark },
        { withCredentials: true }
      );
      fetchIssues();
      setExpandedIssue(null);
      setRemark("");
    } catch (err) {
      console.error("Error resolving issue:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-800 text-center">
            🛠️ Assigned Maintenance Tasks
          </h2>
        </div>

        {issues.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm max-w-md mx-auto">
            <p className="text-gray-600 text-lg">
              No maintenance tasks assigned to you yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="bg-indigo-50 px-4 py-3 border-b flex justify-between items-center">
                  <div className="text-gray-800 font-medium">
                    Floor {issue.floor} | Room {issue.room}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(issue.status)}`}>
                    {issue.status === "resolved" ? "Resolved" : "Pending"}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-indigo-700">{issue.device}</h3>
                  <p className="text-gray-600 mt-1">{issue.description}</p>

                  <div className="mt-3 text-sm text-gray-500 space-y-1">
                    <p><strong>Priority:</strong> <span className={`${issue.priority === "High" ? "text-red-600" : "text-gray-700"}`}>{issue.priority}</span></p>
                    <p><strong>Reported:</strong> {format(new Date(issue.created_at), "MMM d, yyyy")}</p>
                  </div>

                  {/* Remarks Section */}
                  {expandedIssue === issue.id && issue.status !== "resolved" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Add Remark</label>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Describe your fix..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-end">
                    {issue.status !== "resolved" && (
                      <>
                        {expandedIssue === issue.id ? (
                          <button
                            onClick={() => handleResolve(issue.id)}
                            disabled={remark.trim() === ""}
                            className={`px-4 py-2 rounded-md text-white font-medium ${
                              remark.trim() === ""
                                ? "bg-emerald-300 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            Resolve
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setExpandedIssue(issue.id);
                              setRemark(issue.remark || "");
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {issue.remark && (
                    <div className="mt-4 border-t pt-3 text-sm text-gray-600">
                      <strong>Remark:</strong> {issue.remark}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedIssues;
