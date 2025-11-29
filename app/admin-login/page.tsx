"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");

    // 💡 Set your admin password here (change anytime)
    const ADMIN_PASSWORD = "Nails@yeah1";

    if (password !== ADMIN_PASSWORD) {
      setError("❌ Incorrect password");
      return;
    }

    // Set cookie for middleware to allow admin access
    document.cookie = "admin-auth=true; path=/; max-age=86400"; // 1 day

    router.push("/admin");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-rose-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-4 border">

        <h1 className="text-2xl font-bold text-center text-rose-600">
          Admin Login
        </h1>

        <p className="text-center text-gray-600 text-sm">
          Access restricted • Staff only
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border p-3 rounded-lg placeholder-gray-500"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-lg font-semibold"
          >
            Login
          </button>

          {error && (
            <p className="text-center text-red-600 font-medium pt-2">{error}</p>
          )}
        </form>

      </div>
    </main>
  );
}
