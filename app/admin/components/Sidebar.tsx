"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded-lg font-medium cursor-pointer ${
      pathname === path
        ? "bg-rose-600 text-white"
        : "text-gray-700 hover:bg-rose-100"
    }`;

  function logout() {
    document.cookie = "admin-auth=; Max-Age=0; path=/;";
    router.push("/admin-login");
  }

  return (
    <aside className="w-56 bg-white border-r h-screen p-4 space-y-4 shadow-sm">
      <h2 className="text-2xl font-bold text-rose-600 mb-4 text-center">
        Admin
      </h2>

      <nav className="space-y-2">
        <button
          className={linkClasses("/admin")}
          onClick={() => router.push("/admin")}
        >
          Dashboard
        </button>

        <button
          className={linkClasses("/admin/customers")}
          onClick={() => router.push("/admin/customers")}
        >
          Customers
        </button>

        <button
          className={linkClasses("/admin/visits")}
          onClick={() => router.push("/admin/visits")}
        >
          Visits
        </button>

        <button
          className={linkClasses("/admin/logs")}
          onClick={() => router.push("/admin/logs")}
        >
          Logs
        </button>

        <button
          className={linkClasses("/admin/settings")}
          onClick={() => router.push("/admin/settings")}
        >
          Point Settings
        </button>
      </nav>

      <hr />

      <button
        onClick={logout}
        className="block w-full text-left px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-100"
      >
        Logout
      </button>
    </aside>
  );
}

