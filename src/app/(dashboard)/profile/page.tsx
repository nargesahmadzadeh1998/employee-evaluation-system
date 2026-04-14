"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/LanguageProvider";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { t } = useLanguage();
  const userId = (session?.user as any)?.id;
  const [form, setForm] = useState({ name: "", phone: "", jobTitle: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) setForm((prev) => ({ ...prev, name: session.user?.name || "" }));
  }, [session]);

  const handleSave = async () => {
    if (form.password && form.password !== form.confirmPassword) { setMessage(t.profPasswordMismatch); return; }
    setLoading(true); setMessage("");
    const body: any = { id: userId, name: form.name };
    if (form.phone) body.phone = form.phone;
    if (form.jobTitle) body.jobTitle = form.jobTitle;
    if (form.password) body.password = form.password;
    const res = await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setMessage(t.profUpdateSuccess); setForm((prev) => ({ ...prev, password: "", confirmPassword: "" })); await update(); }
    else setMessage(t.profUpdateFail);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.profTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{t.profDescription}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message === t.profUpdateSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</div>
        )}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profEmail}</label>
            <input type="email" value={session?.user?.email || ""} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profName}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profPhone}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t.profPhonePlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.profJobTitle}</label>
            <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">{t.profChangePassword}</h3>
            <div className="space-y-3">
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t.profNewPassword} />
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t.profConfirmPassword} />
            </div>
          </div>
          <button onClick={handleSave} disabled={loading || !form.name} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? t.profSaving : t.profSaveChanges}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-2">{t.profAccountInfo}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">{t.profRole}</span><span className="font-medium capitalize">{(session?.user as any)?.role}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">{t.profUserId}</span><span className="font-mono text-xs text-gray-400">{userId}</span></div>
        </div>
      </div>
    </div>
  );
}
