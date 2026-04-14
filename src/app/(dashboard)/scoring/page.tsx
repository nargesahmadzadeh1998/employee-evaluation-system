"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { getSuggestion, getSuggestionBg } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export default function ScoringPage() {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [data, setData] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState<any>(null);
  const [modalSkill, setModalSkill] = useState<any>(null);
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number | null>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/departments").then((r) => r.json()).then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) setSelectedDept(depts[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedDept) fetch(`/api/scores?departmentId=${selectedDept}`).then((r) => r.json()).then(setData);
  }, [selectedDept]);

  const getSkillsForJobTitle = (jobTitle: string) => {
    if (!data?.skills) return [];
    return data.skills.filter((s: any) => s.jobTitleLinks.some((jt: any) => jt.jobTitle === jobTitle));
  };

  const getSkillAverage = (employee: any, skill: any): number | null => {
    const criteriaIds = skill.criteria.map((c: any) => c.id);
    const relevantScores = employee.scores.filter((s: any) => criteriaIds.includes(s.criterionId) && s.value !== null);
    if (relevantScores.length === 0) return null;
    return relevantScores.reduce((sum: number, s: any) => sum + s.value, 0) / relevantScores.length;
  };

  const getOverallAverage = (employee: any): number | null => {
    const validScores = employee.scores.filter((s: any) => s.value !== null);
    if (validScores.length === 0) return null;
    return validScores.reduce((sum: number, s: any) => sum + s.value, 0) / validScores.length;
  };

  const translateSuggestion = (avg: number | null) => {
    const s = getSuggestion(avg);
    const labelMap: Record<string, string> = {
      "Not evaluated": t.sugNotEvaluated, "Not fit for the role": t.sugNotFit,
      "Needs improvement": t.sugNeedsImprovement, "Good fit": t.sugGoodFit, "Best fit": t.sugBestFit,
    };
    return { ...s, label: labelMap[s.label] || s.label };
  };

  const openScoring = (employee: any, skill: any) => {
    setModalEmployee(employee); setModalSkill(skill);
    const scores: Record<string, number | null> = {};
    for (const criterion of skill.criteria) {
      const existing = employee.scores.find((s: any) => s.criterionId === criterion.id);
      scores[criterion.id] = existing ? existing.value : null;
    }
    setCriteriaScores(scores); setModalOpen(true);
  };

  const handleSaveScores = async () => {
    setSaving(true);
    const scores = Object.entries(criteriaScores).map(([criterionId, value]) => ({ criterionId, value }));
    await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeId: modalEmployee.id, scores }) });
    const res = await fetch(`/api/scores?departmentId=${selectedDept}`);
    setData(await res.json()); setSaving(false); setModalOpen(false);
  };

  const allSkills = data?.employees
    ? Array.from(new Set(data.employees.flatMap((e: any) => getSkillsForJobTitle(e.jobTitle).map((s: any) => s.id))))
        .map((id) => data.skills.find((s: any) => s.id === id)).filter(Boolean)
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.scoreTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{t.scoreDescription}</p>
      </div>
      <div className="mb-6">
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">{t.scoreSelectDept}</option>
          {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
        </select>
      </div>

      {data?.employees && data.employees.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-start px-4 py-3 text-xs font-medium text-gray-500 uppercase sticky start-0 bg-gray-50 min-w-[180px]">{t.scoreEmployee}</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase min-w-[100px]">{t.scoreJobTitle}</th>
                {allSkills.map((skill: any) => (<th key={skill.id} className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase min-w-[120px]">{skill.name}</th>))}
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase min-w-[100px]">{t.scoreOverall}</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase min-w-[160px]">{t.scoreSuggestion}</th>
              </tr>
            </thead>
            <tbody>
              {data.employees.map((emp: any) => {
                const empSkills = getSkillsForJobTitle(emp.jobTitle);
                const overall = getOverallAverage(emp);
                const suggestion = translateSuggestion(overall);
                const bgClass = getSuggestionBg(overall);
                return (
                  <tr key={emp.id} className={`border-b border-gray-100 ${bgClass}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky start-0" style={{ backgroundColor: "inherit" }}>{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">{emp.jobTitle}</td>
                    {allSkills.map((skill: any) => {
                      const hasSkill = empSkills.some((s: any) => s.id === skill.id);
                      if (!hasSkill) return <td key={skill.id} className="px-4 py-3 text-center text-gray-300 text-sm">—</td>;
                      const avg = getSkillAverage(emp, skill);
                      return (
                        <td key={skill.id} className="px-4 py-3 text-center">
                          <button onClick={() => openScoring(emp, skill)} className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-lg text-sm font-medium transition hover:ring-2 hover:ring-blue-300 bg-white border border-gray-200">
                            {avg !== null ? avg.toFixed(1) : t.scoreBtn}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center text-sm font-bold">{overall !== null ? overall.toFixed(2) : "—"}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-xs font-medium px-3 py-1 rounded-full ${suggestion.color}`}>{suggestion.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : selectedDept ? <div className="text-center py-12 text-gray-400 text-sm">{t.scoreNoEmployees}</div> : null}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${modalSkill?.name} — ${modalEmployee?.name}`} wide>
        {modalSkill && (
          <div className="space-y-4">
            {modalSkill.description && <p className="text-sm text-gray-500 mb-4">{modalSkill.description}</p>}
            {modalSkill.criteria.map((criterion: any) => (
              <div key={criterion.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{criterion.name}</p>
                  {criterion.description && <p className="text-xs text-gray-500">{criterion.description}</p>}
                </div>
                <select value={criteriaScores[criterion.id] === null ? "na" : criteriaScores[criterion.id] ?? "na"}
                  onChange={(e) => { const val = e.target.value === "na" ? null : parseInt(e.target.value); setCriteriaScores({ ...criteriaScores, [criterion.id]: val }); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]">
                  <option value="na">{t.scoreNotApplicable}</option>
                  <option value="1">{t.scorePoor}</option>
                  <option value="2">{t.scoreBelowAvg}</option>
                  <option value="3">{t.scoreAverage}</option>
                  <option value="4">{t.scoreGood}</option>
                  <option value="5">{t.scoreExcellent}</option>
                </select>
              </div>
            ))}
            <button onClick={handleSaveScores} disabled={saving} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition mt-4">
              {saving ? t.scoreSaving : t.scoreSaveScores}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
