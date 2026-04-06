"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#ef4444", "#9ca3af"];

export default function ReportsCharts({ data }: { data: any }) {
  const skillChartData = data.skillAverages.map((s: any) => ({
    name: s.name,
    average: parseFloat(s.average.toFixed(2)),
  }));

  const criterionChartData = data.criterionAverages
    .sort((a: any, b: any) => b.average - a.average)
    .slice(0, 10)
    .map((c: any) => ({
      name: c.name,
      average: parseFloat(c.average.toFixed(2)),
      skill: c.skillName,
    }));

  const suggestionCounts = [
    { name: "Best fit", value: data.employeeSummaries.filter((e: any) => e.suggestion === "Best fit").length },
    { name: "Good fit", value: data.employeeSummaries.filter((e: any) => e.suggestion === "Good fit").length },
    { name: "Needs improvement", value: data.employeeSummaries.filter((e: any) => e.suggestion === "Needs improvement").length },
    { name: "Not fit", value: data.employeeSummaries.filter((e: any) => e.suggestion === "Not fit for the role").length },
    { name: "Not evaluated", value: data.employeeSummaries.filter((e: any) => e.suggestion === "Not evaluated").length },
  ].filter((s) => s.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Skill Averages */}
      {skillChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Average Score per Skill</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={12} tick={{ fill: "#64748b" }} />
              <YAxis domain={[0, 5]} fontSize={12} tick={{ fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Suggestion Distribution */}
      {suggestionCounts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Evaluation Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={suggestionCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {suggestionCounts.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Criterion Averages */}
      {criterionChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Top Criteria Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={criterionChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 5]} fontSize={12} tick={{ fill: "#64748b" }} />
              <YAxis type="category" dataKey="name" fontSize={12} tick={{ fill: "#64748b" }} width={150} />
              <Tooltip formatter={(value: any, name: any, props: any) => [value, `${props.payload.skill}`]} />
              <Bar dataKey="average" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {skillChartData.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-400 text-sm">
          No scoring data available yet. Start evaluating employees to see charts.
        </div>
      )}
    </div>
  );
}
