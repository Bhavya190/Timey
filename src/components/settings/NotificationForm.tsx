// src/components/settings/NotificationForm.tsx
"use client";

import { FormEvent, useState, ChangeEvent } from "react";
import { SettingsApi, NotificationPayload } from "@/lib/settings";

export default function NotificationForm() {
  const [form, setForm] = useState<NotificationPayload>({
    email: true,
    weeklyReport: false,
    securityAlerts: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await SettingsApi.updateNotifications(form);
      setMessage("Notification preferences saved.");
    } catch (err: any) {
      setError(err.message || "Failed to update notifications");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <ToggleRow
          label="Email notifications"
          description="Receive important updates and announcements."
          name="email"
          checked={form.email}
          onChange={handleChange}
        />
        <ToggleRow
          label="Weekly report"
          description="Get a weekly summary of time and tasks."
          name="weeklyReport"
          checked={form.weeklyReport}
          onChange={handleChange}
        />
        <ToggleRow
          label="Security alerts"
          description="Be notified about sign-ins and security events."
          name="securityAlerts"
          checked={form.securityAlerts}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {message && (
          <p className="text-xs text-emerald-500">{message}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </form>
  );
}

type ToggleRowProps = {
  label: string;
  description: string;
  name: keyof NotificationPayload;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function ToggleRow({
  label,
  description,
  name,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/60 px-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <label className="inline-flex items-center gap-2">
        <span className="sr-only">{label}</span>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer hidden"
        />
        <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted peer-checked:bg-emerald-500 transition-colors">
          <span className="inline-block h-4 w-4 rounded-full bg-background shadow transform transition-transform translate-x-0 peer-checked:translate-x-4" />
        </span>
      </label>
    </div>
  );
}
