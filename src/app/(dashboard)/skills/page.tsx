"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useLanguage } from "@/components/LanguageProvider";

interface Criterion { id?: string; name: string; description: string; }
interface Skill { id: string; name: string; description: string; criteria: Criterion[]; jobTitleLinks: { jobTitle: string }[]; }

export default function SkillsPage() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({ name: "", description: "", criteria: [{ name: "", description: "" }] as Criterion[], jobTitles: [""] as string[] });
  const [employees, setEmployees] = useState<any[]>([]);

  const load = () => {
    fetch("/api/skills").then((r) => r.json()).then(setSkills);
    fetch("/api/employees").then((r) => r.json()).then(setEmployees);
  };
  useEffect(() => { load(); }, []);

  const existingJobTitles = Array.from(new Set(employees.map((e: any) => e.jobTitle)));

  const openNew = () => { setEditing(null); setForm({ name: "", description: "", criteria: [{ name: "", description: "" }], jobTitles: [""] }); setShowModal(true); };
  const openEdit = (skill: Skill) => {
    setEditing(skill);
    setForm({
      name: skill.name, description: skill.description || "",
      criteria: skill.criteria.length > 0 ? skill.criteria.map((c) => ({ name: c.name, description: c.description || "" })) : [{ name: "", description: "" }],
      jobTitles: skill.jobTitleLinks.length > 0 ? skill.jobTitleLinks.map((jt) => jt.jobTitle) : [""],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const validCriteria = form.criteria.filter((c) => c.name.trim());
    const validJobTitles = form.jobTitles.filter((jt) => jt.trim());
    const method = editing ? "PUT" : "POST";
    const body = editing
      ? { id: editing.id, name: form.name, description: form.description, criteria: validCriteria, jobTitles: validJobTitles }
      : { name: form.name, description: form.description, criteria: validCriteria, jobTitles: validJobTitles };
    await fetch("/api/skills", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowModal(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.skillDeleteConfirm)) return;
    await fetch("/api/skills", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const addCriterion = () => setForm({ ...form, criteria: [...form.criteria, { name: "", description: "" }] });
  const removeCriterion = (idx: number) => setForm({ ...form, criteria: form.criteria.filter((_, i) => i !== idx) });
  const updateCriterion = (idx: number, field: string, value: string) => { const updated = [...form.criteria]; (updated[idx] as any)[field] = value; setForm({ ...form, criteria: updated }); };
  const addJobTitle = () => setForm({ ...form, jobTitles: [...form.jobTitles, ""] });
  const removeJobTitle = (idx: number) => setForm({ ...form, jobTitles: form.jobTitles.filter((_, i) => i !== idx) });
  const updateJobTitle = (idx: number, value: string) => { const updated = [...form.jobTitles]; updated[idx] = value; setForm({ ...form, jobTitles: updated }); };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button onClick={openNew} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{t.skillAddSkill}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{skill.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openEdit(skill)} className="text-blue-600 hover:text-blue-800 text-sm">{t.edit}</button>
                <button onClick={() => handleDelete(skill.id)} className="text-red-600 hover:text-red-800 text-sm">{t.delete}</button>
              </div>
            </div>
            {skill.description && <p className="text-sm text-gray-500 mb-3">{skill.description}</p>}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase mb-2">{t.skillCriteria}</p>
              <div className="space-y-1">
                {skill.criteria.map((c) => (<div key={c.id} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span><span>{c.name}</span></div>))}
                {skill.criteria.length === 0 && <p className="text-sm text-gray-400 italic">{t.skillNoCriteria}</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-2">{t.skillJobTitles}</p>
              <div className="flex flex-wrap gap-1.5">
                {skill.jobTitleLinks.map((jt) => (<span key={jt.jobTitle} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{jt.jobTitle}</span>))}
                {skill.jobTitleLinks.length === 0 && <p className="text-sm text-gray-400 italic">{t.skillNoJobTitles}</p>}
              </div>
            </div>
          </div>
        ))}
        {skills.length === 0 && <div className="col-span-full text-center py-12 text-gray-400 text-sm">{t.skillNoSkills}</div>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? t.skillEditSkill : t.skillAddSkillTitle} wide>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.skillName}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t.skillNamePlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.skillDescriptionLabel}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t.skillEvalCriteria}</label>
              <button onClick={addCriterion} className="text-sm text-blue-600 hover:text-blue-800">+ {t.add}</button>
            </div>
            <div className="space-y-3">
              {form.criteria.map((c, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input value={c.name} onChange={(e) => updateCriterion(idx, "name", e.target.value)} placeholder={t.skillCriterionName} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input value={c.description} onChange={(e) => updateCriterion(idx, "description", e.target.value)} placeholder={t.skillCriterionDesc} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  {form.criteria.length > 1 && <button onClick={() => removeCriterion(idx)} className="text-red-400 hover:text-red-600 mt-2">&times;</button>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t.skillAssignedJobTitles}</label>
              <button onClick={addJobTitle} className="text-sm text-blue-600 hover:text-blue-800">+ {t.add}</button>
            </div>
            <div className="space-y-2">
              {form.jobTitles.map((jt, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input list="jobTitlesList" value={jt} onChange={(e) => updateJobTitle(idx, e.target.value)} placeholder={t.skillJobTitlePlaceholder} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  {form.jobTitles.length > 1 && <button onClick={() => removeJobTitle(idx)} className="text-red-400 hover:text-red-600">&times;</button>}
                </div>
              ))}
            </div>
            <datalist id="jobTitlesList">{existingJobTitles.map((jt) => (<option key={jt} value={jt} />))}</datalist>
          </div>
          <button onClick={handleSave} disabled={!form.name.trim()} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {editing ? t.skillUpdateSkill : t.skillCreateSkill}
          </button>
        </div>
      </Modal>
    </div>
  );
}
