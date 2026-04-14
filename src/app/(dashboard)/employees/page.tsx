"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal";
import { useLanguage } from "@/components/LanguageProvider";

interface Department { id: string; name: string; }
interface Employee { id: string; name: string; jobTitle: string; joinDate: string; departmentId: string; department: Department; }

export default function EmployeesPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const role = (session?.user as any)?.role;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: "", jobTitle: "", joinDate: "", departmentId: "" });
  const [deptName, setDeptName] = useState("");
  const [filterDept, setFilterDept] = useState("");

  const load = () => {
    fetch("/api/employees").then((r) => r.json()).then(setEmployees);
    fetch("/api/departments").then((r) => r.json()).then(setDepartments);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/employees", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowModal(false); setEditing(null); setForm({ name: "", jobTitle: "", joinDate: "", departmentId: "" }); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.empDeleteConfirm)) return;
    await fetch("/api/employees", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const handleAddDept = async () => {
    if (!deptName.trim()) return;
    await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: deptName }) });
    setDeptName(""); setShowDeptModal(false); load();
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ name: emp.name, jobTitle: emp.jobTitle, joinDate: emp.joinDate.split("T")[0], departmentId: emp.departmentId });
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", jobTitle: "", joinDate: "", departmentId: departments[0]?.id || "" });
    setShowModal(true);
  };

  const filtered = filterDept ? employees.filter((e) => e.departmentId === filterDept) : employees;

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <div className="flex gap-3">
          {role === "admin" && (
            <button onClick={() => setShowDeptModal(true)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              {t.empAddDepartment}
            </button>
          )}
          <button onClick={openNew} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {t.empAddEmployee}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">{t.empAllDepartments}</option>
          {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.empName}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.empJobTitle}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.empDepartment}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.empJoinDate}</th>
              <th className="text-end px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.jobTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.department.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(emp.joinDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-end">
                  <button onClick={() => openEdit(emp)} className="text-blue-600 hover:text-blue-800 text-sm me-3">{t.edit}</button>
                  {role === "admin" && (<button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800 text-sm">{t.delete}</button>)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">{t.empNoEmployees}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? t.empEditEmployee : t.empAddEmployeeTitle}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.empName}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.empJobTitle}</label>
            <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.empDepartment}</label>
            <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">{t.empSelectDepartment}</option>
              {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.empJoinDate}</label>
            <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={handleSave} disabled={!form.name || !form.jobTitle || !form.departmentId || !form.joinDate} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {editing ? t.update : t.add} {t.empTitle.toLowerCase().includes("employee") ? "" : ""}
          </button>
        </div>
      </Modal>

      <Modal open={showDeptModal} onClose={() => setShowDeptModal(false)} title={t.empAddDeptTitle}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.empDeptName}</label>
            <input value={deptName} onChange={(e) => setDeptName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t.empDeptPlaceholder} />
          </div>
          <button onClick={handleAddDept} disabled={!deptName.trim()} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {t.add}
          </button>
        </div>
      </Modal>
    </div>
  );
}
