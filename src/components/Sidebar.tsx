"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/employees", label: "Employees", icon: "👤" },
  { href: "/skills", label: "Skills & Criteria", icon: "🎯" },
  { href: "/scoring", label: "Scoring", icon: "📝" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/team", label: "Team", icon: "👥", adminOnly: true },
  { href: "/profile", label: "Profile", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">EvalSystem</h1>
        <p className="text-xs text-gray-500 mt-1">Employee Evaluation</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || role === "admin")
          .map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
