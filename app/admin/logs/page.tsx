"use client";

import { useEffect, useState } from "react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);
    const res = await fetch("/api/admin/logs");
    const data = await res.json();
    setLogs(data.logs || []);
    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  // Badge color classes
  function badgeColor(action: string) {
    switch (action) {
      case "CHECKIN":
        return "bg-green-100 text-green-700";
      case "CHECKOUT":
        return "bg-pink-100 text-pink-700";
      case "SIGNUP":
        return "bg-blue-100 text-blue-700";
      case "ADJUST":
        return "bg-yellow-100 text-yellow-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // Apply search + date filter
  const filteredLogs = logs.filter((log) => {
    const textMatch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    if (!textMatch) return false;

    if (filter === "ALL") return true;

    const created = new Date(log.createdAt);
    const now = new Date();

    if (filter === "TODAY") {
      return created.toDateString() === now.toDateString();
    }

    if (filter === "7DAYS") {
      const diff = now.getTime() - created.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }

    if (filter === "30DAYS") {
      const diff = now.getTime() - created.getTime();
      return diff <= 30 * 24 * 60 * 60 * 1000;
    }

    return true;
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-rose-600">Activity Logs</h1>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">

        <input
          className="border p-2 rounded-lg w-full md:w-64"
          placeholder="Search logs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-lg border ${
              filter === "ALL" ? "bg-rose-600 text-white" : "bg-white"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("TODAY")}
            className={`px-3 py-1 rounded-lg border ${
              filter === "TODAY" ? "bg-rose-600 text-white" : "bg-white"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setFilter("7DAYS")}
            className={`px-3 py-1 rounded-lg border ${
              filter === "7DAYS" ? "bg-rose-600 text-white" : "bg-white"
            }`}
          >
            Last 7 Days
          </button>

          <button
            onClick={() => setFilter("30DAYS")}
            className={`px-3 py-1 rounded-lg border ${
              filter === "30DAYS" ? "bg-rose-600 text-white" : "bg-white"
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading logs...</p>
      ) : filteredLogs.length === 0 ? (
        <p>No logs match your filters.</p>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-rose-50 border-b">
              <tr>
                <th className="p-3 font-semibold text-gray-700">Action</th>
                <th className="p-3 font-semibold text-gray-700">Details</th>
                <th className="p-3 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-rose-50/50">
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-sm rounded-lg ${badgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3">{log.details}</td>

                  <td className="p-3 text-gray-500 text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
