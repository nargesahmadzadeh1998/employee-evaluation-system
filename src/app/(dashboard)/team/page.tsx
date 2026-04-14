"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal";
import { useLanguage } from "@/components/LanguageProvider";

export default function TeamPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "evaluator", departmentIds: [] as string[] });
  const [inviteLink, setInviteLink] = useState("");

  const load = () => {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
    fetch("/api/invitations").then((r) => r.json()).then(setInvitations);
    fetch("/api/departments").then((r) => r.json()).then(setDepartments);
  };
  useEffect(() => { load(); }, []);

  const handleInvite = async () => {
    const res = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inviteForm) });
    const data = await res.json();
    if (data.inviteLink) setInviteLink(data.inviteLink);
    load();
  };

  const toggleDept = (deptId: string) => {
    const current = inviteForm.departmentIds;
    setInviteForm({ ...inviteForm, departmentIds: current.includes(deptId) ? current.filter((id) => id !== deptId) : [...current, deptId] });
  };

  if ((session?.user as any)?.role !== "admin") {
    return <div className="text-center py-20 text-gray-400">{t.teamNoPermission}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.teamTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.teamDescription}</p>
        </div>
        <button onClick={() => { setShowInvite(true); setInviteLink(""); setInviteForm({ email: "", role: "evaluator", departmentIds: [] }); }}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{t.teamInviteUser}</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-200"><h3 className="font-semibold text-gray-900">{t.teamUsers} ({users.length})</h3></div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamName}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamEmail}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamRole}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamDeptAccess}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                  {user.role === "admin" ? t.teamAdmin : t.teamEvaluator}</span></td>
                <td className="px-6 py-3"><div className="flex flex-wrap gap-1">
                  {user.role === "admin" ? <span className="text-xs text-gray-400">{t.teamAllDepts}</span> :
                    user.departmentAccess?.map((da: any) => (<span key={da.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{da.department.name}</span>))}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200"><h3 className="font-semibold text-gray-900">{t.teamInvitations} ({invitations.length})</h3></div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamEmail}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamRole}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamStatus}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamInvitedBy}</th>
              <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.teamDate}</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">{inv.email}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{inv.role === "admin" ? t.teamAdmin : t.teamEvaluator}</td>
                <td className="px-6 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${inv.accepted ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {inv.accepted ? t.teamAccepted : t.teamPending}</span></td>
                <td className="px-6 py-3 text-sm text-gray-600">{inv.invitedBy?.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{new Date(inv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {invitations.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">{t.teamNoInvitations}</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title={t.teamInviteTitle}>
        {inviteLink ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-sm">{t.teamInviteSuccess}</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.teamInviteLink}</label>
              <div className="flex gap-2">
                <input readOnly value={inviteLink} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition">{t.copy}</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">{t.teamInviteLinkNote}</p>
            </div>
            <button onClick={() => { setShowInvite(false); setInviteLink(""); }} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">{t.done}</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.teamEmail}</label>
              <input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.teamRole}</label>
              <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="evaluator">{t.teamEvaluator}</option>
                <option value="admin">{t.teamAdmin}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.teamDeptAccess}</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {departments.map((dept) => (
                  <label key={dept.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={inviteForm.departmentIds.includes(dept.id)} onChange={() => toggleDept(dept.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    {dept.name}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleInvite} disabled={!inviteForm.email} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">{t.teamSendInvitation}</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
