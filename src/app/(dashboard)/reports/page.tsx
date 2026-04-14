"use client";

import { useEffect, useState } from "react";
import { getSuggestion } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import dynamic from "next/dynamic";

const RechartsCharts = dynamic(() => import("@/components/ReportsCharts"), { ssr: false });

export default function ReportsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [filterDept, setFilterDept] = useState("");
  const [filterSuggestion, setFilterSuggestion] = useState("");

  useEffect(() => {
    const params = filterDept ? `?departmentId=${filterDept}` : "";
    fetch(`/api/reports${params}`).then((r) => r.json()).then(setData);
  }, [filterDept]);

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const filteredEmployees = filterSuggestion
    ? data.employeeSummaries.filter((e: any) => e.suggestion === filterSuggestion)
    : data.employeeSummaries;

  const translateSuggestion = (label: string) => {
    const map: Record<string, string> = {
      "Best fit": t.sugBestFit, "Good fit": t.sugGoodFit,
      "Needs improvement": t.sugNeedsImprovement, "Not fit for the role": t.sugNotFit, "Not evaluated": t.sugNotEvaluated,
    };
    return map[label] || label;
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">{t.repAllDepartments}</option>
          {data.departments.map((d: any) => (<option key={d.id} value={d.id}>{d.name}</option>))}
        </select>
        <select value={filterSuggestion} onChange={(e) => setFilterSuggestion(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">{t.repAllCategories}</option>
          <option value="Best fit">{t.sugBestFit}</option>
          <option value="Good fit">{t.sugGoodFit}</option>
          <option value="Needs improvement">{t.sugNeedsImprovement}</option>
          <option value="Not fit for the role">{t.sugNotFit}</option>
          <option value="Not evaluated">{t.sugNotEvaluated}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {data.departments.map((d: any) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{d.name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{d.employeeCount}</p>
            <p className="text-xs text-gray-400">{t.dashEmployees}</p>
          </div>
        ))}
      </div>

      <RechartsCharts data={data} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{t.repEmployeeEvals} ({filteredEmployees.length})</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.empName}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.empDepartment}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.empJobTitle}</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.repAvgScore}</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.scoreSuggestion}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp: any) => {
              const suggestion = getSuggestion(emp.averageScore);
              return (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{emp.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{emp.jobTitle}</td>
                  <td className="px-6 py-3 text-sm text-center font-medium">{emp.averageScore !== null ? emp.averageScore.toFixed(2) : "—"}</td>
                  <td className="px-6 py-3 text-center"><span className={`text-xs font-medium px-3 py-1 rounded-full ${suggestion.color}`}>{translateSuggestion(suggestion.label)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
