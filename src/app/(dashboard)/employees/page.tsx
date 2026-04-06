"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal";

interface Department {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  joinDate: string;
  departmentId: string;
  department: Department;
}

export default function EmployeesPage() {
  const { data: session } = useSession();
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
    await fetch("/api/employees", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setShowModal(false);
    setEditing(null);
    setForm({ name: "", jobTitle: "", joinDate: "", departmentId: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    await fetch("/api/employees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const handleAddDept = async () => {
    if (!deptName.trim()) return;
    await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deptName }),
    });
    setDeptName("");
    setShowDeptModal(false);
    load();
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      jobTitle: emp.jobTitle,
      joinDate: emp.joinDate.split("T")[0],
      departmentId: emp.departmentId,
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", jobTitle: "", joinDate: "", departmentId: departments[0]?.id || "" });
    setShowModal(true);
  };

  const filtered = filterDept
    ? employees.filter((e) => e.departmentId === filterDept)
    : employees;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Manage new joiner employees</p>
        </div>
        <div className="flex gap-3">
          {role === "admin" && (
            <button
              onClick={() => setShowDeptModal(true)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              + Department
            </button>
          )}
          <button
            onClick={openNew}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="mb-4">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Join Date</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.jobTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.department.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(emp.joinDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(emp)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
                  {role === "admin" && (
                    <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No employees found. Add your first employee to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Employee" : "Add Employee"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
            <input
              type="date"
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!form.name || !form.jobTitle || !form.departmentId || !form.joinDate}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {editing ? "Update" : "Add"} Employee
          </button>
        </div>
      </Modal>

      <Modal open={showDeptModal} onClose={() => setShowDeptModal(false)} title="Add Department">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Engineering"
            />
          </div>
          <button
            onClick={handleAddDept}
            disabled={!deptName.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Add Department
          </button>
        </div>
      </Modal>
    </div>
  );
}
