"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const role = (session?.user as any)?.role;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s an overview of your evaluation system
        </p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Departments"
              value={stats.departments?.length || 0}
              color="bg-blue-50 text-blue-700"
            />
            <StatCard
              label="Total Employees"
              value={stats.departments?.reduce((s: number, d: any) => s + d.employeeCount, 0) || 0}
              color="bg-green-50 text-green-700"
            />
            <StatCard
              label="Skills Tracked"
              value={stats.skillAverages?.length || 0}
              color="bg-purple-50 text-purple-700"
            />
            <StatCard
              label="Evaluations"
              value={stats.employeeSummaries?.filter((e: any) => e.averageScore !== null).length || 0}
              color="bg-orange-50 text-orange-700"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Departments</h3>
              <div className="space-y-3">
                {stats.departments?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{d.name}</span>
                    <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {d.employeeCount} employees
                    </span>
                  </div>
                ))}
                {(!stats.departments || stats.departments.length === 0) && (
                  <p className="text-sm text-gray-400">No departments yet</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Evaluation Summary
              </h3>
              <div className="space-y-3">
                {["Best fit", "Good fit", "Needs improvement", "Not fit for the role"].map(
                  (cat) => {
                    const count = stats.employeeSummaries?.filter(
                      (e: any) => e.suggestion === cat
                    ).length || 0;
                    const colorMap: Record<string, string> = {
                      "Best fit": "text-green-600 bg-green-50",
                      "Good fit": "text-blue-600 bg-blue-50",
                      "Needs improvement": "text-orange-600 bg-orange-50",
                      "Not fit for the role": "text-red-600 bg-red-50",
                    };
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <span className={`text-sm px-3 py-1 rounded-full ${colorMap[cat]}`}>
                          {cat}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
