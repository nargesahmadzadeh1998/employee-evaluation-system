"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label={t.dashDepartments} value={stats.departments?.length || 0} />
            <StatCard label={t.dashTotalEmployees} value={stats.departments?.reduce((s: number, d: any) => s + d.employeeCount, 0) || 0} />
            <StatCard label={t.dashSkillsTracked} value={stats.skillAverages?.length || 0} />
            <StatCard label={t.dashEvaluations} value={stats.employeeSummaries?.filter((e: any) => e.averageScore !== null).length || 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t.dashDepartments}</h3>
              <div className="space-y-3">
                {stats.departments?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{d.name}</span>
                    <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {d.employeeCount} {t.dashEmployees}
                    </span>
                  </div>
                ))}
                {(!stats.departments || stats.departments.length === 0) && (
                  <p className="text-sm text-gray-400">{t.dashNoDepts}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t.dashEvalSummary}</h3>
              <div className="space-y-3">
                {[
                  { key: "Best fit", label: t.sugBestFit, color: "text-green-600 bg-green-50" },
                  { key: "Good fit", label: t.sugGoodFit, color: "text-blue-600 bg-blue-50" },
                  { key: "Needs improvement", label: t.sugNeedsImprovement, color: "text-orange-600 bg-orange-50" },
                  { key: "Not fit for the role", label: t.sugNotFit, color: "text-red-600 bg-red-50" },
                ].map(({ key, label, color }) => {
                  const count = stats.employeeSummaries?.filter((e: any) => e.suggestion === key).length || 0;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className={`text-sm px-3 py-1 rounded-full ${color}`}>{label}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
